import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { deleteFile } from "@/lib/admin-utils"

function checkAdminAccess(req: NextRequest) {
  const adminToken = req.headers.get("x-admin-token")
  const expectedToken = process.env.ADMIN_TOKEN || "admin-secret"
  return adminToken === expectedToken || process.env.NODE_ENV === "development"
}

/**
 * Returns the raw markdown of a knowledge base file — used by the citation
 * modal to show the source section behind an answer.
 * Public on purpose: this is the same content the chat already surfaces.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const safeName = path.basename(filename)

  if (!safeName.endsWith(".md")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const filePath = path.join(process.cwd(), "src", "data", safeName)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  try {
    const content = fs.readFileSync(filePath, "utf8")
    return NextResponse.json({ filename: safeName, content })
  } catch {
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  if (!checkAdminAccess(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { filename } = await params
    await deleteFile(filename)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}
