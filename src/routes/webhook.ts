import { Router, Request, Response } from "express";
import twilio from "twilio";

const router = Router();
const VoiceResponse = twilio.twiml.VoiceResponse;

// POST /webhook/inbound — Twilio chama este endpoint quando recebe uma chamada
router.post("/inbound", (req: Request, res: Response) => {
  const baseUrl = process.env.BASE_URL!;
  const twiml = new VoiceResponse();

  const connect = twiml.connect();
  connect.stream({
    url: `${baseUrl.replace("https://", "wss://").replace("http://", "ws://")}/ws/call`,
    // Passa o número do chamador para o handler WebSocket
    name: "audio_stream",
  });

  res.type("text/xml");
  res.send(twiml.toString());
});

export default router;
