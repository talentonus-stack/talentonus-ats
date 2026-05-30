import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        role: "RECRUITER",
        status: "ACTIVE",
        email: email
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Recruiter not found or inactive" }, { status: 404 })
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry }
    })

    // Dispatch OTP via Email using standard SMTP (Nodemailer)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const mailOptions = {
      from: process.env.SMTP_FROM || '"ATS Recruiter Portal" <noreply@example.com>',
      to: user.email,
      subject: "Your ATS Recruiter Login OTP",
      text: `Your One-Time Password (OTP) for the Recruiter Portal is: ${otp}\n\nThis OTP is valid for 10 minutes. Do not share this code with anyone.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #2563eb;">Recruiter Login OTP</h2>
          <p>Hello ${user.name || 'Recruiter'},</p>
          <p>Your One-Time Password (OTP) to securely access the ATS Recruiter Portal is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #111827; background: #f3f4f6; padding: 10px; text-align: center; border-radius: 5px;">${otp}</h1>
          <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request this code, please ignore this email.</p>
          <br/>
          <p style="font-size: 12px; color: #6b7280;">Secure ATS System</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ message: "OTP sent successfully via Email" })
  } catch (error) {
    console.error("OTP Generation/Send Error:", error)
    return NextResponse.json({ error: "Failed to send OTP. Please verify SMTP configuration." }, { status: 500 })
  }
}
