import {
  createClient,
  LiveTranscriptionEvents,
  ListenLiveClient,
} from "@deepgram/sdk";

export type TranscriptCallback = (text: string) => void;

export function createDeepgramStream(onTranscript: TranscriptCallback): ListenLiveClient {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

  const connection = deepgram.listen.live({
    encoding: "mulaw",
    sample_rate: 8000,
    language: "pt-PT",
    model: "nova-2",
    smart_format: true,
    endpointing: 400,
    interim_results: false,
    utterance_end_ms: 1000,
  });

  connection.on(LiveTranscriptionEvents.Transcript, (data) => {
    const transcript = data.channel?.alternatives?.[0]?.transcript?.trim();
    if (transcript && data.is_final) {
      onTranscript(transcript);
    }
  });

  connection.on(LiveTranscriptionEvents.Error, (err) => {
    console.error("[Deepgram] Erro:", err);
  });

  return connection;
}

export function sendAudioToDeepgram(connection: ListenLiveClient, payload: string): void {
  const buffer = Buffer.from(payload, "base64");
  connection.send(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer);
}
