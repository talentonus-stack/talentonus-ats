import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const placement = await prisma.placement.findUnique({
      where: { id },
      select: { applicationId: true }
    })

    if (!placement) {
      return NextResponse.json({ error: "Placement not found" }, { status: 404 })
    }

    // Delete placement and revert application status to L2_CLEARED or something similar,
    // or just leave the application as is if that's what the logic dictates.
    // Typically deleting a placement implies the placement fell through.
    // We should probably revert the application status. Let's set it to REJECTED or BACKED_OUT to be safe,
    // or simply delete the placement and leave the application.

    await prisma.$transaction(async (tx) => {
       await tx.placement.delete({
         where: { id }
       })
       // Reverting application to BACKED_OUT so it doesn't stay SELECTED without a placement
       await tx.application.update({
         where: { id: placement.applicationId },
         data: { status: "BACKED_OUT" }
       })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete placement" }, { status: 500 })
  }
}
