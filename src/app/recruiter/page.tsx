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
    { name: "Total Submitted", value: totalSubmitted, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Pending", value: pending, icon: FileText, color: "text-yellow-600", bg: "bg-yellow-100" },
    { name: "Interview Scheduled", value: interviewScheduled, icon: Calendar, color: "text-purple-600", bg: "bg-purple-100" },
    { name: "Selected", value: selected, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { name: "Rejected", value: rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1 text-black">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
