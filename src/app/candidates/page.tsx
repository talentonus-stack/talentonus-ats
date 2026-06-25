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

      <div className="w-full">
        {/* Mobile Card View (<768px) */}
        <div className="block md:hidden space-y-4">
          {candidates.map((candidate) => {
            const latestApp = candidate.applications[0];
            return (
              <div key={candidate.id} className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-5 flex flex-col gap-4 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <Link href={`/candidates/${candidate.id}`} className="block">
                      <h3 className="text-sm font-bold text-light hover:text-accent transition-colors">{candidate.firstName} {candidate.lastName || ''}</h3>
                      <p className="text-xs text-muted mt-0.5">{candidate.email}</p>
                      <p className="text-xs font-semibold text-light mt-1.5">{candidate.phone || 'No phone'}</p>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 -mt-2 -mr-2">
                    <Link href={`/candidates/${candidate.id}/edit`} className="text-xs font-bold text-muted hover:text-accent transition-colors p-2" title="Edit">
                      Edit
                    </Link>
                    <DeleteButton id={candidate.id} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm border-y border-border/50 py-3">
                   <div>
                      <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Recruiter</span>
                      <span className="text-light">{candidate.recruiter ? candidate.recruiter.name : 'Admin'}</span>
                   </div>
                   <div>
                      <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Experience</span>
                      <span className="text-light">{candidate.experience || 'N/A'}</span>
                   </div>
                   <div>
                      <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Current Salary</span>
                      <span className="font-medium text-light">{formatSalary(candidate.currentSalary)}</span>
                   </div>
                   <div>
                      <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Expected Salary</span>
                      <span className="font-medium text-accent">{formatSalary(candidate.expectedSalary)}</span>
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="block text-[10px] uppercase font-bold text-muted tracking-wider">Notice Period</span>
                    <span className="text-xs text-light font-medium">{candidate.noticePeriod || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="block text-[10px] uppercase font-bold text-muted tracking-wider">Applied Job</span>
                    {latestApp ? (
                      <div className="text-right">
                        <span className="text-xs font-medium text-light block">{latestApp.job.title}</span>
                        <span className="inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border border-accent/20 mt-1">
                          {latestApp.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">Not applied</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {candidates.length === 0 && (
            <div className="bg-primary-lighter rounded-2xl border border-border p-8 text-center text-sm text-muted">
              No candidates found.
            </div>
          )}
        </div>

        {/* Responsive Table View (≥768px) */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
          <div className="w-full">
            <table className="w-full table-fixed divide-y divide-border">
              <thead className="bg-primary-lighter/50">
                <tr>
                  <th className="w-[20%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate Info</th>
                  <th className="hidden lg:table-cell w-[10%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Experience</th>
                  <th className="w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Salary Info (C/E)</th>
                  <th className="hidden lg:table-cell w-[10%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Notice</th>
                  <th className="w-[20%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Applied Job</th>
                  <th className="w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recruiter</th>
                  <th className="w-[10%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-primary-lighter">
                {candidates.map((candidate) => {
                  const latestApp = candidate.applications[0];
                  return (
                    <tr key={candidate.id} className="hover:bg-primary/50 transition-colors group">
                      <td className="px-4 py-4 overflow-hidden">
                        <Link href={`/candidates/${candidate.id}`} className="font-semibold text-light group-hover:text-accent transition-colors truncate block" title={`${candidate.firstName} ${candidate.lastName || ''}`}>
                          {candidate.firstName} {candidate.lastName || ''}
                        </Link>
                        <div className="text-gray-500 text-xs mt-1 truncate" title={candidate.email}>{candidate.email}</div>
                        <div className="text-gray-500 text-xs truncate" title={candidate.phone || 'No phone'}>{candidate.phone || 'No phone'}</div>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors truncate">
                        {candidate.experience || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-xs text-muted overflow-hidden">
                        <div className="truncate">Cur: <span className="font-medium text-light" title={formatSalary(candidate.currentSalary)}>{formatSalary(candidate.currentSalary)}</span></div>
                        <div className="truncate">Exp: <span className="font-medium text-light" title={formatSalary(candidate.expectedSalary)}>{formatSalary(candidate.expectedSalary)}</span></div>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors truncate">
                        {candidate.noticePeriod || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors overflow-hidden">
                        {latestApp ? (
                          <div>
                            <span className="font-medium truncate block" title={latestApp.job.title}>{latestApp.job.title}</span>
                            <div className="mt-1">
                              <span className="inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border border-accent/20 truncate max-w-full" title={latestApp.status.replace(/_/g, ' ')}>
                                {latestApp.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not applied</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted truncate" title={candidate.recruiter ? candidate.recruiter.name : 'Admin'}>
                        {candidate.recruiter ? candidate.recruiter.name : 'Admin'}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/candidates/${candidate.id}/edit`} className="text-muted hover:text-accent transition-colors">
                            Edit
                          </Link>
                          <DeleteButton id={candidate.id} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {candidates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-sm text-muted text-center">No candidates found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
