"use server"

import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function deleteCandidate(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  // Delete associated applications first to satisfy foreign key constraints
  await prisma.application.deleteMany({
    where: { candidateId: id }
  })

  // Delete the candidate
  await prisma.candidate.delete({
    where: { id }
  })

  revalidatePath("/candidates")
}
