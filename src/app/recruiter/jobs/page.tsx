import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export default async function RecruiterJobsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }

  let jobs: any[] = []

  try {
    jobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      orderBy: { postedDate: "desc" }
    })
  } catch (e) {
    console.error("Failed to load active jobs", e)
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Active Job Openings</h1>
      <p className="mb-8 text-sm text-gray-600">Browse current open positions to submit candidates.</p>

      <div className="grid gap-6 grid-cols-1">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                <p className="text-sm text-gray-500">{job.department} • {job.industry || 'N/A'}</p>
              </div>
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                {job.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
              <div>
                <span className="block text-gray-500">Experience</span>
                <span className="font-medium text-gray-900">{job.experience || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-gray-500">Salary Range</span>
                <span className="font-medium text-gray-900">{job.salaryRange || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-gray-500">Location</span>
                <span className="font-medium text-gray-900">{job.location}</span>
              </div>
              <div>
                <span className="block text-gray-500">Vacancies</span>
                <span className="font-medium text-gray-900">{job.vacancies}</span>
              </div>
              <div>
                <span className="block text-gray-500">Job Timing</span>
                <span className="font-medium text-gray-900">{job.jobTiming}</span>
              </div>
              <div>
                <span className="block text-gray-500">Working Days</span>
                <span className="font-medium text-gray-900">{job.workingDays || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-gray-500">Priority</span>
                <span className="font-medium text-gray-900">{job.priority}</span>
              </div>
              <div>
                <span className="block text-gray-500">Gender</span>
                <span className="font-medium text-gray-900">{job.gender}</span>
              </div>
            </div>

            <div className="mb-6">
              <span className="block text-sm font-medium text-gray-700 mb-1">Required Skills</span>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md border">{job.skills || 'Not specified'}</p>
            </div>

            <div className="mb-6">
              <span className="block text-sm font-medium text-gray-700 mb-1">Job Description</span>
              <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-md border whitespace-pre-wrap">{job.description || 'No description provided.'}</p>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <a href={`/recruiter/candidates/new?jobId=${job.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm">
                Submit Candidate
              </a>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No active job openings available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
