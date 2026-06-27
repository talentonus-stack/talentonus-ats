import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth/next"


import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"


export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/recruiter")
  }

  // Fallback to empty array for static build phase
  let users: any[] = []
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Database connection failed, showing empty users list")
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-light">Users</h1>
          <p className="mt-2 text-sm text-muted">
            A list of all users in the ATS system.
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 text-black">
                <thead className="bg-primary-lighter/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-primary-lighter">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-primary/50 transition-colors group">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{user.name || "N/A"}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{user.email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={3} className="whitespace-nowrap px-6 py-12 text-sm text-muted text-center">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
