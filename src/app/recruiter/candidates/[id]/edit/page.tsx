import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import NewCandidateClientForm from "../../new/NewCandidateClientForm"

export const dynamic = "force-dynamic"

export default async function EditCandidatePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }

  const { id } = await params

  let candidate: any = null
  let jobs: any[] = []

  try {
    candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { applications: true }
    })

    if (!candidate || candidate.recruiterId !== (session.user as any).id) {
      redirect("/recruiter/candidates")
    }

    jobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      include: { company: true },
      orderBy: { postedDate: "desc" }
    })
  } catch (error) {
    console.error("Failed to load candidate or jobs for editing", error)
  }

  // Pre-select job if an application exists
  const jobId = candidate?.applications?.[0]?.jobId || ""

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-light">Edit Candidate</h1>
        <p className="mt-2 text-sm text-muted">Modify candidate information.</p>
      </div>

      <div className="bg-primary-lighter rounded-2xl shadow-xl border border-border overflow-hidden">
        {candidate && (
          <NewCandidateClientForm activeJobs={jobs} jobId={jobId} existingCandidate={candidate} />
        )}
      </div>
    </div>
  )
}
