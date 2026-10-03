import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { IndianRupee } from "lucide-react"
import PageHeader from "@/components/PageHeader"

export const dynamic = "force-dynamic"

export default async function RecruiterEarningsPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["RECRUITER", "ASSOCIATE_PARTNER"].includes((session.user as any).role)) {
    redirect("/recruiter-login")
  }

  const userId = (session.user as any).id
  const isAssociatePartner = (session.user as any).role === "ASSOCIATE_PARTNER"

  // 1. Fetch Normal Recruiter Payouts
  const recruiterPlacements = await prisma.placement.findMany({
    where: { recruiterId: userId },
    include: {
      candidate: true,
      company: true
    },
    orderBy: { createdAt: "desc" }
  })

  const mappedRecruiterPayouts = recruiterPlacements.map(p => ({
    id: p.id,
    type: "Recruiter Share",
    candidateName: `${p.candidate.firstName} ${p.candidate.lastName || ''}`.trim(),
    companyName: p.company.name,
    earnings: p.recruiterShare,
    status: p.recruiterPaymentStatus,
    date: p.recruiterPaidDate || p.createdAt
  }))

  // 2. Fetch Operations Payouts (Only if Associate Partner)
  let mappedOperationsPayouts: any[] = []
  if (isAssociatePartner) {
    const opsPayouts = await prisma.operationsPayout.findMany({
      where: { associatePartnerId: userId },
      orderBy: { createdAt: "desc" }
    })

    mappedOperationsPayouts = opsPayouts.map(op => ({
      id: op.id,
      type: "Operations Share",
      candidateName: op.candidateName,
      companyName: op.companyName,
      earnings: op.amount,
      status: op.status,
      date: op.paidDate || op.createdAt
    }))
  }

  const combinedEarnings = [...mappedRecruiterPayouts, ...mappedOperationsPayouts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-10">
      <PageHeader
        title="My Earnings"
        description="Track your generated shares and payment statuses."
        icon={IndianRupee}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate & Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">My Earnings</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {combinedEarnings.map((earning) => (
                <tr key={earning.type + earning.id} className="hover:bg-primary/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-bold text-light">{earning.candidateName}</div>
                    <div className="text-xs text-muted mt-1">{earning.companyName}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-light">
                    {earning.type}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-yellow-400 font-bold">
                    ₹{earning.earnings.toLocaleString('en-IN')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border ${earning.status === 'PAID' ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-orange-900/20 text-orange-400 border-orange-800/30'}`}>
                      {earning.status}
                    </span>
                  </td>
                </tr>
              ))}
              {combinedEarnings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-sm text-muted text-center">No earnings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
