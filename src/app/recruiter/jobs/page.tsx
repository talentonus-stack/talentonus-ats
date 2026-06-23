import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import JobListingClient from "./JobListingClient"

export default async function RecruiterJobsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }

  let jobs: any[] = []

  try {
    const rawJobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      include: {
        company: true
      },
      orderBy: { postedDate: "desc" }
    })

    // Sanitize confidential client data before passing to client components
    jobs = rawJobs.map((job) => {
      if (job.company && job.company.isConfidential) {
        return {
          ...job,
          company: {
            ...job.company,
            name: "Confidential Client",
            email: null,
            phone: null,
            website: null,
            contactPerson: null,
            location: null,
            logoUrl: null,
            notes: null,
            workingDays: null,
            workingHours: null,
            totalEmployees: null,
          }
        }
      }
      return job
    })

  } catch (e) {
    console.error("Failed to load active jobs", e)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-light">Active Job Openings</h1>
        <p className="text-sm text-muted mt-1">Browse current open positions to submit candidates.</p>
      </div>

      <JobListingClient jobs={jobs} />
    </div>
  )
}
