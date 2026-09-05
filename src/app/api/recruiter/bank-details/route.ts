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

    // Validate required fields
    if (!body.accountName || !body.accountNumber || !body.bankName || !body.ifscCode) {
      return NextResponse.json({ error: "Missing required bank details" }, { status: 400 })
    }

    const updateData = {
      accountName: body.accountName,
      accountNumber: body.accountNumber,
      bankName: body.bankName,
      ifscCode: body.ifscCode,
      cancelledChequeUrl: body.cancelledChequeUrl || null,
    }

    const upsertedBankDetails = await prisma.bankDetails.upsert({
      where: { userId: recruiterId },
      update: updateData,
      create: {
        ...updateData,
        userId: recruiterId
      }
    })

    return NextResponse.json(upsertedBankDetails)
  } catch (error: any) {
    console.error("Bank details update error:", error)
    return NextResponse.json({ error: "Failed to update bank details", details: error.message }, { status: 500 })
  }
}
