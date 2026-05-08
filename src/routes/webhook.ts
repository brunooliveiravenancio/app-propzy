import { Router, Request, Response, NextFunction } from "express";
import twilio from "twilio";

const router = Router();
const VoiceResponse = twilio.twiml.VoiceResponse;

function validateTwilioSignature(req: Request, res: Response, next: NextFunction): void {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    next();
    return;
  }

  const signature = req.headers["x-twilio-signature"] as string;
  const url = `${process.env.BASE_URL}/webhook/inbound`;

  if (!twilio.validateRequest(authToken, signature, url, req.body)) {
    res.status(403).send("Forbidden");
    return;
  }

  next();
}

// POST /webhook/inbound — Twilio chama este endpoint quando recebe uma chamada
router.post("/inbound", validateTwilioSignature, (req: Request, res: Response) => {
  const baseUrl = process.env.BASE_URL!;
  const callerPhone = (req.body.From as string) ?? "";

  const twiml = new VoiceResponse();
  const connect = twiml.connect();
  const stream = connect.stream({
    url: `${baseUrl.replace("https://", "wss://").replace("http://", "ws://")}/ws/call`,
    name: "audio_stream",
  });

  // Passa o número do chamador para o handler WebSocket via customParameters
  stream.parameter({ name: "From", value: callerPhone });

  res.type("text/xml");
  res.send(twiml.toString());
});

export default router;
