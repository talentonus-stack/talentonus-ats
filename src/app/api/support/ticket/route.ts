import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Resend } from "resend"

const CATEGORIES = [
  "Candidate Submission",
  "Candidate Status",
  "Job Related",
  "Interview Related",
  "Payment / Commission",
  "Bank Details",
  "Account / Profile",
  "Technical Issue",
  "Other"
]

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // 1 & 2. Authenticated session & Recruiter role validation
    if (!session || (session.user as any).role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 3. Get recruiter identity strictly from DB/Session
    const userId = (session.user as any).id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    if (!user || !user.email) {
      return NextResponse.json({ error: "Recruiter identity could not be verified." }, { status: 403 })
    }

    const { category, description } = await req.json()

    // 4. Validate category
    if (!category || !CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid support category selected." }, { status: 400 })
    }

    // 5 & 6. Validate description limits
    if (!description || typeof description !== "string" || description.trim() === "") {
      return NextResponse.json({ error: "Description is required." }, { status: 400 })
    }

    if (description.length > 1000) {
      return NextResponse.json({ error: "Description must not exceed 1000 characters." }, { status: 400 })
    }

    // Escape basic HTML from description before sending
    const sanitizeHtml = (str: string) => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br/>")
    }

    const safeDescription = sanitizeHtml(description)
    const recruiterName = user.name || "Unknown Recruiter"
    const recruiterEmail = user.email

    // Ensure RESEND API key exists
    if (!process.env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY environment variable.")
      return NextResponse.json({ error: "Support system is currently unavailable. Please try again later." }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Configurable sender address, fallback to career@talentonus.in
    const fromEmail = process.env.SUPPORT_FROM_EMAIL || 'career@talentonus.in'

    // 9 & 10. Construct and dispatch the main support email
    const supportEmailResult = await resend.emails.send({
      from: `Talentonus Support <${fromEmail}>`,
      to: 'career@talentonus.in',
      replyTo: recruiterEmail,
      subject: `[Recruiter Support] ${category} - ${recruiterName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>New Recruiter Support Request</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Recruiter:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${recruiterName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${recruiterEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Category:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${category}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Submitted:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date().toISOString()}</td>
            </tr>
          </table>

          <h3 style="margin-top: 20px;">Description:</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
            ${safeDescription}
          </div>
        </div>
      `
    })

    if (supportEmailResult.error) {
      console.error("Resend API Error (Support Email):", supportEmailResult.error)
      return NextResponse.json({ error: "Failed to send your support request. Please try again." }, { status: 500 })
    }

    // Only send the confirmation email if the main email succeeded
    const confirmationEmailResult = await resend.emails.send({
      from: `Talentonus Support <${fromEmail}>`,
      to: recruiterEmail,
      subject: 'We received your Talentonus support request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h3>Support Request Received</h3>
          <p>Hi ${recruiterName},</p>
          <p>We've received your support request regarding <strong>${category}</strong>.</p>
          <p>Our team is reviewing your ticket and will get back to you shortly.</p>
          <br/>
          <p>Best regards,<br/>The Talentonus Team</p>
        </div>
      `
    })

    if (confirmationEmailResult.error) {
      console.warn("Failed to send confirmation email to recruiter, but main support ticket was delivered.", confirmationEmailResult.error)
      // We still return 200 OK because the support team received the ticket.
      return NextResponse.json({ success: true, warning: "Ticket submitted successfully, but confirmation email failed to deliver." })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("Support ticket API error:", error)
    // 11. Return generic safe error message
    return NextResponse.json({ error: "An unexpected error occurred while submitting your ticket." }, { status: 500 })
  }
}
