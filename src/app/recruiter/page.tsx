import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Users, Calendar, CheckCircle, XCircle, Percent, Clock, AlertCircle } from "lucide-react"
import { timeAgo } from "@/lib/dateUtils"

export default async function RecruiterDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }

  const recruiterId = (session.user as any).id

  // 1. Fetch raw data to calculate everything efficiently
  const applications = await prisma.application.findMany({
    where: { candidate: { recruiterId } },
    include: {
      candidate: true,
      job: true,
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
    SUBMITTED: applications.length, // Total entering the top
    SCREENING: applications.filter(a => !['REJECTED'].includes(a.status)).length, // Mock logic: assume they pass submitted unless rejected
    INTERVIEW_SCHEDULED: applications.filter(a => ['INTERVIEW_SCHEDULED', 'L1_CLEARED', 'L2_CLEARED', 'SELECTED', 'JOINED'].includes(a.status)).length,
    L1_CLEARED: applications.filter(a => ['L1_CLEARED', 'L2_CLEARED', 'SELECTED', 'JOINED'].includes(a.status)).length,
    L2_CLEARED: applications.filter(a => ['L2_CLEARED', 'SELECTED', 'JOINED'].includes(a.status)).length,
    SELECTED: applications.filter(a => ['SELECTED', 'JOINED'].includes(a.status)).length,
    JOINED: applications.filter(a => a.status === 'JOINED').length,
  }

  const funnelStages = [
    { label: "Submitted", count: pipeline.SUBMITTED },
    { label: "Screening", count: pipeline.SCREENING },
    { label: "Interview", count: pipeline.INTERVIEW_SCHEDULED },
    { label: "L1 Cleared", count: pipeline.L1_CLEARED },
    { label: "L2 Cleared", count: pipeline.L2_CLEARED },
    { label: "Selected", count: pipeline.SELECTED },
    { label: "Joined", count: pipeline.JOINED },
  ]
  const maxFunnel = pipeline.SUBMITTED > 0 ? pipeline.SUBMITTED : 1

  // Recent Activity Feed (Using last 10 updated applications)
  const recentActivities = applications.slice(0, 10).map(app => {
    let action = "updated"
    if (app.status === 'SUBMITTED') action = "submitted for"
    if (app.status === 'INTERVIEW_SCHEDULED') action = "scheduled for interview for"
    if (app.status === 'SELECTED') action = "selected for"
    if (app.status === 'REJECTED') action = "rejected for"
    if (app.status === 'JOINED') action = "joined as"

    return {
      id: app.id,
      candidate: `${app.candidate.firstName} ${app.candidate.lastName || ''}`,
      job: app.job.title,
      action,
      time: timeAgo(app.updatedAt)
    }
  })

  // Pending Follow-ups
  // Logic: Mock follow-up based on status
  const pendingFollowUps = applications
    .filter(a => ['SCREENING', 'INTERVIEW_SCHEDULED', 'SELECTED'].includes(a.status))
    .map(app => {
      let followUpType = "Client feedback pending"
      let priority = "MEDIUM"
      let dueDate = new Date(app.updatedAt.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days from update

      if (app.status === 'INTERVIEW_SCHEDULED') {
        followUpType = "Interview feedback pending"
        priority = "HIGH"
      } else if (app.status === 'SELECTED') {
        followUpType = "Offer acceptance pending"
        priority = "HIGH"
      } else if (app.status === 'SCREENING') {
        followUpType = "Screening outcome pending"
        priority = "LOW"
      }

      return {
        id: app.id,
        candidate: `${app.candidate.firstName} ${app.candidate.lastName || ''}`,
        job: app.job.title,
        followUpType,
        dueDate: dueDate.toLocaleDateString(),
        priority
      }
    }).slice(0, 5) // Show top 5 pending

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

      {/* Middle Row: Pipeline & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 4. Candidate Pipeline Chart (Left, 2 columns) */}
        <section className="lg:col-span-2">
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 h-full shadow-lg">
            <h2 className="text-lg font-semibold text-light mb-6">Candidate Pipeline</h2>
            <div className="space-y-4">
              {funnelStages.map((stage, idx) => {
                const widthPercent = maxFunnel > 0 ? (stage.count / maxFunnel) * 100 : 0;
                return (
                  <div key={stage.label} className="flex items-center gap-4">
                    <div className="w-24 sm:w-32 text-xs font-medium text-muted uppercase text-right shrink-0">
                      {stage.label}
                    </div>
                    <div className="flex-1 h-8 bg-primary rounded-r-lg rounded-l-sm overflow-hidden border border-border relative">
                      <div
                        className="h-full bg-accent/20 border-r border-accent transition-all duration-1000 ease-out flex items-center justify-end px-3 relative"
                        style={{ width: `${widthPercent}%` }}
                      >
                         {/* Glow effect on the bar */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-accent/20 blur-sm pointer-events-none"></div>
                        <span className="text-xs font-bold text-accent relative z-10">{stage.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 2. Recent Activity Feed (Right, 1 column) */}
        <section className="lg:col-span-1">
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 h-full shadow-lg flex flex-col">
            <h2 className="text-lg font-semibold text-light mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Recent Activity
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {recentActivities.length > 0 ? recentActivities.map((act, i) => (
                <div key={i} className="relative pl-4 border-l border-border/50 pb-1">
                  <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(170,255,0,0.6)]"></div>
                  <p className="text-sm text-light leading-snug">
                    <span className="font-semibold text-white">{act.candidate}</span> {act.action} <span className="font-medium text-accent">{act.job}</span>
                  </p>
                  <p className="text-xs text-muted mt-1">{act.time}</p>
                </div>
              )) : (
                <p className="text-sm text-muted">No recent activities.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* 3. My Pending Follow-ups (Bottom Row) */}
      <section>
        <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-light">Pending Follow-ups</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-primary-lighter/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Job Position</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Follow-up Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-primary-lighter">
                {pendingFollowUps.map((fu, idx) => (
                  <tr key={idx} className="hover:bg-primary/50 transition-colors group">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors">
                      {fu.candidate}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{fu.job}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-light">{fu.followUpType}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{fu.dueDate}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${fu.priority === 'HIGH' ? 'bg-red-900/20 text-red-400 border-red-800/30' : fu.priority === 'MEDIUM' ? 'bg-orange-900/20 text-orange-400 border-orange-800/30' : 'bg-accent/10 text-accent border-accent/20'}`}>
                        {fu.priority}
                      </span>
                    </td>
                  </tr>
                ))}
                {pendingFollowUps.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-sm text-muted text-center">You have no pending follow-ups. Great job!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  )
}
