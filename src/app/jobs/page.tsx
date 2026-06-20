import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string; location?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
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
        company: true
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
            className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[#E8952C] transition-colors shadow-md hover:shadow-lg"
          >
            Create New Job
          </Link>
        </div>
      </div>

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

      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Title / Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Experience</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Posted</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-primary-lighter">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-primary/50 transition-colors group">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-light group-hover:text-accent transition-colors">{job.title}</div>
                    <div className="text-xs text-muted mt-1">{job.company?.name || 'No Company'}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{job.experience || 'N/A'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{job.location}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${job.priority === 'HIGH' ? 'bg-red-100 text-red-800 border-red-200' : job.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                      {job.priority}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${job.status === 'OPEN' ? 'bg-green-100 text-green-800 border-green-200' : job.status === 'ON_HOLD' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-border text-muted border-border'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{new Date(job.postedDate).toLocaleDateString()}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link href={`/jobs/${job.id}/edit`} className="text-muted hover:text-accent transition-colors">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-sm text-muted text-center">No jobs found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
