import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Users, FileText, CheckCircle, Briefcase , IndianRupee } from "lucide-react"

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
    { name: "Total Candidates Submitted", value: totalCandidates, icon: Users, color: "text-accent", bg: "bg-primary border border-border" },
    { name: "Total Applications", value: totalApplications, icon: FileText, color: "text-accent", bg: "bg-primary border border-border" },
    { name: "Selected Candidates", value: selectedCandidates, icon: CheckCircle, color: "text-accent", bg: "bg-primary border border-border" },
    { name: "Joined Candidates", value: joinedCandidates, icon: Briefcase, color: "text-accent", bg: "bg-primary border border-border" },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-light">{recruiter.name}</h1>
          <p className="text-sm text-muted mt-1">Recruiter Details & Performance Overview</p>
        </div>
        <a href="/recruiters" className="text-sm font-medium text-muted hover:text-light transition-colors">
          &larr; Back to Recruiters
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 bg-primary-lighter p-6 rounded-lg shadow border border-border">
          <h2 className="text-lg font-semibold text-light mb-4 border-b pb-2">Profile Information</h2>
          <div className="space-y-4 text-sm">
            <div>
              <span className="block text-muted font-medium">Email Address</span>
              <span className="text-light">{recruiter.email}</span>
            </div>
            <div>
              <span className="block text-muted font-medium">Mobile Number</span>
              <span className="text-light">{recruiter.mobile || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-muted font-medium">Location</span>
              <span className="text-light">{recruiter.location || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-muted font-medium">Account Status</span>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold mt-1 ${recruiter.status === 'ACTIVE' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-red-900/20 text-red-400 border border-red-800/30'}`}>
                {recruiter.status}
              </span>
            </div>
            <div>
              <span className="block text-muted font-medium">Registered On</span>
              <span className="text-light">{new Date(recruiter.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <a href={`/recruiters/${id}/edit`} className="block w-full text-center bg-accent hover:bg-accent-hover text-primary font-medium py-2 rounded transition-colors">
              Edit Recruiter Profile
            </a>
          </div>
        </div>


        <div className="md:col-span-2 space-y-6">

          <div className="bg-primary-lighter rounded-lg shadow border border-border p-6">
            <h2 className="text-lg font-semibold text-light mb-4 border-b pb-2 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-muted" /> Commercial & Payment Terms
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Commission %</span>
                <span className="text-light font-bold text-lg">{recruiter.commissionPercentage || 0}%</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Payment Terms</span>
                <span className="text-light font-medium">{recruiter.paymentTermsDays ? `${recruiter.paymentTermsDays} Days` : 'Not Set'}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Release Condition</span>
                <span className="text-light font-medium">{recruiter.paymentReleaseCondition || 'Not Set'}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Recruiter Type</span>
                <span className="text-light font-medium">{recruiter.recruiterType || 'Not Set'}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Agreement Signed</span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${recruiter.agreementSigned ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-red-900/20 text-red-400 border border-red-800/30'}`}>
                  {recruiter.agreementSigned ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Agreement Date</span>
                <span className="text-light font-medium">{recruiter.agreementDate ? new Date(recruiter.agreementDate).toLocaleDateString() : 'Not Set'}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Expiry Date</span>
                <span className="text-light font-medium">{recruiter.agreementExpiryDate ? new Date(recruiter.agreementExpiryDate).toLocaleDateString() : 'Not Set'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {stats.map((stat) => (
              <div
                key={stat.name}
                className="overflow-hidden rounded-lg bg-primary-lighter px-4 py-5 shadow border border-border"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="truncate text-sm font-medium text-muted">{stat.name}</dt>
                    <dd>
                      <div className="text-2xl font-bold text-light">{stat.value}</div>
                    </dd>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
