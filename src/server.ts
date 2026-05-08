import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import webhookRouter from "./routes/webhook.js";
import { handleCallWebSocket } from "./ws/callHandler.js";

const PORT = process.env.PORT ?? 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/webhook", webhookRouter);

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
