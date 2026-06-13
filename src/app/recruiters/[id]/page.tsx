import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Users, FileText, CheckCircle, Briefcase , IndianRupee } from "lucide-react"

export default async function RecruiterDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  const { id } = await params;

  const recruiter = await prisma.user.findUnique({
    where: { id },
    include: {
      candidates: {
        include: {
          applications: true
        }
      },
      placements: true
    }
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
    { name: "Total Candidates Submitted", value: totalCandidates, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Total Applications", value: totalApplications, icon: FileText, color: "text-yellow-600", bg: "bg-yellow-100" },
    { name: "Selected Candidates", value: selectedCandidates, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { name: "Joined Candidates", value: joinedCandidates, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-100" },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{recruiter.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Recruiter Details & Performance Overview</p>
        </div>
        <a href="/recruiters" className="text-sm font-medium text-blue-600 hover:text-blue-800">
          &larr; Back to Recruiters
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Profile Information</h2>
          <div className="space-y-4 text-sm">
            <div>
              <span className="block text-gray-500 font-medium">Email Address</span>
              <span className="text-gray-900">{recruiter.email}</span>
            </div>
            <div>
              <span className="block text-gray-500 font-medium">Mobile Number</span>
              <span className="text-gray-900">{recruiter.mobile || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-gray-500 font-medium">Location</span>
              <span className="text-gray-900">{recruiter.location || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-gray-500 font-medium">Account Status</span>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold mt-1 ${recruiter.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {recruiter.status}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 font-medium">Registered On</span>
              <span className="text-gray-900">{new Date(recruiter.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <a href={`/recruiters/${id}/edit`} className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded transition-colors">
              Edit Recruiter Profile
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow border border-gray-200"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                    <dd>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    </dd>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
