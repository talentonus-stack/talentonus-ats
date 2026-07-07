import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Key } from "lucide-react"
import PasswordResetListClient from "./PasswordResetListClient"

export const dynamic = "force-dynamic"

export default async function PasswordResetsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  const requests = await prisma.passwordResetRequest.findMany({
    include: {
      user: true
    },
    orderBy: { createdAt: "desc" }
  })

  const mappedRequests = requests.map(req => ({
    id: req.id,
    userId: req.userId,
    recruiterName: req.user.name || "Unknown Recruiter",
    email: req.user.email,
    requestDate: req.createdAt,
    status: req.status as "PENDING" | "COMPLETED"
  }))

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-light flex items-center gap-3">
          <Key className="w-8 h-8 text-accent" />
          Password Reset Requests
        </h1>
        <p className="mt-2 text-sm text-muted">Manage internal password reset requests from recruiters.</p>
      </div>

      <PasswordResetListClient initialRequests={mappedRequests} />
    </div>
  )
}
