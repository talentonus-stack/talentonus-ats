import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { IndianRupee } from "lucide-react"
import PlacementListClient from "./PlacementListClient"

export const dynamic = "force-dynamic"

export default async function PlacementsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  const placements = await prisma.placement.findMany({
    include: {
      candidate: true,
      company: true,
      job: true,
      recruiter: true
    },
    orderBy: { createdAt: "desc" }
  })

  const mappedPlacements = placements.map(p => ({
    id: p.id,
    candidateName: `${p.candidate.firstName} ${p.candidate.lastName || ''}`,
    jobTitle: p.job.title,
    companyName: p.company.name,
    recruiterName: p.recruiter ? p.recruiter.name || p.recruiter.email : 'Admin',
    offeredCTC: p.offeredCTC,
    expectedJoiningDate: p.expectedJoiningDate,
    placementValue: p.placementValue,
    talentonusShare: p.talentonusShare,
    status: p.status
  }))

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-light flex items-center gap-3">
          <IndianRupee className="w-8 h-8 text-accent" />
          Placements & Revenue
        </h1>
        <p className="mt-2 text-sm text-muted">Track candidate placements, revenue shares, and invoice statuses.</p>
      </div>

      <PlacementListClient initialPlacements={mappedPlacements as any} />
    </div>
  )
}
