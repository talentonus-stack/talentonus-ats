export const dynamic = "force-dynamic"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import JobListingClient from "./JobListingClient"
import PageHeader from "@/components/PageHeader"
import { Briefcase } from "lucide-react"

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string; location?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if (!["ADMIN", "ASSOCIATE_PARTNER"].includes((session.user as any).role)) {
    redirect("/recruiter")
  }

  const { q, status, priority, location } = await searchParams;

  let jobs: any[] = []

  // Build query
  const whereClause: any = {}
  if (q) {
    whereClause.title = { contains: q, mode: "insensitive" }
  }
  if (status) {
    whereClause.status = status
  }
  if (priority) {
    whereClause.priority = priority
  }
  if (location) {
    whereClause.location = { contains: location, mode: "insensitive" }
  }

  try {
    jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        company: true,
        applications: {
          select: {
            status: true
          }
        }
      },
      orderBy: { postedDate: "desc" }
    })
  } catch (e) {
    console.error("Failed to load jobs", e)
  }

  const isAdmin = (session.user as any).role === "ADMIN"

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <PageHeader
        title="Job Listings"
        description="Manage all recruitment positions and their statuses."
        icon={Briefcase}
        action={isAdmin ? (
          <Link
            href="/jobs/new"
            className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]"
          >
            Create New Job
          </Link>
        ) : undefined}
      />

      <div className="mb-8 rounded-2xl bg-primary-lighter border border-border p-5">
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-4" method="GET" action="/jobs">
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Search Title</label>
            <input type="text" name="q" defaultValue={q || ""} placeholder="Software Engineer..." className="block w-full rounded-lg bg-primary border border-border px-3 py-2 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Status</label>
            <select name="status" defaultValue={status || ""} className="block w-full rounded-lg bg-primary border border-border px-3 py-2 text-sm text-light focus:border-accent focus:ring-1 focus:ring-accent transition-colors">
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Priority</label>
            <select name="priority" defaultValue={priority || ""} className="block w-full rounded-lg bg-primary border border-border px-3 py-2 text-sm text-light focus:border-accent focus:ring-1 focus:ring-accent transition-colors">
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Location</label>
              <input type="text" name="location" defaultValue={location || ""} placeholder="Remote, NY..." className="block w-full rounded-lg bg-primary border border-border px-3 py-2 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors" />
            </div>
            <button type="submit" className="rounded-lg bg-primary border border-border px-5 py-2 text-sm font-medium text-light hover:border-accent hover:text-accent transition-all duration-200">
              Filter
            </button>
          </div>
        </form>
      </div>

      <JobListingClient initialJobs={jobs} isAdmin={isAdmin} />
    </div>
  )
}
