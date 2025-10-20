import { type NextRequest, NextResponse } from "next/server"
import { reindexKnowledgeBase, getKnowledgeBaseStats } from "@/lib/admin-utils"

function checkAdminAccess(req: NextRequest) {
  const adminToken = req.headers.get("x-admin-token")
  const expectedToken = process.env.ADMIN_TOKEN || "admin-secret"
  return adminToken === expectedToken || process.env.NODE_ENV === "development"
}

export async function POST(req: NextRequest) {
  if (!checkAdminAccess(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await reindexKnowledgeBase()
    const stats = await getKnowledgeBaseStats()
    return NextResponse.json({ success: true, stats })
  } catch (error) {
    return NextResponse.json({ error: "Reindex failed" }, { status: 500 })
  }
}
