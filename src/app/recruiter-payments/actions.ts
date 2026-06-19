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
    include: { company: true }
  })

  if (!placement) {
    throw new Error("Placement not found")
  }

  if (placement.status === "SELECTED") {
    return { error: "NOT_JOINED", companyName: placement.company.name }
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
