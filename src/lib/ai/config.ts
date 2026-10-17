import type { ProviderConfig, ProviderName } from "./types";

const OPENAI_DEFAULT_BASE_URL = "https://api.openai.com/v1";

/** Defaults used when the corresponding env var is not set. */
const MODEL_DEFAULTS: Record<ProviderName, string> = {
  gemini: "gemini-2.5-flash",
  openai: "gpt-4o-mini",
};

const EMBEDDING_MODEL_DEFAULTS: Record<ProviderName, string> = {
  gemini: "text-embedding-004",
  openai: "text-embedding-3-small",
};

function parseProvider(value: string | undefined, varName: string): ProviderName {
  const normalized = (value || "").trim().toLowerCase();
  if (!normalized) return "gemini";
  if (normalized === "gemini" || normalized === "openai") return normalized;
  throw new Error(
    `Unsupported ${varName} "${value}". Supported providers: "gemini", "openai" (any OpenAI-compatible endpoint).`
  );
}

function requireApiKey(apiKey: string | undefined, provider: ProviderName, varName: string): string | undefined {
  if (provider === "openai" && !apiKey) {
    throw new Error(
      `${varName} is required when the provider is "${provider}" but is not set. ` +
        `Add it to your .env.local file.`
    );
  }
  return apiKey;
}

/**
 * Resolves the chat/completion provider configuration from environment variables.
 *
 *   AI_PROVIDER  - "gemini" (default) or "openai" (any OpenAI-compatible endpoint)
 *   AI_API_KEY   - API key (required for "openai"; optional for "gemini", which
 *                  falls back to GEMINI_API_KEY read by the SDK)
 *   AI_BASE_URL  - API endpoint for "openai", default https://api.openai.com/v1
 *   AI_MODEL     - model name, defaults per provider
 */
export function getChatConfig(): ProviderConfig {
  const provider = parseProvider(process.env.AI_PROVIDER, "AI_PROVIDER");
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || undefined;
  const baseUrl = process.env.AI_BASE_URL || (provider === "openai" ? OPENAI_DEFAULT_BASE_URL : undefined);
  const model = process.env.AI_MODEL || MODEL_DEFAULTS[provider];

  return {
    provider,
    apiKey: requireApiKey(apiKey, provider, "AI_API_KEY"),
    baseUrl,
    model,
  };
}

/**
 * Resolves the embedding provider configuration from environment variables.
 * Independent from the chat provider so you can mix and match.
 *
 *   EMBEDDING_PROVIDER  - "gemini" (default) or "openai"
 *   EMBEDDING_API_KEY   - API key; falls back to AI_API_KEY when both providers
 *                         match, then to GEMINI_API_KEY for "gemini"
 *   EMBEDDING_BASE_URL  - API endpoint for "openai"
 *   EMBEDDING_MODEL     - model name, defaults per provider
 */
export function getEmbeddingConfig(): ProviderConfig {
  const provider = parseProvider(process.env.EMBEDDING_PROVIDER, "EMBEDDING_PROVIDER");
  const chatProvider = parseProvider(process.env.AI_PROVIDER, "AI_PROVIDER");

  let apiKey =
    process.env.EMBEDDING_API_KEY ||
    (provider === chatProvider ? process.env.AI_API_KEY : undefined) ||
    (provider === "gemini" ? process.env.GEMINI_API_KEY : undefined) ||
    undefined;

  const baseUrl =
    process.env.EMBEDDING_BASE_URL || (provider === "openai" ? OPENAI_DEFAULT_BASE_URL : undefined);
  const model = process.env.EMBEDDING_MODEL || EMBEDDING_MODEL_DEFAULTS[provider];

  return {
    provider,
    apiKey: requireApiKey(apiKey, provider, "EMBEDDING_API_KEY"),
    baseUrl,
    model,
  };
}
