import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Users, Calendar, CheckCircle, XCircle, Percent, AlertCircle, Briefcase, MessagesSquare, FileText, Zap } from "lucide-react"
import { timeAgo } from "@/lib/dateUtils"

export default async function RecruiterDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }

  const recruiterId = (session.user as any).id


  const recruiter = await prisma.user.findUnique({
    where: { id: recruiterId }
  });

  // 1. Fetch raw data to calculate everything efficiently

  const applications = await prisma.application.findMany({
    where: { candidate: { recruiterId } },
    include: {
      candidate: true,
      job: {
        include: { company: true }
      },
      placement: true
    },
    orderBy: { updatedAt: 'desc' }
  })

  // Calculate Performance Metrics
  const totalSubmitted = applications.length
  const interviewScheduled = applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length
  const selected = applications.filter(a => ['SELECTED', 'JOINED'].includes(a.status)).length
  const rejected = applications.filter(a => a.status === 'REJECTED').length
  const selectionRatio = totalSubmitted > 0 ? Math.round((selected / totalSubmitted) * 100) : 0

  const performanceStats = [
    { name: "Total Submitted", value: totalSubmitted, icon: Users },
    { name: "Interviews", value: interviewScheduled, icon: Calendar },
    { name: "Selected", value: selected, icon: CheckCircle },
    { name: "Rejected", value: rejected, icon: XCircle },
    { name: "Selection Ratio", value: `${selectionRatio}%`, icon: Percent },
  ]

  // Calculate Pipeline Funnel
  const pipeline = {
    SUBMITTED: applications.length,
    SCREENING: applications.filter(a => !['REJECTED'].includes(a.status)).length,
    INTERVIEW: applications.filter(a => ['INTERVIEW_SCHEDULED', 'L1_CLEARED', 'L2_CLEARED', 'SELECTED', 'JOINED'].includes(a.status)).length,
    SELECTED: applications.filter(a => ['SELECTED', 'JOINED'].includes(a.status)).length,
    JOINED: applications.filter(a => a.status === 'JOINED').length,
  }

  const funnelStages = [
    { label: "Submitted", count: pipeline.SUBMITTED },
    { label: "Screening", count: pipeline.SCREENING },
    { label: "Interview", count: pipeline.INTERVIEW },
    { label: "Selected", count: pipeline.SELECTED },
    { label: "Joined", count: pipeline.JOINED },
  ]
  const maxFunnel = pipeline.SUBMITTED > 0 ? pipeline.SUBMITTED : 1

  // Action Center Stats
  const interviewFeedbackPending = applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length;
  const candidateFollowUpsPending = applications.filter(a => ['SCREENING', 'L1_CLEARED', 'L2_CLEARED'].includes(a.status)).length;
  const newApplicationsReceived = applications.filter(a => a.status === 'SUBMITTED').length;
  const offerAcceptancePending = applications.filter(a => a.status === 'SELECTED').length;

  // Priority Tasks
  const priorityTasks = applications
    .filter(a => ['SCREENING', 'INTERVIEW_SCHEDULED', 'SELECTED'].includes(a.status))
    .map(app => {
      let action = "Check screening status"
      let priority = "LOW"

      if (app.status === 'INTERVIEW_SCHEDULED') {
        action = "Get interview feedback"
        priority = "HIGH"
      } else if (app.status === 'SELECTED') {
        action = "Follow up on offer acceptance"
        priority = "HIGH"
      } else if (app.status === 'SCREENING') {
        action = "Follow up with client on screening"
        priority = "MEDIUM"
      }

      return {
        id: app.id,
        candidate: `${app.candidate.firstName} ${app.candidate.lastName || ''}`,
        job: app.job.title,
        action,
        priority
      }
    }).slice(0, 6)

  // Assigned Jobs (Active Jobs recruiter has submitted candidates to)
  const jobMap = new Map()
  applications.forEach(app => {
    if (!jobMap.has(app.jobId)) {
      const companyName = (app.job as any).company?.isConfidential ? "Confidential Client" : ((app.job as any).company?.name || "Unknown Company");
      jobMap.set(app.jobId, {
        id: app.jobId,
        title: app.job.title,
        companyName: companyName, // recruiter view logic
        openPositions: (app.job as any).vacancies || 1, // Fallback to 1 if no vacancies field
        submitted: 0,
      })
    }
    jobMap.get(app.jobId).submitted += 1
  })
  const assignedJobs = Array.from(jobMap.values())

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-10 pb-12">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-light">Dashboard</h1>
        <p className="mt-2 text-muted">Overview of your recruitment performance and pipeline.</p>
      </div>

      {/* 1. My Performance (Top Row) */}
      <section>
        <h2 className="text-lg font-semibold text-light mb-4">My Performance</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {performanceStats.map((stat) => (
            <div
              key={stat.name}
              className="group relative overflow-hidden rounded-2xl bg-primary-lighter border border-border p-5 hover:border-accent transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(170,255,0,0.1)]"
            >
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/5 group-hover:bg-accent/10 transition-colors duration-300 blur-xl pointer-events-none"></div>

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary border border-border group-hover:border-accent/30 transition-colors">
                  <stat.icon className="h-4 w-4 text-accent" aria-hidden="true" />
                </div>
              </div>

              <div className="relative z-10">
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">{stat.name}</dt>
                <dd className="mt-1 flex items-baseline">
                  <div className="text-2xl font-bold text-light">{stat.value}</div>
                </dd>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Middle Row: Recruitment Funnel & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recruitment Funnel */}
        <section>
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 h-full shadow-lg">
            <h2 className="text-lg font-semibold text-light mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Recruitment Funnel
            </h2>
            <div className="space-y-5">
              {funnelStages.map((stage, idx) => {
                const widthPercent = maxFunnel > 0 ? (stage.count / maxFunnel) * 100 : 0;
                const conversion = maxFunnel > 0 ? Math.round((stage.count / maxFunnel) * 100) : 0;
                return (
                  <div key={stage.label} className="relative">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-bold text-light uppercase tracking-wider">{stage.label}</span>
                      <span className="text-xs font-medium text-muted">{stage.count} ({conversion}%)</span>
                    </div>
                    <div className="w-full h-3 bg-primary rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-accent/40 rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${widthPercent}%` }}
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent to-accent/20 blur-sm pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Action Center */}
        <section>
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 h-full shadow-lg">
            <h2 className="text-lg font-semibold text-light mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent" />
              Action Center
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary border border-border rounded-xl p-4 flex flex-col justify-center items-center text-center hover:border-accent/50 transition-colors">
                <MessagesSquare className="w-6 h-6 text-orange-400 mb-2" />
                <span className="text-2xl font-black text-light">{interviewFeedbackPending}</span>
                <span className="text-[10px] uppercase font-bold text-muted mt-1">Interview Feedback Pending</span>
              </div>
              <div className="bg-primary border border-border rounded-xl p-4 flex flex-col justify-center items-center text-center hover:border-accent/50 transition-colors">
                <Users className="w-6 h-6 text-blue-400 mb-2" />
                <span className="text-2xl font-black text-light">{candidateFollowUpsPending}</span>
                <span className="text-[10px] uppercase font-bold text-muted mt-1">Candidate Follow-ups Pending</span>
              </div>
              <div className="bg-primary border border-border rounded-xl p-4 flex flex-col justify-center items-center text-center hover:border-accent/50 transition-colors">
                <FileText className="w-6 h-6 text-accent mb-2" />
                <span className="text-2xl font-black text-light">{newApplicationsReceived}</span>
                <span className="text-[10px] uppercase font-bold text-muted mt-1">New Applications Received</span>
              </div>
              <div className="bg-primary border border-border rounded-xl p-4 flex flex-col justify-center items-center text-center hover:border-accent/50 transition-colors">
                <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                <span className="text-2xl font-black text-light">{offerAcceptancePending}</span>
                <span className="text-[10px] uppercase font-bold text-muted mt-1">Offer Acceptance Pending</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Row: Priority Tasks & Assigned Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Priority Tasks */}
        <section>
          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg overflow-hidden h-full">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-light flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                Priority Tasks
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {priorityTasks.map((task, idx) => (
                <div key={idx} className="bg-primary border border-border rounded-xl p-4 flex items-start justify-between gap-4 hover:border-accent/30 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-light">{task.candidate}</h4>
                    <p className="text-xs text-muted mt-0.5">{task.job}</p>
                    <p className="text-sm text-light mt-2">{task.action}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${task.priority === 'HIGH' ? 'bg-red-100 text-red-800 border-red-200' : task.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
              {priorityTasks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted">No pending tasks.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Assigned Jobs */}
        <section>
          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg overflow-hidden h-full">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-light flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent" />
                Assigned Jobs
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-primary-lighter">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">Openings</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 bg-primary/20">
                  {assignedJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-primary/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-bold text-light">{job.title}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{job.companyName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-light">{job.openPositions}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-accent">{job.submitted}</td>
                    </tr>
                  ))}
                  {assignedJobs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted">No assigned jobs yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

    </div>
  )
}
