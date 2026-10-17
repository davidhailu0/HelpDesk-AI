import type { ChatProvider, EmbeddingProvider, ProviderConfig } from "./types";

/** Batch size for embedding requests (keeps payloads reasonable). */
const EMBEDDING_BATCH_SIZE = 100;

function endpoint(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path}`;
}

function headers(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

async function readError(res: Response): Promise<Error> {
  let detail = "";
  try {
    detail = await res.text();
  } catch {
    // ignore body read failures
  }
  return new Error(`AI provider request failed (${res.status} ${res.statusText}): ${detail.slice(0, 500)}`);
}

/**
 * Parses a Server-Sent Events response body, yielding the JSON payload of
 * each `data:` line (skipping `[DONE]` and comment lines).
 */
async function* parseSSE(stream: ReadableStream<Uint8Array>): AsyncGenerator<any> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? ""; // keep the (possibly incomplete) last line

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          yield JSON.parse(data);
        } catch {
          // Tolerate malformed keep-alive fragments.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Adapter for any OpenAI-compatible chat completions API: OpenAI itself,
 * OpenRouter, Groq, DeepSeek, Together, Mistral, Ollama, LM Studio, vLLM, etc.
 * Point AI_BASE_URL at the provider's base endpoint (e.g. https://api.openai.com/v1).
 */
export function createOpenAIChatProvider(config: ProviderConfig): ChatProvider {
  const baseUrl = config.baseUrl || "https://api.openai.com/v1";
  const apiKey = config.apiKey!;

  function body(request: { messages: { role: string; content: string }[]; maxOutputTokens?: number }, stream: boolean) {
    return {
      model: config.model,
      messages: request.messages,
      ...(request.maxOutputTokens ? { max_tokens: request.maxOutputTokens } : {}),
      stream,
    };
  }

  return {
    name: config.provider,
    model: config.model,

    async *stream(request) {
      const res = await fetch(endpoint(baseUrl, "chat/completions"), {
        method: "POST",
        headers: headers(apiKey),
        body: JSON.stringify(body(request, true)),
        signal: request.signal,
      });

      if (!res.ok || !res.body) throw await readError(res);

      for await (const event of parseSSE(res.body)) {
        const delta = event?.choices?.[0]?.delta?.content;
        if (delta) yield delta as string;
      }
    },

    async generate(request) {
      const res = await fetch(endpoint(baseUrl, "chat/completions"), {
        method: "POST",
        headers: headers(apiKey),
        body: JSON.stringify(body(request, false)),
        signal: request.signal,
      });

      if (!res.ok) throw await readError(res);

      const json = await res.json();
      return json?.choices?.[0]?.message?.content ?? "";
    },
  };
}

/**
 * Adapter for any OpenAI-compatible embeddings endpoint.
 * Point EMBEDDING_BASE_URL at the provider's base endpoint.
 */
export function createOpenAIEmbeddingProvider(config: ProviderConfig): EmbeddingProvider {
  const baseUrl = config.baseUrl || "https://api.openai.com/v1";
  const apiKey = config.apiKey!;

  return {
    name: config.provider,
    model: config.model,

    async embed(texts: string[]): Promise<number[][]> {
      const results: number[][] = [];

      for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
        const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);

        const res = await fetch(endpoint(baseUrl, "embeddings"), {
          method: "POST",
          headers: headers(apiKey),
          body: JSON.stringify({ model: config.model, input: batch }),
        });

        if (!res.ok) throw await readError(res);

        const json = await res.json();
        const embeddings: { index: number; embedding: number[] }[] = json?.data ?? [];

        // The API does not guarantee response order; restore input order.
        embeddings.sort((a, b) => a.index - b.index);
        const vectors = embeddings.map((e) => e.embedding);

        if (vectors.length !== batch.length) {
          throw new Error(
            `Embedding model "${config.model}" returned ${vectors.length} embeddings for ${batch.length} inputs.`
          );
        }
        results.push(...vectors);
      }

      return results;
    },
  };
}
