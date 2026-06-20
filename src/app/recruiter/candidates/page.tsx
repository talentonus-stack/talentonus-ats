import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import CandidateListingClient from "./CandidateListingClient"

export default async function RecruiterCandidatesPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }

  const recruiterId = (session.user as any).id

  let candidates: any[] = []
  try {
    candidates = await prisma.candidate.findMany({
      where: { recruiterId },
      include: { applications: { include: { job: true } } },
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Failed to load recruiter candidates", e)
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-light">My Candidates</h1>
          <p className="mt-2 text-sm text-muted">Track candidates you have submitted.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/recruiter/candidates/new"
            className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]"
          >
            Submit Candidate
          </Link>
        </div>
      </div>
      <CandidateListingClient candidates={candidates} />
    </div>
  )
}
