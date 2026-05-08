import WebSocket from "ws";
import { CallState, ListingData, TwilioMediaMessage } from "../types/index.js";
import { createDeepgramStream, sendAudioToDeepgram } from "../services/deepgram.js";
import { getAgentReply, extractLeadFromHistory } from "../services/deepseek.js";
import { synthesizeSpeech, audioBufferToBase64Chunks } from "../services/elevenlabs.js";
import { buildContextSummary, mergeLeadData, isLeadQualified } from "../agent/qualification.js";
import { OUTBOUND_SYSTEM_PROMPT } from "../agent/prompts.js";
import { createLead } from "../crm/client.js";

const INACTIVITY_WARNING_MS = 30_000;
const INACTIVITY_HANGUP_MS = 60_000;

function buildOutboundGreeting(listing?: ListingData): string {
  if (!listing?.morada && !listing?.tipologia) {
    return "Bom dia! Fala com a assistente da Propzy. Estou a ligar sobre um imóvel disponível que pode ser do seu interesse. Tem um momento?";
  }
  const desc = [listing.tipologia, listing.morada, listing.preco].filter(Boolean).join(", ");
  return `Bom dia! Fala com a assistente da Propzy. Estou a ligar sobre ${desc}. Tem um momento para lhe dar mais informações?`;
}

export function handleCallWebSocket(ws: WebSocket): void {
  let state: CallState | null = null;
  let transcriptBuffer = "";
  let isProcessing = false;
  let ttsController: AbortController | null = null;
  let silenceWarningTimer: NodeJS.Timeout | null = null;
  let silenceHangupTimer: NodeJS.Timeout | null = null;

  function resetInactivityTimers(): void {
    if (silenceWarningTimer) clearTimeout(silenceWarningTimer);
    if (silenceHangupTimer) clearTimeout(silenceHangupTimer);

    silenceWarningTimer = setTimeout(async () => {
      if (!state || isProcessing) return;
      const warning = "Continua por aí? Estou aqui se precisar de alguma informação.";
      isProcessing = true;
      ttsController = new AbortController();
      await sendBotReply(warning, ttsController.signal);
      ttsController = null;
      isProcessing = false;
    }, INACTIVITY_WARNING_MS);

    silenceHangupTimer = setTimeout(() => {
      console.log("[Timeout] Chamada encerrada por inatividade");
      ws.close();
    }, INACTIVITY_HANGUP_MS);
  }

  function clearInactivityTimers(): void {
    if (silenceWarningTimer) clearTimeout(silenceWarningTimer);
    if (silenceHangupTimer) clearTimeout(silenceHangupTimer);
    silenceWarningTimer = null;
    silenceHangupTimer = null;
  }

  async function saveLead(): Promise<void> {
    if (!state || state.leadSaved || Object.keys(state.lead).length === 0) return;
    state.leadSaved = true;
    console.log(`[Call ${state.callSid}] A guardar lead no CRM (${state.callDirection})...`);
    const fonte = state.callDirection === "outbound" ? "chamada_outbound" : "chamada_inbound";
    await createLead(state.lead, state.callerPhone, transcriptBuffer, fonte);
  }

  async function sendBotReply(text: string, signal: AbortSignal): Promise<void> {
    if (!state) return;
    state.isBotSpeaking = true;
    try {
      const audioBuffer = await synthesizeSpeech(text);
      if (signal.aborted) return;

      const chunks = audioBufferToBase64Chunks(audioBuffer);
      ws.send(JSON.stringify({ event: "clear", streamSid: state.streamSid }));

      for (const chunk of chunks) {
        if (signal.aborted) break;
        ws.send(
          JSON.stringify({
            event: "media",
            streamSid: state.streamSid,
            media: { payload: chunk },
          })
        );
      }
    } catch (err) {
      if (!signal.aborted) console.error("[TTS] Erro ao sintetizar voz:", err);
    } finally {
      state.isBotSpeaking = false;
    }
  }

  function getSystemPrompt(): string {
    if (!state || state.callDirection === "inbound") return "";
    const l = state.listingData;
    return OUTBOUND_SYSTEM_PROMPT(l?.morada, l?.tipologia, l?.preco, l?.descricao);
  }

  const deepgramConn = createDeepgramStream(async (transcript: string) => {
    if (!state || !transcript.trim()) return;

    // Barge-in: cliente fala enquanto bot está a falar
    if (state.isBotSpeaking && ttsController) {
      ttsController.abort();
      state.isBotSpeaking = false;
      isProcessing = false;
      ws.send(JSON.stringify({ event: "clear", streamSid: state.streamSid }));
    }

    if (isProcessing) return;

    isProcessing = true;
    resetInactivityTimers();
    console.log(`[Call ${state.callSid}] Cliente: ${transcript}`);

    state.history.push({ role: "user", content: transcript });
    transcriptBuffer += `Cliente: ${transcript}\n`;

    try {
      const contextSummary = buildContextSummary(state);
      const qualifiedClosing =
        isLeadQualified(state.lead) && state.stage !== "closing"
          ? `\n\n[O lead está qualificado. Faz o encerramento da chamada.]`
          : "";

      const outboundSystemOverride = getSystemPrompt();
      const reply = await getAgentReply(
        state.history,
        contextSummary + qualifiedClosing,
        outboundSystemOverride || undefined
      );

      state.history.push({ role: "assistant", content: reply });
      transcriptBuffer += `Agente: ${reply}\n`;
      console.log(`[Call ${state.callSid}] Agente: ${reply}`);

      // Aguardar extração para evitar race condition
      const extracted = await extractLeadFromHistory(state.history);
      state.lead = mergeLeadData(state.lead, extracted);

      if (isLeadQualified(state.lead)) {
        state.stage = "closing";
      }

      ttsController = new AbortController();
      await sendBotReply(reply, ttsController.signal);
      ttsController = null;

      // Se chegou ao fecho, guardar lead e encerrar chamada
      if (state.stage === "closing" && !state.leadSaved) {
        await saveLead();
      }
    } catch (err) {
      console.error(`[Call ${state.callSid}] Erro no pipeline:`, err);
    } finally {
      isProcessing = false;
    }
  });

  ws.on("message", async (data: WebSocket.Data) => {
    let msg: TwilioMediaMessage;
    try {
      msg = JSON.parse(data.toString()) as TwilioMediaMessage;
    } catch {
      return;
    }

    switch (msg.event) {
      case "start": {
        const callSid = msg.start?.callSid ?? "unknown";
        const streamSid = msg.start?.streamSid ?? "";
        const params = msg.start?.customParameters ?? {};
        const direction = params["direction"] === "outbound" ? "outbound" : "inbound";

        let listingData: ListingData | undefined;
        if (params["listing"]) {
          try { listingData = JSON.parse(params["listing"]) as ListingData; } catch { /* ignorar */ }
        }

        state = {
          callSid,
          streamSid,
          callerPhone: params["From"] ?? "unknown",
          callDirection: direction,
          listingData,
          stage: "greeting",
          lead: {},
          history: [],
          isBotSpeaking: false,
          leadSaved: false,
        };
        console.log(`[Call ${callSid}] Chamada ${direction} de/para ${state.callerPhone}`);
        resetInactivityTimers();

        const greeting = direction === "outbound"
          ? buildOutboundGreeting(listingData)
          : "Olá, obrigado por contactar a Propzy! Sou a assistente virtual. Em que posso ajudá-lo hoje?";

        state.history.push({ role: "assistant", content: greeting });
        transcriptBuffer += `Agente: ${greeting}\n`;
        ttsController = new AbortController();
        await sendBotReply(greeting, ttsController.signal);
        ttsController = null;
        break;
      }

      case "media": {
        if (msg.media?.track === "inbound" && msg.media.payload) {
          sendAudioToDeepgram(deepgramConn, msg.media.payload);
        }
        break;
      }

      case "stop": {
        clearInactivityTimers();
        deepgramConn.finish();
        await saveLead();
        break;
      }
    }
  });

  ws.on("close", async () => {
    clearInactivityTimers();
    deepgramConn.finish();
    await saveLead();
  });

  ws.on("error", (err) => {
    console.error("[WebSocket] Erro:", err);
    clearInactivityTimers();
    deepgramConn.finish();
  });
}
