import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import UserListClient from "./UserListClient"
import PageHeader from "@/components/PageHeader"
import { UserCheck } from "lucide-react"

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
      <PageHeader
        title="Users"
        description="A list of all users in the ATS system."
        icon={UserCheck}
      />
      <div className="mt-8">
        <UserListClient initialUsers={users} currentUserId={(session.user as any).id} />
      </div>
    </div>
  )
}
