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
      orderBy: { postedDate: "desc" }
    })
  } catch (e) {
    console.error("Failed to load jobs", e)
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Jobs</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all jobs and their details.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/jobs/new"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
          >
            Add job
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-white p-4 shadow-sm border border-gray-200">
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-4" method="GET" action="/jobs">
          <div>
            <label className="block text-xs font-medium text-gray-700">Search Title</label>
            <input type="text" name="q" defaultValue={q || ""} placeholder="Software Engineer..." className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Status</label>
            <select name="status" defaultValue={status || ""} className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black">
              <option value="">All</option>
              <option value="OPEN">Open</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Priority</label>
            <select name="priority" defaultValue={priority || ""} className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black">
              <option value="">All</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700">Location</label>
              <input type="text" name="location" defaultValue={location || ""} placeholder="Remote, NY..." className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black" />
            </div>
            <button type="submit" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 border border-gray-300">
              Filter
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Title</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Experience</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Priority</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Posted Date</th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{job.title}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{job.experience || 'N/A'}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{job.location}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${job.priority === 'HIGH' ? 'bg-red-100 text-red-800' : job.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {job.priority}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${job.status === 'OPEN' ? 'bg-green-100 text-green-800' : job.status === 'ON_HOLD' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                    {job.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(job.postedDate).toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                  <Link href={`/jobs/${job.id}/edit`} className="text-blue-600 hover:text-blue-900">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={7} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">No jobs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
