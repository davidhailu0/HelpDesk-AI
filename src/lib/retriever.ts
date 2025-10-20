import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
const EMBEDDING_MODEL = "text-embedding-004";

export interface Snippet {
  filename: string;
  section: number;
  text: string;
  embedding?: number[];
}

export let INDEX: Snippet[] = [];

const dataDir = path.join(process.cwd(), "src", "data");

export function clearKnowledgeBase() {
  INDEX = [];
}

export async function loadKnowledgeBase() {
  if (INDEX.length) return INDEX;

  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), "utf8");
    const sections = content
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (let i = 0; i < sections.length; i++) {
      INDEX.push({ filename: file, section: i + 1, text: sections[i] });
    }
  }

  return INDEX;
}

async function ensureEmbeddings() {
  if (INDEX.length === 0) await loadKnowledgeBase();
  const missing = INDEX.filter((s) => !s.embedding);
  if (missing.length === 0) return;

  const textsToEmbed = missing.map((s) => s.text);

  if (textsToEmbed.length === 0) return;

  try {
    const res = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: textsToEmbed,
    });

    const embeddings = res.embeddings?.map((e) => e.values);

    for (let i = 0; i < missing.length; i++) {
      missing[i].embedding = embeddings?.[i];
    }
  } catch (error) {
    console.error("Error generating batch embeddings:", error);
    throw error;
  }
}

function cosine(a: number[], b: number[]) {
  const dot = a.reduce((sum, x, i) => sum + x * b[i], 0);
  const normA = Math.sqrt(a.reduce((s, x) => s + x * x, 0));
  const normB = Math.sqrt(b.reduce((s, x) => s + x * x, 0));
  return dot / (normA * normB);
}

export async function retrieveRelevantSnippets(query: string, topK = 3) {
  await ensureEmbeddings();

  const queryEmbedResponse = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: [query],
  });

  const queryEmbed = queryEmbedResponse.embeddings?.[0]?.values;

  const scored = INDEX.map((s) => ({
    ...s,
    score: cosine(queryEmbed || [], s.embedding!),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
