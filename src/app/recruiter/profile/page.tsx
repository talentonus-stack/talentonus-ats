import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Users, CheckCircle, Award, UserPlus, Mail, Phone, MapPin, Briefcase, Calendar, Edit3, ShieldCheck, TrendingUp, DollarSign, FileText, Link as LinkIcon, Settings, Lock } from "lucide-react"
import { timeAgo } from "@/lib/dateUtils"

export default async function RecruiterProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }

  const recruiterId = (session.user as any).id

  const recruiter = await prisma.user.findUnique({
    where: { id: recruiterId }
  })

  if (!recruiter) {
    redirect("/recruiter-login")
  }

  // Fetch applications tied to candidates submitted by this recruiter
  const applications = await prisma.application.findMany({
    where: {
      candidate: {
        recruiterId: recruiterId
      }
    },
    include: {
      job: true,
      candidate: true
    },
    orderBy: { updatedAt: 'desc' }
  })

  // Placement Statistics
  const totalSubmitted = applications.length
  const interviewed = applications.filter(a => ['INTERVIEW_SCHEDULED', 'L1_CLEARED', 'L2_CLEARED', 'SELECTED', 'JOINED'].includes(a.status)).length
  const selected = applications.filter(a => a.status === "SELECTED" || a.status === "JOINED").length
  const joined = applications.filter(a => a.status === "JOINED").length

  const selectionRatio = totalSubmitted > 0 ? Math.round((selected / totalSubmitted) * 100) : 0
  const joiningRatio = selected > 0 ? Math.round((joined / selected) * 100) : 0

  // Placement Earnings Data (Mock logic based on joined candidates)
  // Assuming average placement fee commission is ₹50,000 per joined candidate
  const commissionPerJoin = 50000;
  const totalPlacements = joined;
  const totalRevenue = totalPlacements * (commissionPerJoin * 5); // Example: total client billing
  const totalCommissionEarned = totalPlacements * commissionPerJoin;
  const commissionReceived = Math.floor(totalCommissionEarned * 0.8); // 80% received
  const commissionPending = totalCommissionEarned - commissionReceived;

  // Placement Commission History
  const commissionHistory = applications
    .filter(a => a.status === 'JOINED' || a.status === 'SELECTED')
    .map(app => {
      const isPaid = app.status === 'JOINED' && Math.random() > 0.3; // mock payment status
      return {
        id: app.id,
        candidateName: `${app.candidate.firstName} ${app.candidate.lastName || ''}`,
        company: 'Confidential Client', // recruiter view
        position: app.job.title,
        placementDate: app.updatedAt.toLocaleDateString(),
        amount: commissionPerJoin,
        status: isPaid ? 'PAID' : 'PENDING'
      }
    })

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-6 pb-12">

      {/* Header Profile Section */}
      <div className="bg-primary-lighter rounded-2xl border border-border p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary via-accent/5 to-primary border-b border-border/50"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-end pt-12">

          {/* Avatar */}
          <div className="h-32 w-32 rounded-2xl bg-primary border-2 border-border shadow-2xl flex items-center justify-center shrink-0 relative overflow-hidden">
             <span className="text-5xl font-black text-light opacity-50">{recruiter.name?.charAt(0) || "R"}</span>
             <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(170,255,0,0.1)] rounded-2xl"></div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
             <div className="flex items-center justify-between">
               <div>
                 <h1 className="text-3xl font-bold text-light">{recruiter.name}</h1>
                 <p className="text-accent font-medium mt-1">Senior Technical Recruiter</p>
               </div>
               <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase border ${recruiter.status === 'ACTIVE' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                 {recruiter.status}
               </span>
             </div>

             <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-muted">
               <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {recruiter.email}</div>
               {recruiter.mobile && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {recruiter.mobile}</div>}
               <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {recruiter.location || "Remote"}</div>
               <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Joined {new Date(recruiter.createdAt).toLocaleDateString()}</div>
             </div>
          </div>
        </div>
      </div>

      {/* Placement Earnings Center (Top Row) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent/5 blur-xl pointer-events-none"></div>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Total Placements</span>
          <span className="text-2xl font-black text-light">{totalPlacements}</span>
        </div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent/5 blur-xl pointer-events-none"></div>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Revenue Generated</span>
          <span className="text-2xl font-black text-light">₹{totalRevenue.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent/10 blur-xl pointer-events-none"></div>
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">Commission Earned</span>
          <span className="text-2xl font-black text-accent">₹{totalCommissionEarned.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-green-500/5 blur-xl pointer-events-none"></div>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Commission Received</span>
          <span className="text-2xl font-black text-green-400">₹{commissionReceived.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-orange-500/5 blur-xl pointer-events-none"></div>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Commission Pending</span>
          <span className="text-2xl font-black text-orange-400">₹{commissionPending.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">

          {/* Placement Statistics */}
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 shadow-lg">
             <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-border pb-3">
               <TrendingUp className="w-4 h-4 text-accent" /> Placement Statistics
             </h3>
             <div className="space-y-4">
               <div className="flex justify-between items-center bg-primary/30 p-3 rounded-lg border border-border/50">
                 <span className="text-sm font-medium text-muted">Candidates Submitted</span>
                 <span className="text-sm font-bold text-light">{totalSubmitted}</span>
               </div>
               <div className="flex justify-between items-center bg-primary/30 p-3 rounded-lg border border-border/50">
                 <span className="text-sm font-medium text-muted">Candidates Interviewed</span>
                 <span className="text-sm font-bold text-light">{interviewed}</span>
               </div>
               <div className="flex justify-between items-center bg-primary/30 p-3 rounded-lg border border-border/50">
                 <span className="text-sm font-medium text-muted">Candidates Selected</span>
                 <span className="text-sm font-bold text-accent">{selected}</span>
               </div>
               <div className="flex justify-between items-center bg-primary/30 p-3 rounded-lg border border-border/50">
                 <span className="text-sm font-medium text-muted">Candidates Joined</span>
                 <span className="text-sm font-bold text-green-400">{joined}</span>
               </div>
               <div className="pt-2 border-t border-border">
                 <div className="flex justify-between items-center p-2">
                   <span className="text-xs font-bold text-muted uppercase">Selection Ratio</span>
                   <span className="text-xs font-bold text-light">{selectionRatio}%</span>
                 </div>
                 <div className="flex justify-between items-center p-2">
                   <span className="text-xs font-bold text-muted uppercase">Joining Ratio</span>
                   <span className="text-xs font-bold text-light">{joiningRatio}%</span>
                 </div>
               </div>
             </div>
          </div>

          {/* Social & Professional Links */}
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 shadow-lg">
             <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-border pb-3">
               <LinkIcon className="w-4 h-4 text-accent" /> Professional Links
             </h3>
             <div className="space-y-3">
               <a href="#" className="flex items-center gap-3 p-3 bg-primary/50 border border-border/50 rounded-xl hover:border-accent/30 hover:bg-primary transition-all group">
                 <div className="h-8 w-8 rounded-full bg-blue-900/20 flex items-center justify-center border border-blue-800/30">
                   <UserPlus className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                 </div>
                 <span className="text-sm font-medium text-light group-hover:text-white">LinkedIn Profile</span>
               </a>
               <a href="#" className="flex items-center gap-3 p-3 bg-primary/50 border border-border/50 rounded-xl hover:border-accent/30 hover:bg-primary transition-all group">
                 <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                   <FileText className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                 </div>
                 <span className="text-sm font-medium text-light group-hover:text-white">Download Resume</span>
               </a>
               <a href="#" className="flex items-center gap-3 p-3 bg-primary/50 border border-border/50 rounded-xl hover:border-accent/30 hover:bg-primary transition-all group">
                 <div className="h-8 w-8 rounded-full bg-green-900/20 flex items-center justify-center border border-green-800/30">
                   <Phone className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
                 </div>
                 <span className="text-sm font-medium text-light group-hover:text-white">WhatsApp Contact</span>
               </a>
             </div>
          </div>

          {/* Documents Vault */}
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 shadow-lg">
             <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-border pb-3">
               <ShieldCheck className="w-4 h-4 text-accent" /> Documents Vault
             </h3>
             <div className="grid grid-cols-2 gap-3">
               <div className="bg-primary/50 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-accent/30 transition-colors cursor-pointer">
                 <FileText className="w-5 h-5 text-muted" />
                 <span className="text-xs font-medium text-light text-center">Resume</span>
               </div>
               <div className="bg-primary/50 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-accent/30 transition-colors cursor-pointer">
                 <FileText className="w-5 h-5 text-muted" />
                 <span className="text-xs font-medium text-light text-center">PAN Card</span>
               </div>
               <div className="bg-primary/50 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-accent/30 transition-colors cursor-pointer">
                 <FileText className="w-5 h-5 text-muted" />
                 <span className="text-xs font-medium text-light text-center">Aadhaar</span>
               </div>
               <div className="bg-primary/50 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-accent/30 transition-colors cursor-pointer">
                 <FileText className="w-5 h-5 text-muted" />
                 <span className="text-xs font-medium text-light text-center">Bank Details</span>
               </div>
             </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Account Settings */}
          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-6">
             <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-border pb-3">
               <Settings className="w-4 h-4 text-accent" /> Account Settings
             </h3>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <span className="text-xs font-medium text-muted">Recruiter ID</span>
                 <p className="text-sm font-bold text-light mt-1 flex items-center gap-2">
                   {recruiter.id.substring(0,8)}...
                 </p>
               </div>
               <div>
                 <span className="text-xs font-medium text-muted">Member Since</span>
                 <p className="text-sm font-bold text-light mt-1">{new Date(recruiter.createdAt).toLocaleDateString()}</p>
               </div>
               <div>
                 <span className="text-xs font-medium text-muted">Last Login</span>
                 <p className="text-sm font-bold text-light mt-1">Today</p>
               </div>
               <div>
                 <span className="text-xs font-medium text-muted">Account Status</span>
                 <p className="mt-1">
                   <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${recruiter.status === 'ACTIVE' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                     {recruiter.status}
                   </span>
                 </p>
               </div>
               <div>
                 <span className="text-xs font-medium text-muted">Email Verified</span>
                 <p className="text-sm font-bold text-green-400 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Yes</p>
               </div>
               <div>
                 <span className="text-xs font-medium text-muted">Mobile Verified</span>
                 <p className="text-sm font-bold text-green-400 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Yes</p>
               </div>
             </div>
          </div>

          {/* Placement Commission History */}
          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-sm font-bold text-light uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-accent" /> Placement Commission History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border/50">
                <thead className="bg-primary/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Company</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Position</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 bg-primary-lighter">
                  {commissionHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-primary/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-light font-bold">{item.candidateName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{item.company}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{item.position}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-muted">{item.placementDate}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-accent">₹{item.amount.toLocaleString('en-IN')}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${item.status === 'PAID' ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-orange-900/20 text-orange-400 border-orange-800/30'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {commissionHistory.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-sm text-muted text-center">No successful placements yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Personal Notes */}
          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-6">
             <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
               <h3 className="text-sm font-bold text-light uppercase tracking-wider flex items-center gap-2">
                 <Lock className="w-4 h-4 text-accent" /> Private Notes
               </h3>
               <span className="text-[10px] text-muted uppercase tracking-widest font-bold bg-primary px-2 py-1 rounded-md border border-border">Confidential</span>
             </div>
             <textarea
               className="w-full h-32 bg-primary border border-border rounded-xl p-4 text-sm text-light placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none custom-scrollbar"
               placeholder="Write your private notes, reminders, or candidate follow-up thoughts here..."
               defaultValue="Call John Smith regarding the final technical round feedback.\n\nUpdate resume for Sarah."
             />
             <div className="mt-3 flex justify-end">
               <button className="bg-primary border border-border text-xs font-bold text-light px-4 py-2 rounded-lg hover:text-accent hover:border-accent transition-colors">
                 Save Notes
               </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
