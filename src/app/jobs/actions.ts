"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function deleteJob(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            applications: true,
            placements: true
          }
        }
      }
    })

    if (!job) {
      return { success: false, error: "Job not found" }
    }

    if (job._count.applications > 0 || job._count.placements > 0) {
      return { success: false, error: "This job cannot be deleted because it already contains applications or placement records." }
    }

    await prisma.job.delete({
      where: { id }
    })

    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete job:", error)
    return { success: false, error: "Failed to delete job. Ensure there are no related records." }
  }
}
