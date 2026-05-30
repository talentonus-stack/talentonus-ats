import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Users, FileText, Calendar, CheckCircle, XCircle } from "lucide-react"

export default async function RecruiterDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }

  const recruiterId = (session.user as any).id

  const [totalSubmitted, pending, interviewScheduled, selected, rejected] = await Promise.all([
    prisma.application.count({ where: { candidate: { recruiterId } } }),
    prisma.application.count({ where: { candidate: { recruiterId }, status: { in: ['SUBMITTED', 'SCREENING'] } } }),
    prisma.application.count({ where: { candidate: { recruiterId }, status: 'INTERVIEW_SCHEDULED' } }),
    prisma.application.count({ where: { candidate: { recruiterId }, status: { in: ['SELECTED', 'JOINED'] } } }),
    prisma.application.count({ where: { candidate: { recruiterId }, status: 'REJECTED' } }),
  ])

  const stats = [
    { name: "Total Submitted", value: totalSubmitted, icon: Users },
    { name: "Pending", value: pending, icon: FileText },
    { name: "Interview Scheduled", value: interviewScheduled, icon: Calendar },
    { name: "Selected", value: selected, icon: CheckCircle },
    { name: "Rejected", value: rejected, icon: XCircle },
  ]

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-light">Recruiter Overview</h1>
        <p className="mt-2 text-muted">Track the performance of your candidate submissions.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="group relative overflow-hidden rounded-2xl bg-primary-lighter border border-border p-6 hover:border-accent transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(170,255,0,0.1)]"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/5 group-hover:bg-accent/10 transition-colors duration-300 blur-xl"></div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary border border-border group-hover:border-accent/30 transition-colors">
                <stat.icon className="h-5 w-5 text-accent" aria-hidden="true" />
              </div>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted">{stat.name}</dt>
              <dd className="mt-1 flex items-baseline">
                <div className="text-3xl font-bold text-light">{stat.value}</div>
              </dd>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
