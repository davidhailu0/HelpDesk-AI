import { getChatConfig, getEmbeddingConfig } from "./config";
import { createGeminiChatProvider, createGeminiEmbeddingProvider } from "./gemini";
import { createOpenAIChatProvider, createOpenAIEmbeddingProvider } from "./openai";
import type { ChatProvider, EmbeddingProvider } from "./types";

export type {
  ChatMessage,
  ChatProvider,
  ChatRequest,
  ChatRole,
  EmbeddingProvider,
  ProviderConfig,
  ProviderName,
} from "./types";
export { getChatConfig, getEmbeddingConfig } from "./config";

/**
 * Builds the chat provider selected by AI_PROVIDER / AI_MODEL / AI_API_KEY /
 * AI_BASE_URL. Configuration is re-read on every call, so a new provider is
 * created per request (both adapters are lightweight).
 */
export function getChatProvider(): ChatProvider {
  const config = getChatConfig();
  switch (config.provider) {
    case "gemini":
      return createGeminiChatProvider(config);
    case "openai":
      return createOpenAIChatProvider(config);
  }
}

/**
 * Builds the embedding provider selected by the EMBEDDING_* variables.
 * Independent from the chat provider, so embeddings and generation can use
 * different vendors.
 */
export function getEmbeddingProvider(): EmbeddingProvider {
  const config = getEmbeddingConfig();
  switch (config.provider) {
    case "gemini":
      return createGeminiEmbeddingProvider(config);
    case "openai":
      return createOpenAIEmbeddingProvider(config);
  }
}
