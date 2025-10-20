import { type NextRequest, NextResponse } from "next/server"
import { deleteFile } from "@/lib/admin-utils"

function checkAdminAccess(req: NextRequest) {
  const adminToken = req.headers.get("x-admin-token")
  const expectedToken = process.env.ADMIN_TOKEN || "admin-secret"
  return adminToken === expectedToken || process.env.NODE_ENV === "development"
}

export async function DELETE(req: NextRequest, { params }: { params: { filename: string } }) {
  if (!checkAdminAccess(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const filename = params.filename
    await deleteFile(filename)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}
