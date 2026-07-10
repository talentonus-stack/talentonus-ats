import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import NewCandidateClientForm from "./NewCandidateClientForm"

export default async function NewCandidatePage({ searchParams }: { searchParams: Promise<{ jobId?: string, candidateId?: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }
  const { jobId, candidateId } = await searchParams;

  let activeJobs: any[] = []
  try {
    activeJobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      orderBy: { title: "asc" }
    })
  } catch (e) {
    console.error("Failed to load active jobs", e)
  }

  let existingCandidate = null
  if (candidateId) {
    try {
      existingCandidate = await prisma.candidate.findUnique({
        where: { id: candidateId, recruiterId: (session.user as any).id },
        include: { applications: true }
      })
    } catch (e) {
      console.error("Failed to load candidate", e)
    }
  }

  return <NewCandidateClientForm activeJobs={activeJobs} jobId={jobId} existingCandidate={existingCandidate} />
}