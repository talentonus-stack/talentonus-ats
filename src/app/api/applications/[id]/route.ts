import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await context.params;

  try {
    const { status, offeredCTC } = await request.json()

    // If changing to SELECTED, handle Placement creation logic
    if (status === 'SELECTED') {
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          job: { include: { company: true } },
          candidate: { include: { recruiter: true } }
        }
      })

      if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 })
      }

      // Need CTC to calculate placement values
      if (!offeredCTC && !application.offeredCTC) {
        return NextResponse.json({ error: "Offered CTC is required for Selected candidates" }, { status: 400 })
      }

      const finalCTC = offeredCTC || application.offeredCTC

      // Commercial calculation variables
      const companyId = application.job.companyId;

      if (!companyId) {
        return NextResponse.json({ error: "Cannot create placement: Job is not associated with a company." }, { status: 400 })
      }

      const companyFeePct = application.job.company?.recruitmentFeePercentage || 0
      const recruiterCommPct = application.candidate.recruiter?.commissionPercentage || 0

      const placementValue = finalCTC * (companyFeePct / 100)
      const recruiterShare = placementValue * (recruiterCommPct / 100)
      const talentonusShare = placementValue - recruiterShare

      // Perform transaction: Update app status, CTC, and create/update Placement
      const updatedApplication = await prisma.$transaction(async (tx) => {
        const updated = await tx.application.update({
          where: { id },
          data: {
            status,
            offeredCTC: finalCTC
          },
        })

        await tx.placement.upsert({
          where: { applicationId: id },
          update: {
            offeredCTC: finalCTC,
            placementValue,
            recruiterCommissionPercentage: recruiterCommPct,
            recruiterShare,
            talentonusShare,
            status: 'SELECTED'
          },
          create: {
            applicationId: id,
            candidateId: application.candidateId,
            companyId: companyId,
            jobId: application.jobId,
            recruiterId: application.candidate.recruiterId,
            offeredCTC: finalCTC,
            placementValue,
            recruiterCommissionPercentage: recruiterCommPct,
            recruiterShare,
            talentonusShare,
            status: 'SELECTED'
          }
        })

        return updated
      })

      return NextResponse.json(updatedApplication)
    }

    // If changing to JOINED, update application and placement status to JOINED
    if (status === 'JOINED') {
      const updatedApplication = await prisma.$transaction(async (tx) => {
        const updated = await tx.application.update({
          where: { id },
          data: { status },
        })

        await tx.placement.updateMany({
          where: { applicationId: id },
          data: {
            status: 'JOINED',
            joiningDate: new Date()
          }
        })

        return updated
      })

      return NextResponse.json(updatedApplication)
    }

    // Default status update (not SELECTED or JOINED)
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updatedApplication)
  } catch (error: any) {
    console.error("Application Update Error:", error)
    console.error("Error Name:", error.name)
    console.error("Error Message:", error.message)
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 })
  }
}
