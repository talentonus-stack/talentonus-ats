import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"

export default async function RecruitersPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  let recruiters: any[] = []
  try {
    recruiters = await prisma.user.findMany({
      where: { role: "RECRUITER" },
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Failed to load recruiters")
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Recruiters</h1>
          <p className="mt-2 text-sm text-gray-700">Manage recruiter accounts.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/recruiters/new"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
          >
            Add Recruiter
          </Link>
        </div>
      </div>
      <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mobile</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {recruiters.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{r.name}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{r.email}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{r.mobile || 'N/A'}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{r.location || 'N/A'}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {recruiters.length === 0 && (
              <tr>
                <td colSpan={5} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">No recruiters found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
