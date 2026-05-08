import WebSocket from "ws";
import { CallState, TwilioMediaMessage } from "../types/index.js";
import { createDeepgramStream, sendAudioToDeepgram } from "../services/deepgram.js";
import { getAgentReply, extractLeadFromHistory } from "../services/deepseek.js";
import { synthesizeSpeech, audioBufferToBase64Chunks } from "../services/elevenlabs.js";
import { buildContextSummary, mergeLeadData, isLeadQualified } from "../agent/qualification.js";
import { CLOSING_PROMPT } from "../agent/prompts.js";
import { createLead } from "../crm/client.js";

export function handleCallWebSocket(ws: WebSocket): void {
  let state: CallState | null = null;
  let transcriptBuffer = "";
  let isProcessing = false;

  const deepgramConn = createDeepgramStream(async (transcript: string) => {
    if (!state || isProcessing || state.isBotSpeaking) return;
    if (!transcript.trim()) return;

    isProcessing = true;
    console.log(`[Call ${state.callSid}] Cliente: ${transcript}`);

    state.history.push({ role: "user", content: transcript });
    transcriptBuffer += `Cliente: ${transcript}\n`;

    try {
      const contextSummary = buildContextSummary(state);

      // Se lead está qualificado, usar prompt de fecho
      const qualifiedClosing =
        isLeadQualified(state.lead) && state.stage !== "closing"
          ? `\n\n[O lead está qualificado. Faz o encerramento da chamada.]`
          : "";

      const reply = await getAgentReply(state.history, contextSummary + qualifiedClosing);

      state.history.push({ role: "assistant", content: reply });
      transcriptBuffer += `Agente: ${reply}\n`;

      console.log(`[Call ${state.callSid}] Agente: ${reply}`);

      // Extrair dados do lead em background
      extractLeadFromHistory(state.history).then((extracted) => {
        if (state) {
          state.lead = mergeLeadData(state.lead, extracted);
        }
      });

      // Sintetizar e enviar áudio
      await sendBotReply(ws, state.streamSid, reply);
      state.stage = isLeadQualified(state.lead) ? "closing" : state.stage;
    } catch (err) {
      console.error(`[Call ${state.callSid}] Erro no pipeline:`, err);
    } finally {
      isProcessing = false;
    }
  });

  ws.on("message", async (data: WebSocket.Data) => {
    const msg = JSON.parse(data.toString()) as TwilioMediaMessage;

    switch (msg.event) {
      case "start": {
        const callSid = msg.start?.callSid ?? "unknown";
        const streamSid = msg.start?.streamSid ?? "";
        state = {
          callSid,
          streamSid,
          callerPhone: msg.start?.customParameters?.["From"] ?? "unknown",
          stage: "greeting",
          lead: {},
          history: [],
          isBotSpeaking: false,
        };
        console.log(`[Call ${callSid}] Chamada iniciada`);

        // Saudação inicial
        const greeting = "Olá, obrigado por contactar a Propzy! Sou a assistente virtual. Em que posso ajudá-lo hoje?";
        state.history.push({ role: "assistant", content: greeting });
        transcriptBuffer += `Agente: ${greeting}\n`;
        await sendBotReply(ws, streamSid, greeting);
        break;
      }

      case "media": {
        if (msg.media?.track === "inbound" && msg.media.payload) {
          sendAudioToDeepgram(deepgramConn, msg.media.payload);
        }
        break;
      }

      case "stop": {
        if (state) {
          console.log(`[Call ${state.callSid}] Chamada terminada. A guardar lead...`);
          deepgramConn.finish();
          await createLead(state.lead, state.callerPhone, transcriptBuffer);
        }
        break;
      }
    }
  });

  ws.on("close", async () => {
    deepgramConn.finish();
    if (state?.lead && Object.keys(state.lead).length > 0) {
      await createLead(state.lead, state.callerPhone, transcriptBuffer);
    }
  });

  ws.on("error", (err) => {
    console.error("[WebSocket] Erro:", err);
    deepgramConn.finish();
  });
}

async function sendBotReply(ws: WebSocket, streamSid: string, text: string): Promise<void> {
  try {
    const audioBuffer = await synthesizeSpeech(text);
    const chunks = audioBufferToBase64Chunks(audioBuffer);

    // Limpar buffer de áudio anterior do Twilio
    ws.send(JSON.stringify({ event: "clear", streamSid }));

    for (const chunk of chunks) {
      ws.send(
        JSON.stringify({
          event: "media",
          streamSid,
          media: { payload: chunk },
        })
      );
    }
  } catch (err) {
    console.error("[TTS] Erro ao sintetizar voz:", err);
  }
}
