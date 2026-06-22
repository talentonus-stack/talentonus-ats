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
      return NextResponse.json({ error: "No recruiter account found with this email." }, { status: 404 })
    }

    // Create a Password Reset Request for the Admin
    await prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
        status: "PENDING"
      }
    })

    return NextResponse.json({ message: "Your password reset request has been submitted successfully. The administrator will contact you shortly." })
  } catch (error: any) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Failed to process password reset request" }, { status: 500 })
  }
}
