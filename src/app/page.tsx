import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Users, Briefcase, FileText, CheckCircle, Target, Calendar, UserCheck, UserPlus, TrendingUp, Clock, Activity, Building2 } from "lucide-react"
import { timeAgo } from "@/lib/dateUtils"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role === "RECRUITER") {
    redirect("/recruiter")
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    totalJobs,
    totalCandidates,
    totalApplications,
    hiredApplications,
    openPositions,
    totalRecruiters,
    activeRecruitersList,
    interviewsScheduled,
    totalCompanies,
    activeCompanies,
    allApplications,
    recruitersList,
    recentApplications,
    recentCandidates
  ] = await Promise.all([
    prisma.job.count(),
    prisma.candidate.count(),
    prisma.application.count(),
    prisma.application.count({ where: { status: "JOINED" } }),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.user.count({ where: { role: "RECRUITER" } }),
    prisma.user.findMany({
      where: { role: "RECRUITER", candidates: { some: { createdAt: { gte: thirtyDaysAgo } } } }
    }),
    prisma.application.count({ where: { status: "INTERVIEW_SCHEDULED" } }),
    prisma.company.count(),
    prisma.company.count({ where: { status: "ACTIVE" } }),
    prisma.application.findMany({ select: { status: true } }),
    prisma.user.findMany({
      where: { role: "RECRUITER" },
      include: {
        candidates: {
          include: { applications: { select: { status: true } } }
        }
      }
    }),
    prisma.application.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        candidate: { select: { firstName: true, lastName: true, recruiter: { select: { name: true } } } },
        job: { select: { title: true } }
      }
    }),
    prisma.candidate.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { recruiter: { select: { name: true } } }
    })
  ])

  const activeRecruitersCount = activeRecruitersList.length

  const row1Stats = [
    { name: "Total Companies", value: totalCompanies, icon: Building2 },
    { name: "Active Companies", value: activeCompanies, icon: CheckCircle },
    { name: "Total Recruiters", value: totalRecruiters, icon: Users },
    { name: "Active Recruiters", value: activeRecruitersCount, icon: UserCheck },
    { name: "Open Positions", value: openPositions, icon: Target },
  ]

  const row2Stats = [
    { name: "Total Jobs", value: totalJobs, icon: Briefcase },
    { name: "Total Candidates", value: totalCandidates, icon: Users },
    { name: "Total Applications", value: totalApplications, icon: FileText },
    { name: "Interviews Scheduled", value: interviewsScheduled, icon: Calendar },
    { name: "Hired Candidates", value: hiredApplications, icon: CheckCircle },
  ]

  // Funnel Data Calculations
  const pipeline = {
    SUBMITTED: allApplications.length,
    SHORTLISTED: allApplications.filter(a => !['REJECTED'].includes(a.status)).length,
    INTERVIEW_SCHEDULED: allApplications.filter(a => ['INTERVIEW_SCHEDULED', 'L1_CLEARED', 'L2_CLEARED', 'SELECTED', 'JOINED'].includes(a.status)).length,
    SELECTED: allApplications.filter(a => ['SELECTED', 'JOINED'].includes(a.status)).length,
    JOINED: allApplications.filter(a => a.status === 'JOINED').length,
  }

  const funnelStages = [
    { label: "Applications", count: pipeline.SUBMITTED },
    { label: "Shortlisted", count: pipeline.SHORTLISTED },
    { label: "Interview Scheduled", count: pipeline.INTERVIEW_SCHEDULED },
    { label: "Selected", count: pipeline.SELECTED },
    { label: "Joined", count: pipeline.JOINED },
  ]
  const maxFunnel = pipeline.SUBMITTED > 0 ? pipeline.SUBMITTED : 1

  // Recruiter Leaderboard Calculation
  const recruiterStats = recruitersList.map(recruiter => {
    let totalApps = 0
    let selected = 0
    let joined = 0

    recruiter.candidates.forEach(candidate => {
      totalApps += candidate.applications.length
      candidate.applications.forEach(app => {
        if (app.status === 'SELECTED') selected++
        if (app.status === 'JOINED') joined++
      })
    })

    return {
      id: recruiter.id,
      name: recruiter.name || recruiter.email,
      submitted: recruiter.candidates.length,
      applications: totalApps,
      selected: selected + joined,
      joined
    }
  })

  // Sort by highest submitted, limit top 5
  recruiterStats.sort((a, b) => b.submitted - a.submitted)
  const topRecruiters = recruiterStats.slice(0, 5)
  const maxSubmitted = topRecruiters.length > 0 && topRecruiters[0].submitted > 0 ? topRecruiters[0].submitted : 1

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-light">Welcome back, Admin</h1>
        <p className="mt-2 text-muted">Here's a complete overview of the recruitment pipeline and team performance.</p>
      </div>

      {/* 1. TOP STATISTICS ROW - COMPACT LAYOUT */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {row1Stats.map((stat) => (
            <div
              key={stat.name}
              className="group relative overflow-hidden rounded-lg bg-primary-lighter border border-border p-4 hover:border-accent transition-colors flex items-center justify-between gap-3 shadow-sm hover:shadow-[0_4px_20px_rgba(170,255,0,0.05)] h-[110px]"
            >
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent/5 group-hover:bg-accent/10 transition-colors duration-300 blur-md"></div>

              <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                <dt className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 leading-tight">{stat.name}</dt>
                <dd className="text-3xl font-black text-light group-hover:text-white transition-colors leading-none">{stat.value}</dd>
              </div>
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary border border-border/50 group-hover:border-accent/30 transition-colors shrink-0">
                <stat.icon className="h-5 w-5 text-accent opacity-80" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {row2Stats.map((stat) => (
            <div
              key={stat.name}
              className="group relative overflow-hidden rounded-lg bg-primary-lighter border border-border p-4 hover:border-accent transition-colors flex items-center justify-between gap-3 shadow-sm hover:shadow-[0_4px_20px_rgba(170,255,0,0.05)] h-[110px]"
            >
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent/5 group-hover:bg-accent/10 transition-colors duration-300 blur-md"></div>

              <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                <dt className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 leading-tight">{stat.name}</dt>
                <dd className="text-3xl font-black text-light group-hover:text-white transition-colors leading-none">{stat.value}</dd>
              </div>
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary border border-border/50 group-hover:border-accent/30 transition-colors shrink-0">
                <stat.icon className="h-5 w-5 text-accent opacity-80" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL WIDTH RECRUITMENT FUNNEL */}
      <section>
        <div className="bg-primary-lighter rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-sm font-bold text-light uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-border/50 pb-3">
            <TrendingUp className="w-4 h-4 text-accent" />
            Recruitment Funnel
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {funnelStages.map((stage, idx) => {
              const widthPercent = maxFunnel > 0 ? (stage.count / maxFunnel) * 100 : 0;
              return (
                <div key={stage.label} className="relative flex flex-col">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-muted uppercase tracking-wide">{stage.label}</span>
                    <span className="text-lg font-black text-light leading-none">{stage.count}</span>
                  </div>
                  <div className="w-full bg-primary rounded-full h-2 border border-border/50 overflow-hidden mt-auto">
                    <div
                      className="bg-accent h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${widthPercent}%` }}
                    >
                       <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 2-COLUMN LAYOUT: PERFORMANCE & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECRUITER PERFORMANCE */}
        <section>
          <div className="bg-primary-lighter rounded-xl border border-border p-6 h-full shadow-sm">
            <h2 className="text-sm font-bold text-light uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-border/50 pb-3">
              <Users className="w-4 h-4 text-accent" />
              Recruiter Performance
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border/50">
                <thead>
                  <tr>
                    <th className="pb-3 text-left text-[10px] font-bold text-muted uppercase tracking-wider">Rank</th>
                    <th className="pb-3 px-2 text-left text-[10px] font-bold text-muted uppercase tracking-wider">Recruiter</th>
                    <th className="pb-3 px-2 text-center text-[10px] font-bold text-muted uppercase tracking-wider">Submissions</th>
                    <th className="pb-3 px-2 text-center text-[10px] font-bold text-muted uppercase tracking-wider">Selected</th>
                    <th className="pb-3 text-right text-[10px] font-bold text-muted uppercase tracking-wider">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {topRecruiters.map((recruiter, idx) => {
                    const widthPercent = (recruiter.submitted / maxSubmitted) * 100;
                    const isTop = idx === 0;
                    return (
                      <tr key={recruiter.id} className="group hover:bg-primary/20 transition-colors">
                        <td className="py-3">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${isTop ? 'bg-accent text-primary shadow-[0_0_8px_rgba(170,255,0,0.4)]' : 'bg-primary border border-border text-muted'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <div className="text-sm font-semibold text-light group-hover:text-white transition-colors">{recruiter.name}</div>
                        </td>
                        <td className="px-2 py-3 text-center whitespace-nowrap text-sm text-light font-bold">{recruiter.submitted}</td>
                        <td className="px-2 py-3 text-center whitespace-nowrap text-sm text-accent font-bold">{recruiter.selected}</td>
                        <td className="py-3 whitespace-nowrap w-1/4">
                          <div className="flex items-center justify-end">
                             <div className="w-full max-w-[60px] bg-primary rounded h-1 overflow-hidden border border-border/50">
                                <div className="bg-accent h-full rounded" style={{ width: `${widthPercent}%` }}></div>
                             </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {topRecruiters.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-muted">No recruiter data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* LATEST APPLICATIONS ACTIVITY */}
        <section>
          <div className="bg-primary-lighter rounded-xl border border-border p-6 h-full shadow-sm flex flex-col">
            <h2 className="text-sm font-bold text-light uppercase tracking-wider mb-6 flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                Pipeline Activity
              </div>
              <Link href="/applications" className="text-xs text-accent hover:underline">View All</Link>
            </h2>
            <div className="flex-1 space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-primary/30 border border-transparent hover:border-border/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(170,255,0,0.5)] shrink-0"></div>
                    <div>
                      <p className="text-sm text-light font-semibold">
                        {app.candidate.firstName} {app.candidate.lastName || ''}
                      </p>
                      <p className="text-xs text-muted mt-0.5">Applied for <span className="font-medium text-gray-300">{app.job.title}</span></p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{timeAgo(app.updatedAt)}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border bg-accent/10 text-accent border-accent/20 whitespace-nowrap">
                    {app.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
              {recentApplications.length === 0 && (
                <p className="text-sm text-muted text-center py-8">No recent applications.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* LATEST RECRUITER SUBMISSIONS TABLE */}
      <section>
        <div className="bg-primary-lighter rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-sm font-bold text-light uppercase tracking-wider mb-6 flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Latest Submissions
            </div>
            <Link href="/candidates" className="text-xs text-accent hover:underline">View Directory</Link>
          </h2>
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-border/50">
                <thead>
                  <tr>
                    <th className="pb-3 text-left text-[10px] font-bold text-muted uppercase tracking-wider">Candidate Name</th>
                    <th className="pb-3 px-4 text-left text-[10px] font-bold text-muted uppercase tracking-wider">Submitted By</th>
                    <th className="pb-3 px-4 text-center text-[10px] font-bold text-muted uppercase tracking-wider">Experience</th>
                    <th className="pb-3 text-right text-[10px] font-bold text-muted uppercase tracking-wider">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {recentCandidates.map((candidate) => (
                    <tr key={candidate.id} className="group hover:bg-primary/20 transition-colors">
                      <td className="py-3 whitespace-nowrap">
                        <Link href={`/candidates/${candidate.id}`} className="text-sm font-semibold text-light hover:text-accent transition-colors">
                          {candidate.firstName} {candidate.lastName || ''}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted">
                        {candidate.recruiter?.name || 'System Admin'}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-light">{candidate.experience || 'N/A'}</td>
                      <td className="py-3 text-right whitespace-nowrap text-sm text-muted">{new Date(candidate.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {recentCandidates.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-muted">No candidates submitted recently.</td>
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
