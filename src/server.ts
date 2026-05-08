import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import webhookRouter from "./routes/webhook.js";
import outboundRouter from "./routes/outbound.js";
import { handleCallWebSocket } from "./ws/callHandler.js";

const REQUIRED_ENV = [
  "BASE_URL",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "DEEPGRAM_API_KEY",
  "DEEPSEEK_API_KEY",
  "ELEVENLABS_API_KEY",
  "ELEVENLABS_VOICE_ID",
  "OUTBOUND_API_KEY",
];

const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[Server] Variáveis de ambiente em falta: ${missing.join(", ")}`);
  process.exit(1);
}

const PORT = process.env.PORT ?? 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: ["text/csv", "text/plain"] }));

app.use("/webhook", webhookRouter);
app.use("/", outboundRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const server = createServer(app);

const wss = new WebSocketServer({ server, path: "/ws/call" });
wss.on("connection", (ws) => {
  console.log("[WSS] Nova conexão WebSocket");
  handleCallWebSocket(ws);
});

server.listen(PORT, () => {
  console.log(`[Server] A correr em http://localhost:${PORT}`);
  console.log(`[Server] Webhook Twilio: POST ${process.env.BASE_URL}/webhook/inbound`);
  console.log(`[Server] WebSocket: wss://${process.env.BASE_URL?.replace(/https?:\/\//, "")}/ws/call`);
});
