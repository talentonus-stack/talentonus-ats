import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Return success anyway to prevent email enumeration
      return NextResponse.json({ message: "If an account with that email exists, an administrator will be notified." })
    }

    // Use Prisma enum for status explicitly
    await prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
      }
    })

    return NextResponse.json({ message: "Your request has been sent to the administrators." })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
