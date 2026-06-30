import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Wallet } from "lucide-react"
import RecruiterPaymentsClient from "./RecruiterPaymentsClient"

export const dynamic = "force-dynamic"

export default async function RecruiterPaymentsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  // Fetch only placements that have a recruiter attached
  const placements = await prisma.placement.findMany({
    where: { recruiterId: { not: null } },
    include: {
      candidate: true,
      company: true,
      job: true,
      recruiter: true,
      application: true
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-light flex items-center gap-3">
            <Wallet className="w-8 h-8 text-accent" />
            Recruiter Payments
          </h1>
          <p className="mt-2 text-sm text-muted">Manage commission payouts to external and internal recruiters.</p>
        </div>
      </div>

      <RecruiterPaymentsClient placements={placements} />
    </div>
  )
}
