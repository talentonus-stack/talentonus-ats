import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import PasswordResetsClient from "./PasswordResetsClient"

export const dynamic = "force-dynamic"

export default async function PasswordResetsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  let requests: any[] = []
  try {
    requests = await prisma.passwordResetRequest.findMany({
      include: {
        user: { select: { name: true, email: true } },
        admin: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Database connection failed, showing empty reset requests list", e)
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-light">Password Reset Requests</h1>
          <p className="mt-2 text-sm text-muted">
            Manage recruiter password reset requests.
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <PasswordResetsClient initialRequests={requests} />
      </div>
    </div>
  )
}
