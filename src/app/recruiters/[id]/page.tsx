import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Users, FileText, CheckCircle, Briefcase, LinkIcon, ShieldCheck, Download, Edit3, Lock } from "lucide-react"

export default async function RecruiterDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  const { id } = await params;

  const recruiter = await prisma.user.findUnique({
    where: { id, role: "RECRUITER" }
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
    { name: "Total Candidates Submitted", value: totalCandidates, icon: Users, color: "text-accent", bg: "bg-accent" },
    { name: "Total Applications", value: totalApplications, icon: FileText, color: "text-orange-400", bg: "bg-yellow-100" },
    { name: "Selected Candidates", value: selectedCandidates, icon: CheckCircle, color: "text-accent", bg: "bg-accent/10" },
    { name: "Joined Candidates", value: joinedCandidates, icon: Briefcase, color: "text-purple-400", bg: "bg-purple-900/20" },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-light">{recruiter.name}</h1>
          <p className="text-sm text-muted mt-1">Recruiter Details & Performance Overview</p>
        </div>
        <a href="/recruiters" className="text-sm font-medium text-accent hover:text-accent-hover">
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
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold mt-1 ${recruiter.status === 'ACTIVE' ? 'bg-accent/10 text-accent' : 'bg-red-100 text-red-800'}`}>
                {recruiter.status}
              </span>
            </div>
            <div>
              <span className="block text-muted font-medium">Registered On</span>
              <span className="text-light">{new Date(recruiter.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <a href={`/recruiters/${id}/edit`} className="block w-full text-center bg-primary border border-border hover:border-accent hover:text-accent text-light font-medium py-2 rounded transition-colors">
              Edit Recruiter Details
            </a>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Professional Links */}
            <div className="bg-primary-lighter rounded-2xl border border-border p-6 shadow-lg">
               <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-border pb-3">
                 <LinkIcon className="w-4 h-4 text-accent" /> Professional Links
               </h3>
               <div className="space-y-3">
                 {recruiter.linkedinUrl ? (
                   <a href={recruiter.linkedinUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-accent hover:underline">
                     View LinkedIn Profile
                   </a>
                 ) : <span className="text-sm text-muted block">LinkedIn Not Provided</span>}

                 {recruiter.resumeLink ? (
                   <a href={recruiter.resumeLink} target="_blank" rel="noopener noreferrer" className="block text-sm text-accent hover:underline">
                     View External Resume
                   </a>
                 ) : <span className="text-sm text-muted block">Resume Link Not Provided</span>}

                 {recruiter.whatsappNumber ? (
                   <a href={`https://wa.me/${recruiter.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="block text-sm text-accent hover:underline">
                     WhatsApp: {recruiter.whatsappNumber}
                   </a>
                 ) : <span className="text-sm text-muted block">WhatsApp Not Provided</span>}
               </div>
            </div>

            {/* Documents Vault */}
            <div className="bg-primary-lighter rounded-2xl border border-border p-6 shadow-lg">
               <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-border pb-3">
                 <ShieldCheck className="w-4 h-4 text-accent" /> Documents Vault
               </h3>
               <div className="grid grid-cols-2 gap-3">
                 {recruiter.resumeVaultUrl ? (
                   <a href={recruiter.resumeVaultUrl} target="_blank" rel="noopener noreferrer" className="bg-primary/50 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-accent/30 transition-colors group">
                     <Download className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                     <span className="text-xs font-medium text-light text-center">Resume</span>
                   </a>
                 ) : (
                   <div className="bg-primary/20 border border-border/30 rounded-xl p-3 flex flex-col items-center justify-center gap-2 opacity-50">
                     <FileText className="w-5 h-5 text-muted" />
                     <span className="text-xs font-medium text-muted text-center">No Resume</span>
                   </div>
                 )}

                 {recruiter.panCardUrl ? (
                   <a href={recruiter.panCardUrl} target="_blank" rel="noopener noreferrer" className="bg-primary/50 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-accent/30 transition-colors group">
                     <Download className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                     <span className="text-xs font-medium text-light text-center">PAN Card</span>
                   </a>
                 ) : (
                   <div className="bg-primary/20 border border-border/30 rounded-xl p-3 flex flex-col items-center justify-center gap-2 opacity-50">
                     <FileText className="w-5 h-5 text-muted" />
                     <span className="text-xs font-medium text-muted text-center">No PAN Card</span>
                   </div>
                 )}

                 {recruiter.aadhaarUrl ? (
                   <a href={recruiter.aadhaarUrl} target="_blank" rel="noopener noreferrer" className="bg-primary/50 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-accent/30 transition-colors group">
                     <Download className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                     <span className="text-xs font-medium text-light text-center">Aadhaar</span>
                   </a>
                 ) : (
                   <div className="bg-primary/20 border border-border/30 rounded-xl p-3 flex flex-col items-center justify-center gap-2 opacity-50">
                     <FileText className="w-5 h-5 text-muted" />
                     <span className="text-xs font-medium text-muted text-center">No Aadhaar</span>
                   </div>
                 )}

                 {recruiter.bankDetailsUrl ? (
                   <a href={recruiter.bankDetailsUrl} target="_blank" rel="noopener noreferrer" className="bg-primary/50 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-accent/30 transition-colors group">
                     <Download className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                     <span className="text-xs font-medium text-light text-center">Bank Details</span>
                   </a>
                 ) : (
                   <div className="bg-primary/20 border border-border/30 rounded-xl p-3 flex flex-col items-center justify-center gap-2 opacity-50">
                     <FileText className="w-5 h-5 text-muted" />
                     <span className="text-xs font-medium text-muted text-center">No Bank Details</span>
                   </div>
                 )}
               </div>
            </div>

          </div>

          {/* Private Notes (Readonly for Admin) */}
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 shadow-lg">
             <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-border pb-3">
               <Lock className="w-4 h-4 text-accent" /> Recruiter's Private Notes
             </h3>
             <div className="bg-primary border border-border rounded-xl p-4 min-h-[100px]">
               {recruiter.notes ? (
                 <p className="text-sm text-light whitespace-pre-wrap">{recruiter.notes}</p>
               ) : (
                 <p className="text-sm text-muted italic">The recruiter has not added any private notes.</p>
               )}
             </div>
          </div>

        </div>
      </div>

    </div>
  )
}
