import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { emailOrMobile } = await request.json()

    const user = await prisma.user.findFirst({
      where: {
        role: "RECRUITER",
        status: "ACTIVE",
        OR: [
          { email: emailOrMobile },
          { mobile: emailOrMobile }
        ]
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Recruiter not found or inactive" }, { status: 404 })
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry }
    })

    // In a real app, you would send an SMS or Email here.
    console.log(`[MOCK EMAIL/SMS] OTP for ${user.email}: ${otp}`)

    return NextResponse.json({ message: "OTP sent successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}
