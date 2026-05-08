export interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LeadData {
  nome?: string;
  telefone?: string;
  email?: string;
  intencao?: "compra" | "arrendamento" | "ambos";
  tipoImovel?: "apartamento" | "moradia" | "terreno" | "comercial" | "outro";
  zona?: string;
  orcamento?: string;
  prazo?: string;
  observacoes?: string;
}

export type QualificationStage =
  | "greeting"
  | "interest"
  | "property_type"
  | "location"
  | "budget"
  | "timeline"
  | "contact"
  | "closing";

export interface CallState {
  callSid: string;
  streamSid: string;
  callerPhone: string;
  stage: QualificationStage;
  lead: LeadData;
  history: ConversationMessage[];
  isBotSpeaking: boolean;
  leadSaved: boolean;
}

export interface TwilioMediaMessage {
  event: "connected" | "start" | "media" | "stop";
  sequenceNumber?: string;
  streamSid?: string;
  start?: { callSid: string; streamSid: string; customParameters?: Record<string, string> };
  media?: { track: string; chunk: string; timestamp: string; payload: string };
}
