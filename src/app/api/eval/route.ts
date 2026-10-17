import { NextResponse } from "next/server";
import { retrieveSnippets } from "@/lib/admin-utils";
import { getKnowledgeBaseStats } from "@/lib/admin-utils";
import { getChatProvider } from "@/lib/ai";

async function generateAnswer(
  query: string,
  snippets: { content: string; source: string }[]
): Promise<string> {
  if (snippets.length === 0) {
    return "I could not find relevant information in the knowledge base to answer that question.";
  }

  const context = snippets
    .map((s) => `Source File (${s.source}):\n---\n${s.content}`)
    .join("\n\n");

  const prompt = `You are an internal help desk assistant. Use ONLY the provided context to answer the user's question. If the context does not contain the answer, state clearly that you cannot answer based on the available documents.

CONTEXT:
---
${context}
---

USER QUESTION: "${query}"

FINAL ANSWER:`;

  try {
    const response = await getChatProvider().generate({
      messages: [{ role: "user", content: prompt }],
    });
    return (
      response.trim() ||
      "I could not find relevant information in the knowledge base to answer that question."
    );
  } catch (error) {
    console.error("Error generating content:", error);
    return "Generation failed due to an API error.";
  }
}

async function logEvaluationResult(result: any) {
  const stats = await getKnowledgeBaseStats();
  console.log("-----------------------------------------");
  console.log(`[EVALUATION LOG] ${result.timestamp}`);
  console.log(
    `Knowledge Base Stats: ${stats.totalFiles} Files, ${stats.totalSnippets} Snippets`
  );
  console.log(`Question: ${result.question}`);
  console.log(`Sources Used: ${result.sources.join(", ")}`);
  console.log("-----------------------------------------");
}

interface EvalCase {
  question: string;
}

const evaluationQuestions: EvalCase[] = [
  { question: "What is the policy for requesting vacation time?" },
  { question: "What Pricing Plans are available?" },
  { question: "What are the office hours and locations?" },
];

/**
 * Handles POST requests to run the knowledge base evaluation.
 * @param req The incoming NextRequest (unused, but required by signature)
 * @returns A NextResponse object with the evaluation results.
 */
export async function POST(req: Request) {
  const results: any[] = [];
  let successCount = 0;

  try {
    for (const testCase of evaluationQuestions) {
      const { question } = testCase;

      // 1. Retrieval
      const snippets = await retrieveSnippets(question);

      // 2. Generation
      const answer = await generateAnswer(question, snippets);

      // 3. Extract unique sources for logging
      const sourcesUsed = [...new Set(snippets.map((s) => s.source))];

      const result = {
        question: question,
        answer: answer,
        sources: sourcesUsed,
        timestamp: new Date().toISOString(),
      };

      results.push(result);

      // 4. Logging
      await logEvaluationResult(result);

      successCount++;
    }

    // Return the response using NextResponse
    return NextResponse.json(
      {
        message: `${successCount} evaluation tests completed and results logged.`,
        evaluation_count: successCount,
        results: results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Evaluation failed:", error);
    // Return a 500 status response
    return NextResponse.json(
      {
        message: "Evaluation failed due to an internal error.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
