export const dynamic = "force-dynamic"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import JobListingClient from "./JobListingClient"
import PageHeader from "@/components/PageHeader"
import { Briefcase } from "lucide-react"

export default async function RecruiterJobsPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["RECRUITER", "ASSOCIATE_PARTNER"].includes((session.user as any).role)) {
    redirect("/recruiter-login")
  }

  let jobs: any[] = []

  try {
    jobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      include: {
        company: true
      },
      orderBy: { postedDate: "desc" }
    })
  } catch (e) {
    console.error("Failed to load active jobs", e)
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <PageHeader
        title="Active Job Openings"
        description="Browse current open positions to submit candidates."
        icon={Briefcase}
      />

      <JobListingClient jobs={jobs} />
    </div>
  )
}
