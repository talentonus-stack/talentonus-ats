import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"

export default async function RecruiterCandidatesPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }

  const recruiterId = (session.user as any).id

  let candidates: any[] = []
  try {
    candidates = await prisma.candidate.findMany({
      where: { recruiterId },
      include: { applications: { include: { job: true } } },
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Failed to load recruiter candidates", e)
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">My Candidates</h1>
          <p className="mt-2 text-sm text-gray-700">Track candidates you have submitted.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/recruiter/candidates/new"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
          >
            Submit Candidate
          </Link>
        </div>
      </div>
      <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Job Applied</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Application Status</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Submitted On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {candidates.map((candidate) => {
              const latestApp = candidate.applications[0];
              return (
                <tr key={candidate.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {candidate.firstName} {candidate.lastName || ''}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div>{candidate.email}</div>
                    <div>{candidate.phone || 'N/A'}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {latestApp ? latestApp.job.title : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {latestApp ? (
                      <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                        {latestApp.status.replace(/_/g, ' ')}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(candidate.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={5} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">No candidates submitted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
