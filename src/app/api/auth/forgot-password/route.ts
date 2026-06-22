import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || user.role !== "RECRUITER") {
      // Return 404 so frontend can show "No recruiter account found with this email."
      return NextResponse.json({ error: "No recruiter account found with this email." }, { status: 404 })
    }

    // Since we are mocking the email sending process, we will just return success.
    // In a real application, you would generate a token and send an email via an SMTP service.

    // Simulate some delay for realism
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ message: "Password reset link has been sent to your email." })
  } catch (error: any) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Failed to process forgot password request" }, { status: 500 })
  }
}
