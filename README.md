# 🤖 HelpDesk Admin RAG System

This project provides an **Chat Panel** and **Admin Panel** for interacting with document, managing a **Retrieval-Augmented Generation (RAG)** knowledge base, built using [Next.js](https://nextjs.org), Tailwind CSS, and the Google Gemini API. It allows administrators to upload documents, re-index the knowledge base, and test retrieval performance.

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

This project requires your Gemini API key to access the embedding and generation models.

Create a file named **`.env.local`** in the project root and add the following variable:

| Variable             | Description                             | Example Value                             |
| :------------------- | :-------------------------------------- | :---------------------------------------- |
| **`GEMINI_API_KEY`** | Your API key for the Google Gemini API. | `AIzaSyAeStEj126KNXZBiicV6AUfiCd0-bHmCO0` |

## 💡 Design Choices and Architecture

The core of this project is a robust RAG architecture designed for performance and relevance in a helpdesk context.

### 1. Retrieval Strategy (`retriever.ts` & `admin-util.ts`)

- **Offline Indexing:** Documents (Markdown files in `src/data`) are loaded into a global in-memory index (`INDEX`) via `loadKnowledgeBase`.

- **Vector Embeddings:** The **`text-embedding-004`** model is used via `ensureEmbeddings` to create vector representations for all document snippets. This process is optimized to only re-embed content when necessary.

- **Similarity Search:** The system uses **cosine similarity** to compare the user's question embedding against all snippet embeddings. The `retrieveRelevantSnippets` function returns the top $K$ most semantically relevant chunks of text.

- **Top-K Selection:** The top 3-5 most relevant snippets are retrieved to serve as **context** for the LLM.

### 2. Prompt Engineering and Generation

- **Contextual Grounding (RAG):** The selected snippets are injected directly into the LLM prompt inside the `/api/eval` route's `generateAnswer` function.

- **Prompt Instructions:** The prompt instructs the LLM to act as a "help desk assistant" and, crucially, to **use ONLY the provided context** to answer the question.

- **Model:** The **`gemini-2.5-flash`** model is used for generation, offering a strong balance of speed, capability, and cost-effectiveness.

### 3. Streaming (User Interface)

- While the evaluation route is synchronous, the primary user-facing chat component is typically designed to use **API streaming**.

- Streaming provides a better user experience by allowing the LLM's response to appear word-by-word, which reduces perceived latency for the user.
