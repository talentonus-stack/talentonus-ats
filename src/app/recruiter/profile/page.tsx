import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { BarChart2, Users, CheckCircle, XCircle, Award, Target, UserPlus, Mail, Phone, MapPin, Briefcase, Calendar, Clock, Edit3, ShieldCheck, TrendingUp, Medal, Star } from "lucide-react"
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

  const totalSubmitted = applications.length
  const selected = applications.filter(a => a.status === "SELECTED" || a.status === "JOINED").length
  const joined = applications.filter(a => a.status === "JOINED").length

  const successRate = totalSubmitted > 0 ? Math.round((selected / totalSubmitted) * 100) : 0

  // Assigned Companies/Jobs Logic
  const jobMap = new Map()
  applications.forEach(app => {
    if (!jobMap.has(app.jobId)) {
      jobMap.set(app.jobId, {
        id: app.jobId,
        title: app.job.title,
        companyName: 'Confidential Client', // recruiter view
        status: app.job.status,
        submitted: 0,
      })
    }
    jobMap.get(app.jobId).submitted += 1
  })
  const assignedJobs = Array.from(jobMap.values()).slice(0, 5)

  // Timeline Events
  const recentTimeline = applications.slice(0, 5).map(app => {
    let actionLabel = "Updated application"
    let Icon = Clock
    let color = "text-muted"

    if (app.status === 'SUBMITTED') {
      actionLabel = "Submitted candidate"
      Icon = UserPlus
      color = "text-blue-400"
    } else if (['INTERVIEW_SCHEDULED', 'L1_CLEARED', 'L2_CLEARED'].includes(app.status)) {
      actionLabel = "Scheduled interview"
      Icon = Calendar
      color = "text-orange-400"
    } else if (app.status === 'SELECTED') {
      actionLabel = "Candidate selected"
      Icon = Award
      color = "text-accent"
    } else if (app.status === 'JOINED') {
      actionLabel = "Candidate joined"
      Icon = CheckCircle
      color = "text-green-400"
    } else if (app.status === 'REJECTED') {
      actionLabel = "Candidate rejected"
      Icon = XCircle
      color = "text-red-400"
    }

    return {
      id: app.id,
      candidateName: `${app.candidate.firstName} ${app.candidate.lastName || ''}`,
      jobTitle: app.job.title,
      actionLabel,
      Icon,
      color,
      time: timeAgo(app.updatedAt)
    }
  })

  const specializations = ["Technical Sourcing", "Executive Search", "Frontend Development", "DevOps"]

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">

          {/* Performance Snapshot */}
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 shadow-lg">
             <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-border pb-3">
               <TrendingUp className="w-4 h-4 text-accent" /> Performance Snapshot
             </h3>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-primary border border-border rounded-xl p-4 flex flex-col justify-center">
                 <span className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Submitted</span>
                 <span className="text-2xl font-black text-light">{totalSubmitted}</span>
               </div>
               <div className="bg-primary border border-border rounded-xl p-4 flex flex-col justify-center">
                 <span className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Selected</span>
                 <span className="text-2xl font-black text-light">{selected}</span>
               </div>
               <div className="bg-primary border border-border rounded-xl p-4 flex flex-col justify-center">
                 <span className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Joined</span>
                 <span className="text-2xl font-black text-light">{joined}</span>
               </div>
               <div className="bg-primary border border-accent/30 rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
                 <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent/10 blur-xl pointer-events-none"></div>
                 <span className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Success Rate</span>
                 <span className="text-2xl font-black text-light">{successRate}%</span>
               </div>
             </div>
          </div>

          {/* Recruitment Specializations */}
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 shadow-lg">
             <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-border pb-3">
               <Star className="w-4 h-4 text-accent" /> Specializations
             </h3>
             <div className="flex flex-wrap gap-2">
               {specializations.map((spec, i) => (
                 <span key={i} className="inline-flex items-center rounded-lg bg-primary border border-border px-3 py-1.5 text-xs font-medium text-light hover:border-accent/50 transition-colors cursor-default">
                   {spec}
                 </span>
               ))}
             </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 shadow-lg">
             <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-border pb-3">
               <Medal className="w-4 h-4 text-accent" /> Achievements
             </h3>
             <div className="space-y-4">
               <div className="flex items-start gap-4 p-3 bg-primary/50 border border-border/50 rounded-xl">
                 <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                   <Award className="h-5 w-5 text-accent" />
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-light">Fastest Time-to-Hire</h4>
                   <p className="text-xs text-muted mt-1">Closed Senior Dev role in 14 days.</p>
                 </div>
               </div>
               <div className="flex items-start gap-4 p-3 bg-primary/50 border border-border/50 rounded-xl">
                 <div className="h-10 w-10 rounded-full bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-800/30">
                   <CheckCircle className="h-5 w-5 text-blue-400" />
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-light">10+ Placements</h4>
                   <p className="text-xs text-muted mt-1">Achieved 10 successful candidate joins.</p>
                 </div>
               </div>
             </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Assigned Companies / Jobs */}
          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-sm font-bold text-light uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-accent" /> Assigned Companies & Roles
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border/50">
                <thead className="bg-primary/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Company</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">My Submissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 bg-primary-lighter">
                  {assignedJobs.map((job, idx) => (
                    <tr key={idx} className="hover:bg-primary/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-light font-medium">{job.companyName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{job.title}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${job.status === 'OPEN' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-border text-muted border-border'}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-accent">{job.submitted}</td>
                    </tr>
                  ))}
                  {assignedJobs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-sm text-muted text-center">No assigned jobs currently.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-6">
            <h3 className="text-sm font-bold text-light uppercase tracking-wider flex items-center gap-2 border-b border-border pb-4 mb-6">
              <Clock className="w-4 h-4 text-accent" /> Activity Timeline
            </h3>

            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-8 before:w-px before:bg-border/50">
              {recentTimeline.map((event, idx) => (
                <div key={idx} className="relative flex items-start gap-6">
                  <div className={`absolute -left-6 bg-primary-lighter border-2 border-primary-lighter rounded-full p-1 z-10 ${event.color}`}>
                    <div className="bg-primary p-2 rounded-full border border-border">
                       <event.Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="bg-primary/30 border border-border/50 rounded-xl p-4 w-full hover:border-accent/30 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-light">{event.actionLabel}</h4>
                      <span className="text-xs font-medium text-muted">{event.time}</span>
                    </div>
                    <p className="text-sm text-muted">
                      Candidate: <span className="font-semibold text-light">{event.candidateName}</span> for <span className="text-accent">{event.jobTitle}</span>
                    </p>
                  </div>
                </div>
              ))}
              {recentTimeline.length === 0 && (
                <p className="text-sm text-muted">No recent activity.</p>
              )}
            </div>
          </div>

          {/* Personal Notes */}
          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-6">
             <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
               <h3 className="text-sm font-bold text-light uppercase tracking-wider flex items-center gap-2">
                 <Edit3 className="w-4 h-4 text-accent" /> Personal Notes
               </h3>
               <span className="text-[10px] text-muted uppercase tracking-widest font-bold bg-primary px-2 py-1 rounded-md border border-border">Private</span>
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
