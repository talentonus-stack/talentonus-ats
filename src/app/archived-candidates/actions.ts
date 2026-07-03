"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function restoreCandidate(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Unauthorized" }
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id }
  })

  if (!candidate) {
    return { success: false, error: "Candidate not found" }
  }

  await prisma.candidate.update({
    where: { id },
    data: {
      status: "ACTIVE"
    }
  })

  revalidatePath("/candidates")
  revalidatePath("/archived-candidates")

  return { success: true }
}
