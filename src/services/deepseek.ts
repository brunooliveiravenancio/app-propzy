import OpenAI from "openai";
import { ConversationMessage } from "../types/index.js";
import { SYSTEM_PROMPT, EXTRACT_LEAD_PROMPT } from "../agent/prompts.js";
import { LeadData } from "../types/index.js";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://api.deepseek.com",
});

export async function getAgentReply(
  history: ConversationMessage[],
  contextSummary: string
): Promise<string> {
  const systemWithContext = SYSTEM_PROMPT + contextSummary;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemWithContext },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages,
    max_tokens: 150,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() ?? "Desculpe, não percebi. Pode repetir?";
}

export async function extractLeadFromHistory(history: ConversationMessage[]): Promise<Partial<LeadData>> {
  const transcript = history
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "Cliente" : "Agente"}: ${m.content}`)
    .join("\n");

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "user", content: EXTRACT_LEAD_PROMPT(transcript) },
    ],
    max_tokens: 300,
    temperature: 0,
    response_format: { type: "json_object" },
  });

  try {
    return JSON.parse(response.choices[0]?.message?.content ?? "{}") as Partial<LeadData>;
  } catch {
    return {};
  }
}
