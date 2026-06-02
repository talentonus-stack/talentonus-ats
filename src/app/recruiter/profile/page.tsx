import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { BarChart2, Users, CheckCircle, XCircle, Award, Target, UserPlus } from "lucide-react"

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
    }
  })

  const totalSubmitted = applications.length
  const interviewsScheduled = applications.filter(a => a.status === "INTERVIEW_SCHEDULED" || a.status === "L1_CLEARED" || a.status === "L2_CLEARED").length
  const selected = applications.filter(a => a.status === "SELECTED").length
  const joined = applications.filter(a => a.status === "JOINED").length
  const rejected = applications.filter(a => a.status === "REJECTED").length
  const totalActive = applications.filter(a => a.status !== "JOINED" && a.status !== "REJECTED").length

  const selectionRatio = totalSubmitted > 0 ? ((selected + joined) / totalSubmitted * 100).toFixed(1) : 0
  const joiningRatio = (selected + joined) > 0 ? (joined / (selected + joined) * 100).toFixed(1) : 0

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-light">My Profile & Statistics</h1>
        <p className="mt-2 text-sm text-muted">View your personal information and recruitment performance metrics.</p>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-primary-lighter rounded-xl border border-border p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Total Submitted</h3>
            <Users className="h-5 w-5 text-accent opacity-80" />
          </div>
          <p className="text-4xl font-bold text-light">{totalSubmitted}</p>
        </div>

        <div className="bg-primary-lighter rounded-xl border border-border p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">In Pipeline</h3>
            <Target className="h-5 w-5 text-accent opacity-80" />
          </div>
          <p className="text-4xl font-bold text-light">{totalActive}</p>
        </div>

        <div className="bg-primary-lighter rounded-xl border border-border p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Selected</h3>
            <Award className="h-5 w-5 text-green-400 opacity-80" />
          </div>
          <p className="text-4xl font-bold text-light">{selected + joined}</p>
        </div>

        <div className="bg-primary-lighter rounded-xl border border-border p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Joined</h3>
            <UserPlus className="h-5 w-5 text-blue-400 opacity-80" />
          </div>
          <p className="text-4xl font-bold text-light">{joined}</p>
        </div>

        <div className="bg-primary-lighter rounded-xl border border-border p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Rejected</h3>
            <XCircle className="h-5 w-5 text-red-400 opacity-80" />
          </div>
          <p className="text-4xl font-bold text-light">{rejected}</p>
        </div>

        <div className="bg-primary-lighter rounded-xl border border-border p-6 shadow-md hover:shadow-lg transition-shadow col-span-1 md:col-span-1 lg:col-span-3">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-6">Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-light">Selection Ratio</span>
                <span className="text-lg font-bold text-accent">{selectionRatio}%</span>
              </div>
              <div className="w-full bg-primary rounded-full h-2">
                <div className="bg-accent h-2 rounded-full shadow-[0_0_10px_rgba(170,255,0,0.5)]" style={{ width: `${selectionRatio}%` }}></div>
              </div>
              <p className="text-xs text-muted mt-2">Percentage of submitted candidates who were selected or joined.</p>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-light">Joining Ratio</span>
                <span className="text-lg font-bold text-accent">{joiningRatio}%</span>
              </div>
              <div className="w-full bg-primary rounded-full h-2">
                <div className="bg-accent h-2 rounded-full shadow-[0_0_10px_rgba(170,255,0,0.5)]" style={{ width: `${joiningRatio}%` }}></div>
              </div>
              <p className="text-xs text-muted mt-2">Percentage of selected candidates who successfully joined.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary-lighter p-8 rounded-xl shadow border border-border">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4 border-b pb-6">
            <div>
              <dt className="text-sm font-medium text-muted">Full Name</dt>
              <dd className="mt-1 text-sm text-light">{recruiter.name || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Email Address</dt>
              <dd className="mt-1 text-sm text-light">{recruiter.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Mobile Number</dt>
              <dd className="mt-1 text-sm text-light">{recruiter.mobile || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Location</dt>
              <dd className="mt-1 text-sm text-light">{recruiter.location || "N/A"}</dd>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-light mb-4">Account Status</h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${recruiter.status === 'ACTIVE' ? 'bg-accent/10 text-accent' : 'bg-red-100 text-red-800'}`}>
                {recruiter.status}
              </span>
              <span className="text-sm text-muted">
                (Member since {new Date(recruiter.createdAt).toLocaleDateString()})
              </span>
            </div>
          </div>

          <div className="mt-8 bg-accent/10 p-4 rounded-md border border-accent/20">
            <p className="text-sm text-primary">
              To update your profile information or change your password, please contact the System Administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
