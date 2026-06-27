import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import UserListClient from "./UserListClient"

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
      <div className="mt-8">
        <UserListClient initialUsers={users} currentUserId={(session.user as any).id} />
      </div>
    </div>
  )
}
