import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("Authorization")
    if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      // Return 401 if CRON_SECRET is provided but doesn't match, or if missing in production
      if (process.env.NODE_ENV === "production" || process.env.CRON_SECRET) {
        return new NextResponse("Unauthorized", { status: 401 })
      }
    }

    const now = new Date()

    // 1. Archive Candidates Older Than 90 Days
    const archiveThreshold = new Date()
    archiveThreshold.setDate(now.getDate() - 90)

    const archiveResult = await prisma.candidate.updateMany({
      where: {
        status: "ACTIVE",
        createdAt: {
          lt: archiveThreshold
        }
      },
      data: {
        status: "ARCHIVED"
      }
    })

    // 2. Permanently Delete Archived Candidates Older Than 365 Days
    const deleteThreshold = new Date()
    deleteThreshold.setDate(now.getDate() - 365)

    const candidatesToDelete = await prisma.candidate.findMany({
      where: {
        status: "ARCHIVED",
        createdAt: {
          lt: deleteThreshold
        }
      },
      select: {
        id: true,
        resumeUrl: true
      }
    })

    const deletedCandidateIds = candidatesToDelete.map(c => c.id)

    let deletedCount = 0

    if (deletedCandidateIds.length > 0) {
       await prisma.placement.deleteMany({
         where: { candidateId: { in: deletedCandidateIds } }
       })

       await prisma.application.deleteMany({
         where: { candidateId: { in: deletedCandidateIds } }
       })

       const deleteResult = await prisma.candidate.deleteMany({
         where: { id: { in: deletedCandidateIds } }
       })

       deletedCount = deleteResult.count
    }

    return NextResponse.json({
      success: true,
      archived: archiveResult.count,
      deleted: deletedCount
    })

  } catch (error: any) {
    console.error("Cron Retention Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
