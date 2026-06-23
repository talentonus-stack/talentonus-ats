import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createClient } from '@supabase/supabase-js'

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: candidateId } = await params

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    })

    if (!candidate || !candidate.resumeUrl) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Role-Based Access Control (RBAC)
    const userRole = (session.user as any).role
    const userId = (session.user as any).id

    if (userRole === "RECRUITER" && candidate.recruiterId !== userId) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to access this candidate's resume." }, { status: 403 })
    }

    // Supabase config
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Storage configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Handle legacy public URLs vs new private paths
    let filePath = candidate.resumeUrl
    if (filePath.startsWith('http')) {
      // Extract the file path from the public URL if it's a legacy record
      const urlParts = filePath.split('/')
      filePath = urlParts[urlParts.length - 1]
    }

    // Generate a short-lived signed URL (valid for 60 seconds)
    const { data, error } = await supabase.storage
      .from('resumes')
      .createSignedUrl(filePath, 60)

    if (error || !data) {
      console.error("Supabase Signed URL error:", error)
      return NextResponse.json({ error: "Failed to generate secure download link" }, { status: 500 })
    }

    // Redirect the browser strictly to the signed URL
    return NextResponse.redirect(data.signedUrl)
  } catch (error: any) {
    console.error("Resume download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
