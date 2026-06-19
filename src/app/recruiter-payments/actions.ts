"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function markRecruiterPaid(placementId: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const placement = await prisma.placement.findUnique({
    where: { id: placementId },
    include: { company: true, candidate: true, application: true }
  })

  if (!placement) {
    throw new Error("Placement not found")
  }

  console.log("MARK_RECRUITER_PAID_EXECUTED")
  console.log("=== MARK PAID DEBUG ===")
  console.log("placementId:", placementId)
  console.log("applicationStatus:", placement.application?.status)
  console.log("placementStatus:", placement.status)
  console.log("recruiterPaymentStatus:", placement.recruiterPaymentStatus)
  console.log("candidate:", placement.candidate?.firstName)
  console.log("company:", placement.company?.name)
  console.log("======================")

  if (placement.application.status === "SELECTED") {
    return {
      error: "NOT_JOINED",
      message: "Recruiter payment cannot be processed until the candidate has joined.",
      companyName: placement.company.name,
      applicationId: placement.applicationId,
      candidateName: `${placement.candidate.firstName} ${placement.candidate.lastName || ''}`.trim()
    }
  }

  if (placement.application.status !== "JOINED") {
    throw new Error("Recruiter payment cannot be processed until the candidate has joined.")
  }

  await prisma.placement.update({
    where: { id: placementId },
    data: {
      recruiterPaymentStatus: "PAID",
      recruiterPaidDate: new Date()
    }
  })

  revalidatePath("/recruiter-payments")
  revalidatePath("/recruiter")
  revalidatePath("/recruiter/profile")

  return { success: true }
}
