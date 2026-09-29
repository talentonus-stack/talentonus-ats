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

  await prisma.placement.update({
    where: { id: placementId },
    data: {
      recruiterPaymentStatus: "PAID",
      recruiterPaidDate: new Date()
    }
  })

  // --- NOTIFICATION CREATION ---
  if (placement.recruiterPaymentStatus !== "PAID" && placement.recruiterId) {
    const candidateName = `${placement.candidate?.firstName} ${placement.candidate?.lastName || ''}`.trim()
    const message = `Payment status for Candidate ${candidateName} has been updated to Paid.`

    try {
      await prisma.notification.create({
        data: {
          userId: placement.recruiterId,
          message,
          type: "SUCCESS",
        }
      })
    } catch (notifError) {
      console.error("Failed to create notification:", notifError)
    }
  }
  // -----------------------------

  revalidatePath("/recruiter-payments")
  revalidatePath("/recruiter")
  revalidatePath("/recruiter/profile")

  return { success: true }
}

export async function markOperationsSharePaid(operationsPayoutId: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const op = await prisma.operationsPayout.findUnique({
    where: { id: operationsPayoutId },
    include: { placement: { include: { application: true } } }
  })

  if (!op) {
    throw new Error("Operations Payout not found")
  }

  if (op.placement && op.placement.application?.status === 'SELECTED') {
    throw new Error("Cannot pay operations share while application is still in SELECTED status.")
  }

  await prisma.operationsPayout.update({
    where: { id: operationsPayoutId },
    data: {
      status: "PAID",
      paidDate: new Date()
    }
  })

  // --- NOTIFICATION CREATION ---
  if (op.status !== "PAID") {
    const message = `Operations Share payout for ${op.candidateName} has been updated to Paid.`
    try {
      await prisma.notification.create({
        data: {
          userId: op.associatePartnerId,
          message,
          type: "SUCCESS",
        }
      })
    } catch (notifError) {
      console.error("Failed to create notification:", notifError)
    }
  }
  // -----------------------------

  revalidatePath("/recruiter-payments")
  revalidatePath("/recruiter")

  return { success: true }
}
