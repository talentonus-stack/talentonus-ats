import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { Briefcase, FileText, Calendar, CheckCircle, ExternalLink, Mail, Phone, User, Users, Clock, MapPin, Building, IndianRupee, ShieldAlert, FileOutput, ShieldCheck } from "lucide-react"
import DocumentManager from "./DocumentManager"

export default async function CompanyDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

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
            select: { status: true }
          }
        },
        orderBy: { postedDate: "desc" }
      },
      documents: {
        orderBy: { uploadedAt: "desc" }
      }
    }
  })

  if (!company) notFound()

  // Calculate Company Statistics
  const activeJobs = company.jobs.filter(j => j.status === "OPEN").length

  let totalApplications = 0
  let totalInterviews = 0
  let totalHires = 0

  company.jobs.forEach(job => {
    totalApplications += job.applications.length
    job.applications.forEach(app => {
      if (['INTERVIEW_SCHEDULED', 'L1_CLEARED', 'L2_CLEARED', 'SELECTED', 'JOINED'].includes(app.status)) {
        totalInterviews++
      }
      if (app.status === 'JOINED') {
        totalHires++
      }
    })
  })

  const stats = [
    { name: "Active Jobs", value: activeJobs, icon: Briefcase },
    { name: "Total Applications", value: totalApplications, icon: FileText },
    { name: "Interviews", value: totalInterviews, icon: Calendar },
    { name: "Total Hires", value: totalHires, icon: CheckCircle },
  ]

  const formatCurrency = (val: string | null) => {
    if (!val) return "N/A"
    if (val.startsWith("₹") || val.includes("%")) return val;
    const num = parseInt(val.replace(/,/g, ''), 10)
    if (isNaN(num)) return val
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num)
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-light">{company.name}</h1>
            {company.isConfidential && (
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
        <Link
          href={`/companies/${company.id}/edit`}
          className="inline-flex items-center rounded-lg bg-primary border border-border px-5 py-2.5 text-sm font-semibold text-light hover:border-accent hover:text-accent transition-colors"
        >
          Edit Company
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Col: Contact Info & Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 shadow-lg">
             <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-4 border-b border-border pb-2">Contact Details</h3>

             <div className="space-y-4">
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
             </div>

             {company.notes && (
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted font-semibold uppercase mb-2 text-red-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Internal Notes (Admin Only)
                  </p>
                  <p className="text-sm text-light bg-primary p-3 rounded-lg border border-border whitespace-pre-wrap">{company.notes}</p>
                </div>
             )}
          </div>
        </div>

        {/* Right Col: Dashboard Stats & Jobs */}
        <div className="lg:col-span-3 space-y-6">

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-primary-lighter rounded-xl border border-border p-5 hover:border-accent transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{stat.name}</span>
                  <stat.icon className="w-4 h-4 text-accent opacity-80" />
                </div>
                <p className="text-3xl font-bold text-light">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Commercial Terms */}
            <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-6">
              <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-4 border-b border-border pb-2 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-accent" /> Commercial Terms
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted">Fee Type</span>
                  <span className="text-sm font-bold text-light bg-primary px-2 py-1 rounded">{company.feeType}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted">Fee Value</span>
                  <span className="text-sm font-bold text-accent">{formatCurrency(company.feeValue)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted">Payment Terms</span>
                  <span className="text-sm font-bold text-light">{company.paymentTerms || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted">Replacement Period</span>
                  <span className="text-sm font-bold text-light">{company.replacementPeriod || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted">GST</span>
                  <span className={`text-sm font-bold ${company.gstApplicable ? 'text-accent' : 'text-muted'}`}>
                    {company.gstApplicable ? 'Applicable' : 'Not Applicable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interview Process Overview */}
            <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-6">
              <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-4 border-b border-border pb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" /> Interview Process
              </h3>
              <div className="space-y-4">
                {[
                  { name: company.round1Name || "Round 1", duration: company.round1Duration },
                  { name: company.round2Name || "Round 2", duration: company.round2Duration },
                  { name: company.round3Name || "Round 3", duration: company.round3Duration },
                  { name: company.finalRoundName || "Final Round", duration: company.finalRoundDuration }
                ].filter(r => r.name !== "Round 1" && r.name !== "Round 2" && r.name !== "Round 3" && r.name !== "Final Round" || (r.name && r.name !== `Round ${r.name.slice(-1)}` && r.name !== "Final Round" || r.duration)).map((round, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary border border-border flex items-center justify-center text-xs font-bold text-accent shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-light">{round.name}</p>
                      {round.duration && <p className="text-xs text-muted mt-0.5">{round.duration}</p>}
                    </div>
                  </div>
                ))}
                {(!company.round1Name && !company.round2Name && !company.round3Name && !company.finalRoundName) && (
                   <p className="text-sm text-muted italic">Interview process not defined yet.</p>
                )}
              </div>
            </div>
          </div>

          <DocumentManager companyId={company.id} initialDocuments={company.documents as any} />

          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg overflow-hidden">
             <div className="p-6 border-b border-border flex justify-between items-center bg-primary/30">
               <h3 className="text-lg font-bold text-light flex items-center gap-2">
                 <Briefcase className="w-5 h-5 text-accent" />
                 Job Postings
               </h3>
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-border">
                 <thead className="bg-primary-lighter">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Job Title</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                     <th className="px-6 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">Total Candidates</th>
                     <th className="px-6 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">Hired</th>
                     <th className="px-6 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Posted Date</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/50 bg-primary/20">
                   {company.jobs.map((job) => {
                     const hired = job.applications.filter(a => a.status === 'JOINED').length;
                     return (
                       <tr key={job.id} className="hover:bg-primary/50 transition-colors">
                         <td className="whitespace-nowrap px-6 py-4">
                           <Link href={`/jobs/${job.id}/edit`} className="text-sm font-bold text-light hover:text-accent transition-colors">
                             {job.title}
                           </Link>
                           <div className="text-xs text-muted mt-0.5">{job.location}</div>
                         </td>
                         <td className="whitespace-nowrap px-6 py-4">
                           <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${job.status === 'OPEN' ? 'bg-accent/10 text-accent border-accent/20' : job.status === 'ON_HOLD' ? 'bg-orange-900/20 text-orange-400 border-orange-800/30' : 'bg-border text-muted border-border'}`}>
                             {job.status}
                           </span>
                         </td>
                         <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-light">{job._count.applications}</td>
                         <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-accent">{hired}</td>
                         <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-muted">
                           {new Date(job.postedDate).toLocaleDateString()}
                         </td>
                       </tr>
                     )
                   })}
                   {company.jobs.length === 0 && (
                     <tr>
                       <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted">No jobs posted for this company yet.</td>
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
