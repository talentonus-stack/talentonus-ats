import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import DeleteButton from "./DeleteButton"

export default async function CandidatesPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/recruiter")
  }

  let candidates: any[] = []
  try {
    candidates = await prisma.candidate.findMany({
      include: {
        recruiter: true,
        applications: {
          include: { job: true },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Failed to load candidates", e)
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Candidates</h1>
          <p className="mt-2 text-sm text-gray-700">A comprehensive list of all candidates across the system.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/candidates/new"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
          >
            Add candidate
          </Link>
        </div>
      </div>

      <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Candidate Info</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Experience</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Salary Info (C/E)</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Notice</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Applied Job</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Recruiter</th>
                <th className="px-3 py-3.5 text-right text-xs font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {candidates.map((candidate) => {
                const latestApp = candidate.applications[0];
                return (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <Link href={`/candidates/${candidate.id}`} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                        {candidate.firstName} {candidate.lastName || ''}
                      </Link>
                      <div className="text-gray-500 text-xs mt-1">{candidate.email}</div>
                      <div className="text-gray-500 text-xs">{candidate.phone || 'No phone'}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {candidate.experience || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-600">
                      <div>Cur: <span className="font-medium text-gray-900">{candidate.currentSalary || 'N/A'}</span></div>
                      <div>Exp: <span className="font-medium text-gray-900">{candidate.expectedSalary || 'N/A'}</span></div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {candidate.noticePeriod || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {latestApp ? (
                        <div>
                          <span className="font-medium">{latestApp.job.title}</span>
                          <div className="mt-1">
                            <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                              {latestApp.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not applied</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {candidate.recruiter ? candidate.recruiter.name : 'System/Admin'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium space-x-3">
                      <Link href={`/candidates/${candidate.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </Link>
                      <DeleteButton id={candidate.id} />
                    </td>
                  </tr>
                )
              })}
              {candidates.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-sm text-gray-500 text-center">No candidates found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
