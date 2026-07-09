import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Users, FileText, CheckCircle, Briefcase , IndianRupee } from "lucide-react"

export const dynamic = "force-dynamic"


export default async function RecruiterDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  const { id } = await params;

  const recruiter = await prisma.user.findUnique({
    where: { id },
    include: {
      candidates: {
        include: {
          applications: true
        }
      },
      placements: true
    }
  })

  if (!recruiter) {
    redirect("/recruiters")
  }

  const [totalCandidates, totalApplications, selectedCandidates, joinedCandidates] = await Promise.all([
    prisma.candidate.count({ where: { recruiterId: id } }),
    prisma.application.count({ where: { candidate: { recruiterId: id } } }),
    prisma.application.count({ where: { candidate: { recruiterId: id }, status: "SELECTED" } }),
    prisma.application.count({ where: { candidate: { recruiterId: id }, status: "JOINED" } }),
  ])

  const stats = [
    { name: "Total Candidates Submitted", value: totalCandidates, icon: Users },
    { name: "Total Applications", value: totalApplications, icon: FileText },
    { name: "Selected Candidates", value: selectedCandidates, icon: CheckCircle },
    { name: "Joined Candidates", value: joinedCandidates, icon: Briefcase },
  ]

  return (
    <div className="max-w-6xl animate-fade-in mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-black text-light tracking-tight">{recruiter.name}</h1>
          <p className="text-sm font-medium text-muted mt-1 uppercase tracking-wider">Recruiter Details & Performance Overview</p>
        </div>
        <a href="/recruiters" className="text-sm font-bold text-accent hover:text-accent-hover transition-colors">
          &larr; Back to Recruiters
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 bg-primary-lighter p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-sm font-bold text-light uppercase tracking-wider mb-6 border-b border-border/50 pb-3">Profile Information</h2>
          <div className="space-y-4 text-sm">
            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Email Address</span>
              <span className="text-sm font-medium text-light">{recruiter.email}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Mobile Number</span>
              <span className="text-sm font-medium text-light">{recruiter.mobile || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Location</span>
              <span className="text-sm font-medium text-light">{recruiter.location || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Account Status</span>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase mt-1 ${
                recruiter.status === 'ACTIVE'
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {recruiter.status}
              </span>
            </div>
            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Registered On</span>
              <span className="text-sm font-medium text-light">{new Date(recruiter.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50">
            <a href={`/recruiters/${id}/edit`} className="block w-full text-center bg-primary border border-border hover:border-accent hover:text-accent text-light font-bold py-3 rounded-lg transition-colors">
              Edit Recruiter Profile
            </a>
          </div>
        </div>


        <div className="md:col-span-2 space-y-6">

          <div className="bg-primary-lighter rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-sm font-bold text-light uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-border/50 pb-3">
              <IndianRupee className="w-5 h-5 text-accent" /> Commercial & Payment Terms
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Commission %</span>
                <span className="text-light font-black text-xl">{recruiter.commissionPercentage || 0}%</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Payment Terms</span>
                <span className="text-light font-bold">{recruiter.paymentTermsDays ? `${recruiter.paymentTermsDays} Days` : 'Not Set'}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Release Condition</span>
                <span className="text-light font-bold">{recruiter.paymentReleaseCondition || 'Not Set'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Recruiter Type</span>
                <span className="text-light font-bold">{recruiter.recruiterType || 'Not Set'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Agreement Signed</span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${
                  recruiter.agreementSigned
                    ? 'bg-accent/10 text-accent border-accent/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {recruiter.agreementSigned ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Agreement Date</span>
                <span className="text-light font-bold text-sm">{recruiter.agreementDate ? new Date(recruiter.agreementDate).toLocaleDateString() : 'Not Set'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Expiry Date</span>
                <span className="text-light font-bold text-sm">{recruiter.agreementExpiryDate ? new Date(recruiter.agreementExpiryDate).toLocaleDateString() : 'Not Set'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {stats.map((stat) => (
              <div
                key={stat.name}
                className="overflow-hidden rounded-xl bg-primary px-4 py-5 shadow-sm border border-border/50 flex items-center gap-4"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-lighter border border-border/50 shrink-0">
                  <stat.icon className="h-6 w-6 text-accent opacity-80" aria-hidden="true" />
                </div>
                <div>
                  <dt className="truncate text-xs font-bold text-muted uppercase tracking-wider">{stat.name}</dt>
                  <dd className="mt-1 text-2xl font-black text-light leading-none">{stat.value}</dd>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
