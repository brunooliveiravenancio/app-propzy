import { Router, Request, Response, NextFunction } from "express";
import twilio from "twilio";
import { ListingData } from "../types/index.js";

const router = Router();
const VoiceResponse = twilio.twiml.VoiceResponse;

// Store temporário callSid → listingData (em produção substituir por Redis)
const pendingCalls = new Map<string, ListingData>();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers["x-api-key"];
  if (!key || key !== process.env.OUTBOUND_API_KEY) {
    res.status(401).json({ error: "API key inválida ou em falta" });
    return;
  }
  next();
}

function validateTwilioSignature(req: Request, res: Response, next: NextFunction): void {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) { next(); return; }
  const signature = req.headers["x-twilio-signature"] as string;
  const url = `${process.env.BASE_URL}${req.path}`;
  if (!twilio.validateRequest(authToken, signature, url, req.body)) {
    res.status(403).send("Forbidden");
    return;
  }
  next();
}

function buildOutboundTwiml(callerPhone: string, callSid: string): string {
  const baseUrl = process.env.BASE_URL!;
  const wsUrl = `${baseUrl.replace("https://", "wss://").replace("http://", "ws://")}/ws/call`;
  const listing = pendingCalls.get(callSid);
  pendingCalls.delete(callSid);

  const twiml = new VoiceResponse();
  const stream = twiml.connect().stream({ url: wsUrl, name: "audio_stream" });
  stream.parameter({ name: "From", value: callerPhone });
  stream.parameter({ name: "direction", value: "outbound" });
  if (listing) {
    stream.parameter({ name: "listing", value: JSON.stringify(listing) });
  }
  return twiml.toString();
}

// POST /api/outbound/dial — inicia uma chamada individual
router.post("/api/outbound/dial", requireApiKey, async (req: Request, res: Response) => {
  const { to, listing } = req.body as { to: string; listing?: ListingData };

  if (!to || !/^\+\d{7,15}$/.test(to)) {
    res.status(400).json({ error: "Número inválido. Use formato E.164 (ex: +351912345678)" });
    return;
  }

  try {
    const call = await twilioClient.calls.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER!,
      url: `${process.env.BASE_URL}/webhook/outbound`,
      statusCallback: `${process.env.BASE_URL}/webhook/outbound/status`,
      statusCallbackMethod: "POST",
    });

    if (listing) pendingCalls.set(call.sid, listing);
    console.log(`[Outbound] Chamada iniciada para ${to} — CallSid: ${call.sid}`);
    res.json({ callSid: call.sid, status: call.status });
  } catch (err) {
    console.error("[Outbound] Erro ao criar chamada:", err);
    res.status(500).json({ error: "Falha ao iniciar chamada" });
  }
});

// POST /api/outbound/campaign — inicia campanha a partir de CSV (text/csv ou text/plain)
// CSV esperado: telefone,morada,preco,tipologia (com header na primeira linha)
router.post("/api/outbound/campaign", requireApiKey, async (req: Request, res: Response) => {
  const body = req.body as string;
  if (!body || typeof body !== "string") {
    res.status(400).json({ error: "Envie o CSV no body com Content-Type: text/csv" });
    return;
  }

  const lines = body.trim().split(/\r?\n/);
  if (lines.length < 2) {
    res.status(400).json({ error: "CSV precisa de pelo menos uma linha de dados após o header" });
    return;
  }

  // Ignorar header
  const dataLines = lines.slice(1);
  const errors: string[] = [];
  let queued = 0;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    const [telefone, morada, preco, tipologia] = line.split(",").map((v) => v.trim());

    if (!telefone || !/^\+\d{7,15}$/.test(telefone)) {
      errors.push(`Linha ${i + 2}: número inválido "${telefone}"`);
      continue;
    }

    // Delay de 5s entre chamadas para não sobrecarregar Twilio
    await new Promise((r) => setTimeout(r, 5000 * i));

    try {
      const listing: ListingData = { morada, preco, tipologia };
      const call = await twilioClient.calls.create({
        to: telefone,
        from: process.env.TWILIO_PHONE_NUMBER!,
        url: `${process.env.BASE_URL}/webhook/outbound`,
        statusCallback: `${process.env.BASE_URL}/webhook/outbound/status`,
        statusCallbackMethod: "POST",
      });
      pendingCalls.set(call.sid, listing);
      console.log(`[Campaign] Chamada ${queued + 1} iniciada para ${telefone} — ${call.sid}`);
      queued++;
    } catch (err) {
      errors.push(`Linha ${i + 2}: falha ao ligar para ${telefone}`);
      console.error(`[Campaign] Erro na linha ${i + 2}:`, err);
    }
  }

  res.json({ total: dataLines.filter((l) => l.trim()).length, queued, errors });
});

// POST /webhook/outbound — TwiML enviado quando o cliente atende
router.post("/webhook/outbound", validateTwilioSignature, (req: Request, res: Response) => {
  const callSid = req.body.CallSid as string;
  const callerPhone = req.body.To as string; // número do cliente (Twilio preenche To com o destinatário)
  res.type("text/xml").send(buildOutboundTwiml(callerPhone, callSid));
});

// POST /webhook/outbound/status — callback de estado da chamada
router.post("/webhook/outbound/status", (req: Request, res: Response) => {
  const { CallSid, CallStatus, To, Duration } = req.body as Record<string, string>;
  console.log(`[Outbound Status] ${CallSid} → ${CallStatus} | Para: ${To} | Duração: ${Duration ?? "—"}s`);
  res.sendStatus(200);
});

export default router;
