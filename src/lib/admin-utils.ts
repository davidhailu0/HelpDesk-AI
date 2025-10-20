import fs from "fs";
import path from "path";
import {
  Snippet,
  INDEX,
  loadKnowledgeBase,
  retrieveRelevantSnippets,
  clearKnowledgeBase,
} from "@/lib/retriever";

const dataDir = path.join(process.cwd(), "src", "data");

interface FileInfo {
  name: string;
  size: number;
  lastUpdated: string;
}

interface Stats {
  totalFiles: number;
  totalSnippets: number;
  lastReindexTime: string;
}

interface RetrievedSnippet {
  source: string;
  section: number;
  content: string;
  score: number;
}

let lastReindexTime = new Date().toISOString();

export async function getIndexedFiles(): Promise<FileInfo[]> {
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".md"));

  return files.map((name) => {
    const filePath = path.join(dataDir, name);
    const stats = fs.statSync(filePath);

    return {
      name,
      size: stats.size,
      lastUpdated: stats.mtime.toLocaleDateString(),
    };
  });
}

export async function getKnowledgeBaseStats(): Promise<Stats> {
  await loadKnowledgeBase();

  const totalFiles = fs
    .readdirSync(dataDir)
    .filter((f) => f.endsWith(".md")).length;
  const totalSnippets = INDEX.length;

  return {
    totalFiles,
    totalSnippets,
    lastReindexTime: new Date(lastReindexTime).toLocaleString(),
  };
}

export async function saveFile(
  filename: string,
  content: string
): Promise<void> {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, content, "utf8");

  await reindexKnowledgeBase();
}

export async function deleteFile(filename: string): Promise<void> {
  const filePath = path.join(dataDir, filename);
  fs.unlinkSync(filePath);

  await reindexKnowledgeBase();
}

export async function reindexKnowledgeBase(): Promise<void> {
  clearKnowledgeBase();

  await loadKnowledgeBase();

  lastReindexTime = new Date().toISOString();
}

export async function retrieveSnippets(
  query: string
): Promise<RetrievedSnippet[]> {
  const scoredSnippets = await retrieveRelevantSnippets(query, 5);

  return scoredSnippets.map((s) => ({
    source: s.filename,
    section: s.section,
    content: s.text,
    score: s.score!,
  }));
}
