import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function NewApplicationPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/recruiter")
  }

  let jobs: any[] = []
  let candidates: any[] = []
  try {
    jobs = await prisma.job.findMany({ where: { status: "OPEN" }, orderBy: { title: "asc" } })
    candidates = await prisma.candidate.findMany({ orderBy: { firstName: "asc" } })
  } catch (e) {
    console.error(e)
  }

  async function createApplication(formData: FormData) {
    "use server"
    const authSession = await getServerSession(authOptions)
    if (!authSession) throw new Error("Unauthorized")
    try {
      await prisma.application.create({
        data: {
          jobId: formData.get("jobId") as string,
          candidateId: formData.get("candidateId") as string,
          status: "SUBMITTED",
        }
      })
    } catch(e) {
      console.error(e)
    }
    redirect("/applications")
  }

  return (
    <div className="max-w-2xl animate-fade-in mx-auto">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-light">Create New Application</h1>
      <form action={createApplication} className="space-y-6 bg-primary-lighter p-8 rounded-2xl shadow-xl border border-border">
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Job</label>
          <select required name="jobId" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="">Select a job...</option>
            {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Candidate</label>
          <select required name="candidateId" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="">Select a candidate...</option>
            {candidates.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.firstName} {candidate.lastName}</option>)}
          </select>
        </div>
        <button type="submit" className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-bold text-primary hover:bg-[#E8952C] hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg">
          Create Application
        </button>
      </form>
    </div>
  )
}
