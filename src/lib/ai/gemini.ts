import { GoogleGenAI } from "@google/genai";
import type { ChatMessage, ChatProvider, EmbeddingProvider, ProviderConfig } from "./types";

/** Google's embedContent endpoint accepts up to 100 contents per request. */
const EMBEDDING_BATCH_SIZE = 100;

function createClient(config: ProviderConfig): GoogleGenAI {
  // When apiKey is omitted the SDK falls back to GEMINI_API_KEY / GOOGLE_API_KEY.
  return config.apiKey ? new GoogleGenAI({ apiKey: config.apiKey }) : new GoogleGenAI({});
}

/**
 * Maps provider-neutral messages to Gemini's format.
 * System messages become the single systemInstruction; the rest alternate
 * between "user" and "model" roles.
 */
function toGeminiContents(messages: ChatMessage[]): {
  systemInstruction?: string;
  contents: { role: "user" | "model"; parts: { text: string }[] }[];
} {
  const systemText = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content }],
    }));

  return {
    systemInstruction: systemText || undefined,
    contents,
  };
}

export function createGeminiChatProvider(config: ProviderConfig): ChatProvider {
  const ai = createClient(config);

  return {
    name: config.provider,
    model: config.model,

    async *stream(request) {
      const { systemInstruction, contents } = toGeminiContents(request.messages);

      const stream = await ai.models.generateContentStream({
        model: config.model,
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: request.maxOutputTokens,
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) yield text;
      }
    },

    async generate(request) {
      const { systemInstruction, contents } = toGeminiContents(request.messages);

      const response = await ai.models.generateContent({
        model: config.model,
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: request.maxOutputTokens,
        },
      });

      return response?.text ?? "";
    },
  };
}

export function createGeminiEmbeddingProvider(config: ProviderConfig): EmbeddingProvider {
  const ai = createClient(config);

  return {
    name: config.provider,
    model: config.model,

    async embed(texts: string[]): Promise<number[][]> {
      const results: number[][] = [];

      for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
        const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);

        const res = await ai.models.embedContent({
          model: config.model,
          contents: batch,
        });

        const embeddings = res.embeddings?.map((e) => e.values ?? []) ?? [];
        if (embeddings.length !== batch.length) {
          throw new Error(
            `Gemini embedding model "${config.model}" returned ${embeddings.length} embeddings for ${batch.length} inputs.`
          );
        }
        results.push(...embeddings);
      }

      return results;
    },
  };
}
