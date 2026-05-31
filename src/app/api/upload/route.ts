import { NextRequest, NextResponse } from "next/server"
import { put } from '@vercel/blob';

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
       return NextResponse.json({ error: "Invalid file type. Only PDF, DOC, and DOCX are allowed." }, { status: 400 })
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
       return NextResponse.json({ error: "File exceeds 10MB limit." }, { status: 400 })
    }

    // Ensure BLOB_READ_WRITE_TOKEN is present
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("Missing BLOB_READ_WRITE_TOKEN environment variable")
      return NextResponse.json({ error: "Storage is not configured on the server." }, { status: 500 })
    }

    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true
    });

    return NextResponse.json({ success: true, filePath: blob.url })
  } catch (error: any) {
    console.error("Upload error:", error)
    const errorMsg = error.message || "Failed to upload file"
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
