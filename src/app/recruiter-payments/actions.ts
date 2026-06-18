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
