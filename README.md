# 🤖 HelpDesk Admin RAG System

This project provides an **Chat Panel** and **Admin Panel** for interacting with document, managing a **Retrieval-Augmented Generation (RAG)** knowledge base, built using [Next.js](https://nextjs.org) and Tailwind CSS. The model layer is provider-agnostic: it works with Google Gemini or any OpenAI-compatible API (OpenAI, OpenRouter, Groq, DeepSeek, Together, Mistral, Ollama, LM Studio, ...) configured via environment variables. It allows administrators to upload documents, re-index the knowledge base, and test retrieval performance.

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Installation and Setup

1.  **Clone the Repository:**

    ```bash
    git clone [https://github.com/davidhailu0/HelpDesk-AI.git]
    cd [helpdesk-ai]
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

    The application will be accessible at `http://localhost:3000`.

## 🔑 Environment Variables

The AI provider is selected entirely through environment variables. Copy `.env.example` to **`.env.local`** in the project root and fill in the values you need.

### Chat / generation

| Variable        | Description                                                                                        | Default                         |
| :-------------- | :------------------------------------------------------------------------------------------------- | :------------------------------ |
| **`AI_PROVIDER`** | `"gemini"` or `"openai"` (any OpenAI-compatible endpoint).                                       | `gemini`                        |
| **`AI_API_KEY`**  | API key for the chat provider. Required for `openai`; for `gemini` you may use `GEMINI_API_KEY`. | —                               |
| **`AI_BASE_URL`** | API endpoint base URL (used when `AI_PROVIDER=openai`).                                           | `https://api.openai.com/v1`     |
| **`AI_MODEL`**    | Model name to use.                                                                                | `gemini-2.5-flash` (gemini), `gpt-4o-mini` (openai) |

### Embeddings (independent from the chat provider)

| Variable                | Description                                                            | Default                                        |
| :---------------------- | :--------------------------------------------------------------------- | :--------------------------------------------- |
| **`EMBEDDING_PROVIDER`**  | `"gemini"` or `"openai"`.                                            | `gemini`                                       |
| **`EMBEDDING_API_KEY`**   | API key. Falls back to `AI_API_KEY` (same provider), then `GEMINI_API_KEY`. | —                                        |
| **`EMBEDDING_BASE_URL`**  | API endpoint base URL (used when `EMBEDDING_PROVIDER=openai`).        | `https://api.openai.com/v1`                    |
| **`EMBEDDING_MODEL`**     | Embedding model name.                                                 | `text-embedding-004` (gemini), `text-embedding-3-small` (openai) |

### Examples

OpenAI (chat + embeddings):

```bash
AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
```

OpenRouter (chat + embeddings from a single key):

```bash
AI_PROVIDER=openai
AI_API_KEY=sk-or-...
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=openai/gpt-4o-mini
EMBEDDING_PROVIDER=openai
EMBEDDING_BASE_URL=https://openrouter.ai/api/v1
EMBEDDING_MODEL=openai/text-embedding-3-small
```

Mixing providers also works — e.g. OpenRouter chat with Gemini embeddings (`EMBEDDING_PROVIDER=gemini` + `GEMINI_API_KEY`), since the embedding config is fully independent.

Local Ollama (no API key required by Ollama, but the variable must be set to any non-empty value if `AI_PROVIDER=openai`):

```bash
AI_PROVIDER=openai
AI_API_KEY=ollama
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=llama3.1
EMBEDDING_PROVIDER=openai
EMBEDDING_BASE_URL=http://localhost:11434/v1
EMBEDDING_MODEL=nomic-embed-text
```

Gemini (default provider):

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=...
AI_MODEL=gemini-2.5-flash
```

## 💡 Design Choices and Architecture

The core of this project is a robust RAG architecture designed for performance and relevance in a helpdesk context.

### 1. Retrieval Strategy (`retriever.ts` & `admin-util.ts`)

- **Offline Indexing:** Documents (Markdown files in `src/data`) are loaded into a global in-memory index (`INDEX`) via `loadKnowledgeBase`.

- **Vector Embeddings:** Embeddings are created via `ensureEmbeddings` using the embedding provider selected by the `EMBEDDING_*` variables (Gemini **`text-embedding-004`** by default). This process is optimized to only re-embed content when necessary.

- **Similarity Search:** The system uses **cosine similarity** to compare the user's question embedding against all snippet embeddings. The `retrieveRelevantSnippets` function returns the top $K$ most semantically relevant chunks of text.

- **Top-K Selection:** The top 3-5 most relevant snippets are retrieved to serve as **context** for the LLM.

### 2. Prompt Engineering and Generation

- **Contextual Grounding (RAG):** The selected snippets are injected directly into the LLM prompt inside the `/api/eval` route's `generateAnswer` function.

- **Prompt Instructions:** The prompt instructs the LLM to act as a "help desk assistant" and, crucially, to **use ONLY the provided context** to answer the question.

- **Model:** Generation uses the model selected by `AI_PROVIDER` / `AI_MODEL` (the **`gemini-2.5-flash`** model by default), offering a strong balance of speed, capability, and cost-effectiveness.

### 3. Streaming (User Interface)

- While the evaluation route is synchronous, the primary user-facing chat component is typically designed to use **API streaming**.

- Streaming provides a better user experience by allowing the LLM's response to appear word-by-word, which reduces perceived latency for the user.

### 4. Provider Abstraction (`src/lib/ai`)

- **`types.ts`** — provider-neutral `ChatProvider` / `EmbeddingProvider` interfaces.

- **`config.ts`** — reads and validates the `AI_*` and `EMBEDDING_*` environment variables.

- **`gemini.ts`** — native Google Gemini adapter (chat streaming + embeddings).

- **`openai.ts`** — adapter for any OpenAI-compatible chat/completions and embeddings endpoint (SSE streaming parsed from plain `fetch`, no extra SDK required).

- **`index.ts`** — `getChatProvider()` / `getEmbeddingProvider()` factories used by the API routes and the retriever.
