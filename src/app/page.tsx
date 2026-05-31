import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Users, Briefcase, FileText, CheckCircle, Target, Calendar, UserCheck, UserPlus, TrendingUp } from "lucide-react"

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

  const [
    totalJobs,
    totalCandidates,
    totalApplications,
    hiredApplications,
    openPositions,
    activeRecruiters,
    interviewsScheduled,
    candidatesThisMonth,
    allApplications,
    recruitersList
  ] = await Promise.all([
    prisma.job.count(),
    prisma.candidate.count(),
    prisma.application.count(),
    prisma.application.count({ where: { status: "JOINED" } }),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.user.count({ where: { role: "RECRUITER", status: "ACTIVE" } }),
    prisma.application.count({ where: { status: "INTERVIEW_SCHEDULED" } }),
    prisma.candidate.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.application.findMany({ select: { status: true } }),
    prisma.user.findMany({
      where: { role: "RECRUITER" },
      include: {
        candidates: {
          include: { applications: { select: { status: true } } }
        }
      }
    })
  ])

  const stats = [
    { name: "Total Jobs", value: totalJobs, icon: Briefcase },
    { name: "Open Positions", value: openPositions, icon: Target },
    { name: "Total Candidates", value: totalCandidates, icon: Users },
    { name: "Candidates This Month", value: candidatesThisMonth, icon: UserPlus },
    { name: "Total Applications", value: totalApplications, icon: FileText },
    { name: "Interviews Scheduled", value: interviewsScheduled, icon: Calendar },
    { name: "Hired Candidates", value: hiredApplications, icon: CheckCircle },
    { name: "Active Recruiters", value: activeRecruiters, icon: UserCheck },
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

      {/* 1. TOP STATISTICS ROW */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="group relative overflow-hidden rounded-xl bg-primary-lighter border border-border p-5 hover:border-accent transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(170,255,0,0.1)] flex flex-col justify-between aspect-[4/3]"
          >
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent/5 group-hover:bg-accent/10 transition-colors duration-300 blur-xl"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary border border-border group-hover:border-accent/30 transition-colors">
                <stat.icon className="h-4 w-4 text-accent" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-4">
              <dt className="text-xs font-semibold text-muted uppercase tracking-wider line-clamp-1">{stat.name}</dt>
              <dd className="mt-1">
                <div className="text-3xl font-bold text-light group-hover:text-white transition-colors">{stat.value}</div>
              </dd>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. RECRUITMENT FUNNEL */}
        <section className="lg:col-span-1">
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 h-full shadow-lg flex flex-col">
            <h2 className="text-lg font-bold text-light mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Recruitment Funnel
            </h2>
            <div className="space-y-5 flex-1 flex flex-col justify-center">
              {funnelStages.map((stage, idx) => {
                const widthPercent = maxFunnel > 0 ? (stage.count / maxFunnel) * 100 : 0;
                return (
                  <div key={stage.label} className="relative">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-bold text-muted uppercase tracking-wide">{stage.label}</span>
                      <span className="text-sm font-bold text-light">{stage.count}</span>
                    </div>
                    <div className="w-full bg-primary rounded-full h-3 border border-border/50 overflow-hidden">
                      <div
                        className="bg-accent h-full rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${widthPercent}%` }}
                      >
                         <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                      </div>
                    </div>
                    {idx < funnelStages.length - 1 && (
                       <div className="absolute -bottom-4 left-4 text-border flex items-center justify-center w-full h-4">
                         <div className="w-px h-full bg-border/50"></div>
                       </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 3. RECRUITER PERFORMANCE */}
        <section className="lg:col-span-2">
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 h-full shadow-lg">
            <h2 className="text-lg font-bold text-light mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Recruiter Performance
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recruiter</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">Submitted</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">Selected</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {topRecruiters.map((recruiter, idx) => {
                    const widthPercent = (recruiter.submitted / maxSubmitted) * 100;
                    const isTop = idx === 0;
                    return (
                      <tr key={recruiter.id} className="group hover:bg-primary/30 transition-colors">
                        <td className="py-4">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isTop ? 'bg-accent text-primary shadow-[0_0_10px_rgba(170,255,0,0.5)]' : 'bg-primary border border-border text-muted'}`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-white group-hover:text-accent transition-colors">{recruiter.name}</div>
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap text-sm text-light font-medium">{recruiter.submitted}</td>
                        <td className="px-4 py-4 text-center whitespace-nowrap text-sm text-light font-medium">{recruiter.selected}</td>
                        <td className="px-4 py-4 text-center whitespace-nowrap text-sm text-accent font-bold">{recruiter.joined}</td>
                        <td className="px-4 py-4 whitespace-nowrap w-1/4">
                          <div className="flex items-center justify-end gap-2">
                             <div className="w-full max-w-[80px] bg-primary rounded-full h-1.5 overflow-hidden">
                                <div className="bg-accent h-full rounded-full" style={{ width: `${widthPercent}%` }}></div>
                             </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {topRecruiters.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-muted">No recruiter data available.</td>
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
