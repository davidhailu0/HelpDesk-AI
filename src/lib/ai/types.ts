export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  /** Optional cap on the number of tokens the model may generate. */
  maxOutputTokens?: number;
  /** Optional abort signal (supported by fetch-based providers). */
  signal?: AbortSignal;
}

export interface ChatProvider {
  /** Provider name, e.g. "gemini" or "openai". */
  readonly name: string;
  /** Model identifier being used. */
  readonly model: string;
  /** Yields text deltas as the model generates them. */
  stream(request: ChatRequest): AsyncGenerator<string>;
  /** Returns the full completion text. */
  generate(request: ChatRequest): Promise<string>;
}

export interface EmbeddingProvider {
  readonly name: string;
  readonly model: string;
  /** Returns one embedding vector per input text, in the same order. */
  embed(texts: string[]): Promise<number[][]>;
}

export type ProviderName = "gemini" | "openai";

export interface ProviderConfig {
  provider: ProviderName;
  /** API key. For "openai" it is required; for "gemini" it is optional (SDK falls back to GEMINI_API_KEY). */
  apiKey?: string;
  /** Base URL for "openai"-compatible endpoints, e.g. https://api.openai.com/v1 */
  baseUrl?: string;
  model: string;
}
