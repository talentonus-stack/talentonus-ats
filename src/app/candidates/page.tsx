import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth/next"


import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"

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
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Failed to load candidates")
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Candidates</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all candidates.</p>
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
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{candidate.firstName} {candidate.lastName}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{candidate.email}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{candidate.phone || 'N/A'}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(candidate.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={4} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">No candidates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
