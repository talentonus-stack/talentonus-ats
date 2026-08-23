import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { Briefcase, Calendar, CheckCircle, ExternalLink, Mail, Phone, User, Users, Clock, MapPin, Building, ShieldAlert, ShieldCheck , FileText } from "lucide-react"

export default async function CompanyDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const user = session.user as any
  const isAdmin = user.role === "ADMIN"

  const { id } = await params

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      jobs: {
        include: {
          _count: {
            select: { applications: true }
          },
          applications: {
            include: { candidate: true }
          }
        },
        orderBy: { postedDate: "desc" }
      }
    }
  })

  if (!company) notFound()

  // Recent Candidate Activity logic
  const recentActivity = company.jobs.flatMap(j => j.applications.map(app => ({ ...app, job: j }))).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)

  // Recruiter Leaderboard logic
  const recruiterStats: Record<string, { name: string, submitted: number, shortlisted: number, interviews: number, selected: number, joined: number }> = {}

  company.jobs.forEach(job => {
    job.applications.forEach(app => {
      const recId = app.candidate?.recruiterId || 'system'
      if (!recruiterStats[recId]) {
        recruiterStats[recId] = {
          name: app.candidate?.recruiterId ? 'Recruiter User' : 'System / Direct',
          submitted: 0,
          shortlisted: 0,
          interviews: 0,
          selected: 0,
          joined: 0
        }
      }

      recruiterStats[recId].submitted++
      if (['SCREENING', 'L1_SCHEDULED', 'L2_SCHEDULED', 'FINAL_ROUND_SCHEDULED', 'L1_CLEARED', 'L2_CLEARED', 'SELECTED', 'JOINED'].includes(app.status)) recruiterStats[recId].shortlisted++
      if (['L1_SCHEDULED', 'L2_SCHEDULED', 'FINAL_ROUND_SCHEDULED', 'L1_CLEARED', 'L2_CLEARED', 'SELECTED', 'JOINED'].includes(app.status)) recruiterStats[recId].interviews++
      if (['SELECTED', 'JOINED'].includes(app.status)) recruiterStats[recId].selected++
      if (app.status === 'JOINED') recruiterStats[recId].joined++
    })
  })

  // Try to map real names for recruiters
  const recruiterIds = Object.keys(recruiterStats).filter(id => id !== 'system')
  if (recruiterIds.length > 0) {
    const recruiters = await prisma.user.findMany({
      where: { id: { in: recruiterIds } },
      select: { id: true, name: true }
    })
    recruiters.forEach(r => {
      if (recruiterStats[r.id]) {
        recruiterStats[r.id].name = r.name || 'Unknown Recruiter'
      }
    })
  }

  const leaderboard = Object.values(recruiterStats).sort((a, b) => b.selected - a.selected || b.interviews - a.interviews).map(r => ({
    ...r,
    conversion: r.submitted > 0 ? Math.round((r.selected / r.submitted) * 100) : 0
  }))
  const maxSubmitted = leaderboard.length > 0 ? Math.max(...leaderboard.map(r => r.submitted)) : 1

  // KPI Summary calculations
  const totalActiveJobs = company.jobs.filter(j => j.status === 'OPEN').length
  const allApplications = company.jobs.flatMap(j => j.applications)
  const totalCandidates = allApplications.length
  const totalInterviews = allApplications.filter(a => ['L1_SCHEDULED', 'L2_SCHEDULED', 'FINAL_ROUND_SCHEDULED', 'L1_CLEARED', 'L2_CLEARED', 'SELECTED', 'JOINED'].includes(a.status)).length
  const totalSelected = allApplications.filter(a => ['SELECTED', 'JOINED'].includes(a.status)).length
  const totalJoined = allApplications.filter(a => a.status === 'JOINED').length

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-light">{company.name}</h1>
            {isAdmin && company.isConfidential && (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase border bg-accent/10 text-accent border-accent/20 gap-1">
                <ShieldCheck className="w-3 h-3" /> Confidential
              </span>
            )}
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase border ${company.status === 'ACTIVE' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
              {company.status}
            </span>
          </div>
          <p className="mt-2 text-muted flex items-center gap-2">
            {company.industry || "Industry not specified"}
            {company.website && (
               <>
                 <span className="text-border">•</span>
                 <a href={company.website} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-1">
                   {company.website} <ExternalLink className="w-3 h-3" />
                 </a>
               </>
            )}
          </p>
        </div>
        {isAdmin && (
          <Link
            href={`/companies/${company.id}/edit`}
            className="inline-flex items-center rounded-lg bg-primary border border-border px-5 py-2.5 text-sm font-semibold text-light hover:border-accent hover:text-accent transition-colors"
          >
            Edit Company
          </Link>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center">
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Active Jobs</p>
          <p className="text-2xl font-black text-light">{totalActiveJobs}</p>
        </div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center">
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Total Candidates</p>
          <p className="text-2xl font-black text-light">{totalCandidates}</p>
        </div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center">
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Interviews</p>
          <p className="text-2xl font-black text-light">{totalInterviews}</p>
        </div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center">
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Selected</p>
          <p className="text-2xl font-black text-accent">{totalSelected}</p>
        </div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center">
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Joined</p>
          <p className="text-2xl font-black text-light">{totalJoined}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Col: Contact Info & Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 shadow-lg">
             <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-4 border-b border-border pb-2">Company Information</h3>

             <div className="space-y-4">
               {isAdmin && (
                 <>
                   <div className="flex items-start gap-3">
                     <User className="w-4 h-4 text-muted mt-0.5" />
                     <div>
                       <p className="text-xs text-muted font-semibold uppercase">Contact Person</p>
                       <p className="text-sm text-light font-medium">{company.contactPerson || "N/A"}</p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3">
                     <Mail className="w-4 h-4 text-muted mt-0.5" />
                     <div>
                       <p className="text-xs text-muted font-semibold uppercase">Email</p>
                       {company.email ? (
                          <a href={`mailto:${company.email}`} className="text-sm text-accent hover:underline font-medium">{company.email}</a>
                       ) : (
                          <p className="text-sm text-light font-medium">N/A</p>
                       )}
                     </div>
                   </div>

                   <div className="flex items-start gap-3">
                     <Phone className="w-4 h-4 text-muted mt-0.5" />
                     <div>
                       <p className="text-xs text-muted font-semibold uppercase">Phone</p>
                       <p className="text-sm text-light font-medium">{company.phone || "N/A"}</p>
                     </div>
                   </div>
                 </>
               )}

               <div className="flex items-start gap-3">
                 <MapPin className="w-4 h-4 text-muted mt-0.5" />
                 <div>
                   <p className="text-xs text-muted font-semibold uppercase">Location</p>
                   <p className="text-sm text-light font-medium">{company.location || "N/A"}</p>
                 </div>
               </div>

               <div className="flex items-start gap-3">
                 <Users className="w-4 h-4 text-muted mt-0.5" />
                 <div>
                   <p className="text-xs text-muted font-semibold uppercase">Employees</p>
                   <p className="text-sm text-light font-medium">{company.totalEmployees || "N/A"}</p>
                 </div>
               </div>

               <div className="flex items-start gap-3">
                 <Clock className="w-4 h-4 text-muted mt-0.5" />
                 <div>
                   <p className="text-xs text-muted font-semibold uppercase">Working Hours</p>
                   <p className="text-sm text-light font-medium">{company.workingDays || "N/A"} {company.workingHours ? `• ${company.workingHours}` : ""}</p>
                 </div>
               </div>

               {company.clientSince && (
                 <div className="flex items-start gap-3">
                   <Calendar className="w-4 h-4 text-muted mt-0.5" />
                   <div>
                     <p className="text-xs text-muted font-semibold uppercase">Client Since</p>
                     <p className="text-sm text-light font-medium">{company.clientSince.toLocaleDateString()}</p>
                   </div>
                 </div>
               )}
             </div>

             {isAdmin && company.notes && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-orange-400" />
                      <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Internal Client Notes</p>
                    </div>
                  </div>
                  <div className="bg-orange-900/10 p-4 rounded-xl border border-orange-500/20 shadow-inner">
                    <p className="text-sm text-orange-200/90 whitespace-pre-wrap leading-relaxed italic">{company.notes}</p>
                  </div>
                </div>
             )}
          </div>
        </div>

        {/* Right Col: Dashboard Sections */}
        <div className="lg:col-span-3 space-y-6">


          {isAdmin && (
            <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-6">
              <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-4 border-b border-border pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                Commercial Terms (Admin Only)
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Recruitment Fee</span>
                  <span className="text-light font-medium">{company.recruitmentFeePercentage ? `${company.recruitmentFeePercentage}%` : 'Not Set'}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Payment Terms</span>
                  <span className="text-light font-medium">{company.paymentTermsDays ? `${company.paymentTermsDays} Days` : 'Not Set'}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Replacement Period</span>
                  <span className="text-light font-medium">{company.replacementPeriodDays ? `${company.replacementPeriodDays} Days` : 'Not Set'}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">GST Applicable</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${company.gstApplicable ? 'bg-accent/10 text-accent border-accent/20' : 'bg-primary border-border text-muted'}`}>
                    {company.gstApplicable ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Agreement Signed</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${company.clientAgreementSigned ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                    {company.clientAgreementSigned ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Agreement Expiry</span>
                  <span className="text-light font-medium">{company.agreementExpiryDate ? new Date(company.agreementExpiryDate).toLocaleDateString() : 'Not Set'}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Remarks</span>
                  <span className="text-light text-sm">{company.commercialRemarks || 'None'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interview Process Overview */}
            <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-6">
              <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-4 border-b border-border pb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" /> Interview Process
              </h3>
              <div className="space-y-4">
                {[
                  { name: company.round1Name, desc: company.round1Desc },
                  { name: company.round2Name, desc: company.round2Desc },
                  { name: company.round3Name, desc: company.round3Desc },
                  { name: company.finalRoundName, desc: company.finalRoundDesc }
                ].filter(r => r.name || r.desc).map((round, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary border border-border flex items-center justify-center text-xs font-bold text-accent shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-light">{round.name || `Round ${i + 1}`}</p>
                      {round.desc && <p className="text-xs text-muted mt-1 whitespace-pre-wrap">{round.desc}</p>}
                    </div>
                  </div>
                ))}
                {(!company.round1Name && !company.round2Name && !company.round3Name && !company.finalRoundName) && (
                   <p className="text-sm text-muted italic">Interview process not defined yet.</p>
                )}
              </div>
            </div>


          {/* Recent Candidate Activity */}
          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-6 mt-6">
            <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-4 border-b border-border pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" /> Recent Candidate Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((app: any, idx: number) => {
                let displayStatus = app.status.replace(/_/g, ' ')
                if (app.status === 'NEW' || app.status === 'SCREENING') displayStatus = 'SUBMITTED'
                else if (app.status === 'L1_CLEARED' || app.status === 'L2_CLEARED') displayStatus = 'SHORTLISTED'

                return (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-primary/20 hover:border-accent/30 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-light">{app.candidate?.firstName} {app.candidate?.lastName}</p>
                      <p className="text-xs text-muted mt-0.5">{app.job?.title}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border bg-accent/10 text-accent border-accent/20">
                        {displayStatus}
                      </span>
                      <p className="text-[10px] text-muted mt-1 uppercase tracking-wider">{new Date(app.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )
              })}
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted text-center py-4">No recent activity.</p>
              )}
            </div>
          </div>

            {/* Recruiter Leaderboard */}
            <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-6">
              <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-4 border-b border-border pb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" /> Recruiter Leaderboard
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border/50">
                  <thead>
                    <tr>
                      <th className="pb-2 text-left text-[10px] font-bold text-muted uppercase tracking-wider">Recruiter</th>
                      <th className="pb-2 px-2 text-center text-[10px] font-bold text-muted uppercase tracking-wider">Submitted</th>
                      <th className="pb-2 px-2 text-center text-[10px] font-bold text-muted uppercase tracking-wider">Shortlisted</th>
                      <th className="pb-2 px-2 text-center text-[10px] font-bold text-muted uppercase tracking-wider">Interviews</th>
                      <th className="pb-2 px-2 text-center text-[10px] font-bold text-muted uppercase tracking-wider">Selected</th>
                      <th className="pb-2 px-2 text-center text-[10px] font-bold text-muted uppercase tracking-wider">Joined</th>
                      <th className="pb-2 px-2 text-center text-[10px] font-bold text-muted uppercase tracking-wider">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {leaderboard.map((recruiter, idx) => (
                      <tr key={idx} className="group hover:bg-primary/20 transition-colors">
                        <td className="py-2 whitespace-nowrap">
                          <div className="text-sm font-semibold text-light group-hover:text-white transition-colors">{recruiter.name}</div>
                        </td>
                        <td className="px-2 py-2 text-center whitespace-nowrap text-sm text-light">{recruiter.submitted}</td>
                        <td className="px-2 py-2 text-center whitespace-nowrap text-sm text-light">{recruiter.shortlisted}</td>
                        <td className="px-2 py-2 text-center whitespace-nowrap text-sm text-light">{recruiter.interviews}</td>
                        <td className="px-2 py-2 text-center whitespace-nowrap text-sm text-accent font-bold">{recruiter.selected}</td>
                        <td className="px-2 py-2 text-center whitespace-nowrap text-sm text-light">{recruiter.joined}</td>
                        <td className="px-2 py-2 text-center whitespace-nowrap text-sm text-light">{recruiter.conversion}%</td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-sm text-muted">No candidate activity yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg overflow-hidden">
             <div className="p-6 border-b border-border flex justify-between items-center bg-primary/30">
               <h3 className="text-lg font-bold text-light flex items-center gap-2">
                 <Briefcase className="w-5 h-5 text-accent" />
                 Open Positions
               </h3>
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-border">
                 <thead className="bg-primary-lighter">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Job Title</th>
                     <th className="px-6 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">Applications</th>
                     <th className="px-6 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">Interviews</th>
                     <th className="px-6 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">Selected</th>
                     <th className="px-6 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">Joined</th>
                     <th className="px-6 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/50 bg-primary/20">
                   {company.jobs.map((job) => {
                     const totalCands = job.applications.length
                     const ints = job.applications.filter(a => ['L1_SCHEDULED', 'L2_SCHEDULED', 'FINAL_ROUND_SCHEDULED', 'L1_CLEARED', 'L2_CLEARED', 'SELECTED', 'JOINED'].includes(a.status)).length
                     const sel = job.applications.filter(a => ['SELECTED', 'JOINED'].includes(a.status)).length
                     const joined = job.applications.filter(a => a.status === 'JOINED').length

                     return (
                       <tr key={job.id} className="hover:bg-primary/50 transition-colors">
                         <td className="whitespace-nowrap px-6 py-4">
                           <Link href={isAdmin ? `/jobs/${job.id}/edit` : `/recruiter/jobs`} className="text-sm font-bold text-light hover:text-accent transition-colors">
                             {job.title}
                           </Link>
                           <div className="text-xs text-muted mt-0.5">{job.location}</div>
                         </td>
                         <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-light">{totalCands}</td>
                         <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-light">{ints}</td>
                         <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-accent">{sel}</td>
                         <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-light">{joined}</td>
                         <td className="whitespace-nowrap px-6 py-4 text-right">
                           <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${job.status === 'OPEN' ? 'bg-accent/10 text-accent border-accent/20' : job.status === 'ON_HOLD' ? 'bg-orange-900/20 text-orange-400 border-orange-800/30' : 'bg-border text-muted border-border'}`}>
                             {job.status}
                           </span>
                         </td>
                       </tr>
                     )
                   })}
                   {company.jobs.length === 0 && (
                     <tr>
                       <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted">No jobs posted for this company yet.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>

        </div>

      </div>
    </div>
  )
}
