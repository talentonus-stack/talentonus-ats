import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import DeleteButton from "./DeleteButton"

export default async function CandidatesPage() {
  const formatSalary = (salary: string | null) => {
    if (!salary) return "N/A"
    if (salary.includes("₹")) return salary
    const cleaned = salary.replace(/\$/g, "")
    const num = parseFloat(cleaned.replace(/,/g, ""))
    if (!isNaN(num)) {
       return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 21 }).format(num)
    }
    return `₹${cleaned}`
  }
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/recruiter")
  }

  let candidates: any[] = []
  try {
    candidates = await prisma.candidate.findMany({
      include: {
        recruiter: true,
        applications: {
          include: { job: true },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Failed to load candidates", e)
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-light">Candidates</h1>
          <p className="mt-2 text-sm text-muted">A comprehensive list of all candidates across the system.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/candidates/new"
            className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]"
          >
            Add candidate
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-border min-w-[1000px]">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Experience</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Salary Info (C/E)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Notice</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Applied Job</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recruiter</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-primary-lighter">
              {candidates.map((candidate) => {
                const latestApp = candidate.applications[0];
                return (
                  <tr key={candidate.id} className="hover:bg-primary/50 transition-colors group">
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link href={`/candidates/${candidate.id}`} className="font-semibold text-light group-hover:text-accent transition-colors">
                        {candidate.firstName} {candidate.lastName || ''}
                      </Link>
                      <div className="text-gray-500 text-xs mt-1">{candidate.email}</div>
                      <div className="text-gray-500 text-xs">{candidate.phone || 'No phone'}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors">
                      {candidate.experience || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-muted">
                      <div>Cur: <span className="font-medium text-light">{formatSalary(candidate.currentSalary)}</span></div>
                      <div>Exp: <span className="font-medium text-light">{formatSalary(candidate.expectedSalary)}</span></div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors">
                      {candidate.noticePeriod || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors">
                      {latestApp ? (
                        <div>
                          <span className="font-medium">{latestApp.job.title}</span>
                          <div className="mt-1">
                            <span className="inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent border-accent/20">
                              {latestApp.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not applied</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                      {candidate.recruiter ? candidate.recruiter.name : 'System/Admin'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-4">
                      <Link href={`/candidates/${candidate.id}/edit`} className="text-muted hover:text-accent transition-colors">
                        Edit
                      </Link>
                      <DeleteButton id={candidate.id} />
                    </td>
                  </tr>
                )
              })}
              {candidates.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-sm text-muted text-center">No candidates found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
