import { GoogleGenAI } from "@google/genai";
import { retrieveRelevantSnippets } from "@/lib/retriever";

const ai = new GoogleGenAI({});

export const maxDuration = 30;

interface Citation {
  source: string;
  section: number;
}

function convertToGeminiMessages(messages: any[]): any[] {
  return messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: msg.parts.map((part: any) => {
      return { text: part.text };
    }),
  }));
}

export async function POST(req: Request) {
  const { messages }: { messages: any[] } = await req.json();
  const geminiMessages = convertToGeminiMessages(messages);
  const latestUserMsg =
    messages
      .filter((m) => m.role === "user")
      .pop()
      ?.parts?.map((part: any) => (part.type === "text" ? part.text : ""))
      .join("") || "";

  const snippets = await retrieveRelevantSnippets(latestUserMsg, 3);
  const contextText = snippets
    .map((s) => `[${s.filename} §${s.section}] ${s.text.replace(/\n/g, " ")}`)
    .join("\n\n");

  const systemPrompt = `
You are a helpful HelpDesk AI assistant.
Use only the following context to answer the question. 
If you don’t find the answer here, say “I don’t know; see getting-started.md”

Context:
${contextText}

When you answer, cite your sources like this:
[CITATION: filename.md §section_number]
`;

  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: geminiMessages,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 500,
    },
  });

  let fullResponseText = "";

  const writableStream = new WritableStream({
    write(chunk) {
      fullResponseText += chunk;
    },
    close() {
      const citationRegex = /\[CITATION: ([^\]]+)\]/g;
      const citations: Citation[] = [];
      let match;

      while ((match = citationRegex.exec(fullResponseText)) !== null) {
        const [, citation] = match;
        const [source, section] = citation.split(" §");
        citations.push({
          source: source.trim(),
          section: Number.parseInt(section, 10),
        });
      }

      if (citations.length > 0) {
        console.log("Extracted citations:", citations);
      }
    },
  });

  const { readable, writable } = new TransformStream();

  const clientWriter = writable.getWriter();
  const citationWriter = writableStream.getWriter();

  clientWriter.closed.finally(() => citationWriter.close());

  const abortListener = () => {
    console.log("Client aborted connection. Stopping stream.");
    clientWriter.abort(new Error("Client disconnected"));
  };

  req.signal.addEventListener("abort", abortListener);

  (async () => {
    try {
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          await clientWriter.write(text);
          await citationWriter.write(text);
        }
      }
      await clientWriter.close();
    } catch (e) {
      console.error("Error during streaming:", e);
      clientWriter.abort(e);
    } finally {
      req.signal.removeEventListener("abort", abortListener);
    }
  })();

  return new Response(readable.pipeThrough(new TextEncoderStream()), {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
