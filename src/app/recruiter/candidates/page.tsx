import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import CandidateListingClient from "./CandidateListingClient"
import PageHeader from "@/components/PageHeader"
import { Users } from "lucide-react"

export default async function RecruiterCandidatesPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["RECRUITER", "ASSOCIATE_PARTNER"].includes((session.user as any).role)) {
    redirect("/recruiter-login")
  }

  const recruiterId = (session.user as any).id

  let candidates: any[] = []
  try {
    candidates = await prisma.candidate.findMany({
      where: { recruiterId, status: "ACTIVE" },
      include: {
        applications: { include: { job: true, placement: true } },
        updateRequests: {
          where: { status: "OPEN" },
          include: { requestedBy: { select: { name: true } } },
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Failed to load recruiter candidates", e)
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <PageHeader
        title="My Candidates"
        description="Track candidates you have submitted."
        icon={Users}
        action={
          <Link
            href="/recruiter/candidates/new"
            className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]"
          >
            Submit Candidate
          </Link>
        }
      />
      <CandidateListingClient candidates={candidates} />
    </div>
  )
}
