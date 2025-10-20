import { type NextRequest, NextResponse } from "next/server"
import { saveFile } from "@/lib/admin-utils"

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
    const formData = await req.formData()
    const files = formData.getAll("files") as File[]

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    // Validate files
    for (const file of files) {
      if (!file.name.endsWith(".md")) {
        return NextResponse.json({ error: "Only .md files are allowed" }, { status: 400 })
      }
      if (file.size > 1024 * 1024) {
        // 1MB limit
        return NextResponse.json({ error: "File too large (max 1MB)" }, { status: 400 })
      }
    }

    // Save files
    for (const file of files) {
      const content = await file.text()
      await saveFile(file.name, content)
    }

    return NextResponse.json({ success: true, count: files.length })
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
