import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

// Requer voz PT-PT criada/clonada no dashboard ElevenLabs
// https://elevenlabs.io/voice-lab
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID!;

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const audioStream = await client.textToSpeech.convert(VOICE_ID, {
    text,
    model_id: "eleven_multilingual_v2",
    output_format: "ulaw_8000",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.3,
      use_speaker_boost: true,
    },
  });

  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export function audioBufferToBase64Chunks(buffer: Buffer, chunkSize = 4000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < buffer.length; i += chunkSize) {
    chunks.push(buffer.subarray(i, i + chunkSize).toString("base64"));
  }
  return chunks;
}
