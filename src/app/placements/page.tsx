import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { IndianRupee, FileText } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function PlacementsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  const placements = await prisma.placement.findMany({
    include: {
      candidate: true,
      company: true,
      job: true,
      recruiter: true
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-light flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-accent" />
            Placements & Revenue
          </h1>
          <p className="mt-2 text-sm text-muted">Track candidate placements, revenue shares, and invoice statuses.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate / Job</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recruiter</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Offered CTC</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Our Share</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {placements.map((p) => (
                <tr key={p.id} className="hover:bg-primary/50 transition-colors group">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-bold text-light group-hover:text-accent transition-colors">
                      {p.candidate.firstName} {p.candidate.lastName}
                    </div>
                    <div className="text-xs text-muted mt-1">{p.job.title}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-light font-medium">{p.company.name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{p.recruiter ? p.recruiter.name || p.recruiter.email : 'Admin'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-light font-medium">₹{(p.offeredCTC).toLocaleString('en-IN')}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-accent font-bold">₹{(p.placementValue).toLocaleString('en-IN')}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-light font-bold">₹{(p.talentonusShare).toLocaleString('en-IN')}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border
                      ${p.status === 'SELECTED' ? 'bg-blue-900/20 text-blue-400 border-blue-800/30' : ''}
                      ${p.status === 'JOINED' ? 'bg-accent/10 text-accent border-accent/20' : ''}
                      ${p.status === 'INVOICE_GENERATED' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800/30' : ''}
                      ${p.status === 'INVOICE_PAID' ? 'bg-green-900/20 text-green-400 border-green-800/30' : ''}
                      ${p.status === 'RECRUITER_PAID' ? 'bg-purple-900/20 text-purple-400 border-purple-800/30' : ''}
                    `}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {placements.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-sm text-muted text-center">
                    No placements recorded yet. Move a candidate to "SELECTED" status to create a placement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
