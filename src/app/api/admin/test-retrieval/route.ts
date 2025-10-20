import { type NextRequest, NextResponse } from "next/server"
import { retrieveSnippets } from "@/lib/admin-utils"

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
    const { query } = await req.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 })
    }

    const snippets = await retrieveSnippets(query)
    return NextResponse.json({ snippets })
  } catch (error) {
    return NextResponse.json({ error: "Retrieval test failed" }, { status: 500 })
  }
}
