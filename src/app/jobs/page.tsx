import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import JobListClient from "./JobListClient"

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string; location?: string; published?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/recruiter")
  }

  const { q, status, priority, location, published } = await searchParams;

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
  if (published) {
    whereClause.publishOnWebsite = published === "true"
  }

  try {
    jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        company: true,
        _count: {
          select: {
            applications: true,
            placements: true
          }
        }
      },
      orderBy: { postedDate: "desc" }
    })
  } catch (e) {
    console.error("Failed to load jobs", e)
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-light">Job Listings</h1>
          <p className="mt-2 text-sm text-muted">Manage all recruitment positions and their statuses.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/jobs/new"
            className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]"
          >
            Create New Job
          </Link>
        </div>
      </div>

      <div className="mb-8 rounded-2xl bg-primary-lighter border border-border p-5 overflow-x-auto custom-scrollbar">
        <form className="flex flex-col sm:flex-row gap-4 min-w-[900px]" method="GET" action="/jobs">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Search Title</label>
            <input type="text" name="q" defaultValue={q || ""} placeholder="Software Engineer..." className="block w-full rounded-lg bg-primary border border-border px-3 py-2 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors" />
          </div>
          <div className="w-[150px]">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Status</label>
            <select name="status" defaultValue={status || ""} className="block w-full rounded-lg bg-primary border border-border px-3 py-2 text-sm text-light focus:border-accent focus:ring-1 focus:ring-accent transition-colors">
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div className="w-[150px]">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Published</label>
            <select name="published" defaultValue={published || ""} className="block w-full rounded-lg bg-primary border border-border px-3 py-2 text-sm text-light focus:border-accent focus:ring-1 focus:ring-accent transition-colors">
              <option value="">All Jobs</option>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
          </div>
          <div className="w-[150px]">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Priority</label>
            <select name="priority" defaultValue={priority || ""} className="block w-full rounded-lg bg-primary border border-border px-3 py-2 text-sm text-light focus:border-accent focus:ring-1 focus:ring-accent transition-colors">
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Location</label>
            <input type="text" name="location" defaultValue={location || ""} placeholder="Remote, NY..." className="block w-full rounded-lg bg-primary border border-border px-3 py-2 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="rounded-lg bg-primary border border-border px-6 py-2 h-[38px] text-sm font-medium text-light hover:border-accent hover:text-accent transition-all duration-200">
              Filter
            </button>
          </div>
        </form>
      </div>

      <JobListClient initialJobs={jobs} />
    </div>
  )
}
