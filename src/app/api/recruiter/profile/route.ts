import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recruiterId = (session.user as any).id
    const body = await req.json()

    // Filter out restricted fields, only allow updates to editable profile fields
    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.location !== undefined) updateData.location = body.location
    if (body.linkedinUrl !== undefined) updateData.linkedinUrl = body.linkedinUrl
    if (body.whatsappNumber !== undefined) updateData.whatsappNumber = body.whatsappNumber
    if (body.resumeLink !== undefined) updateData.resumeLink = body.resumeLink
    if (body.resumeVaultUrl !== undefined) updateData.resumeVaultUrl = body.resumeVaultUrl
    if (body.panCardUrl !== undefined) updateData.panCardUrl = body.panCardUrl
    if (body.aadhaarUrl !== undefined) updateData.aadhaarUrl = body.aadhaarUrl
    if (body.bankDetailsUrl !== undefined) updateData.bankDetailsUrl = body.bankDetailsUrl
    if (body.notes !== undefined) updateData.notes = body.notes

    const updatedUser = await prisma.user.update({
      where: { id: recruiterId },
      data: updateData
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 })
  }
}
