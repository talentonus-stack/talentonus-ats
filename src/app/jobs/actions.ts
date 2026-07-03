"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function deleteJob(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    })

    if (!job) {
      return { success: false, error: "Job not found" }
    }

    if (job._count.applications > 0) {
      return { success: false, error: "This job has candidate applications and cannot be deleted. Please close the job instead." }
    }

    await prisma.job.delete({
      where: { id }
    })

    revalidatePath("/jobs")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete job:", error)
    return { success: false, error: "Failed to delete job." }
  }
}
