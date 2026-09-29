import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Wallet } from "lucide-react"
import RecruiterPaymentsClient from "./RecruiterPaymentsClient"

export const dynamic = "force-dynamic"

export default async function RecruiterPaymentsPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "ASSOCIATE_PARTNER"].includes((session.user as any).role)) {
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

  const operationsPayouts = await prisma.operationsPayout.findMany({
    include: {
      associatePartner: true,
      placement: {
        include: {
          application: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const isAdmin = (session.user as any).role === "ADMIN";

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-light flex items-center gap-3">
            <Wallet className="w-8 h-8 text-accent" />
            Payout Management
          </h1>
          <p className="mt-2 text-sm text-muted">Manage commission payouts to recruiters and operations partners.</p>
        </div>
      </div>

      <RecruiterPaymentsClient placements={placements} operationsPayouts={operationsPayouts} isAdmin={isAdmin} />
    </div>
  )
}
