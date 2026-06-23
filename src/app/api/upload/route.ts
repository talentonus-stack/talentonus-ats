import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ]
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|png|jpg|jpeg)$/i)) {
       return NextResponse.json({ error: "Invalid file type. Only PDF, DOC, DOCX, PNG, and JPG are allowed." }, { status: 400 })
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
       return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 })
    }

    // Verify Supabase Config
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables")
      const missingVars = []
      if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push("SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY")
      return NextResponse.json({ error: `Storage unavailable: Missing environment variable(s): ${missingVars.join(", ")}` }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Ensure unique filename
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error("Supabase storage error:", error)
      return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 })
    }

    // We no longer return the public URL. Instead we return the raw internal path
    // so the client application can request a short-lived signed URL for security.
    return NextResponse.json({
      success: true,
      filePath: data.path, // Store the private internal path in DB instead of publicURL
      fileName: file.name
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    const errorMsg = error.message || "Failed to upload file"
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
