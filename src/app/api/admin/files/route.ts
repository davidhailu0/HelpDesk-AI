import { type NextRequest, NextResponse } from "next/server";
import { getKnowledgeBaseStats, getIndexedFiles } from "@/lib/admin-utils";

export async function GET(req: NextRequest) {
  try {
    const files = await getIndexedFiles();
    const stats = await getKnowledgeBaseStats();

    return NextResponse.json({ files, stats });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
