import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Users, Briefcase, FileText, CheckCircle } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const [totalJobs, totalCandidates, totalApplications, hiredApplications] = await Promise.all([
    prisma.job.count(),
    prisma.candidate.count(),
    prisma.application.count(),
    prisma.application.count({ where: { status: "HIRED" } }),
  ])

  const stats = [
    { name: "Total Jobs", value: totalJobs, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Total Candidates", value: totalCandidates, icon: Users, color: "text-green-600", bg: "bg-green-100" },
    { name: "Total Applications", value: totalApplications, icon: FileText, color: "text-purple-600", bg: "bg-purple-100" },
    { name: "Hired Candidates", value: hiredApplications, icon: CheckCircle, color: "text-indigo-600", bg: "bg-indigo-100" },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
