import React from "react"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import CandidateActions from "./CandidateActions"

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
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

  const resolvedSearchParams = await searchParams;
  let pageParam = resolvedSearchParams?.page;
  let requestedPage = 1;

  if (typeof pageParam === 'string') {
    const parsed = parseInt(pageParam, 10);
    if (!isNaN(parsed) && parsed > 0) {
      requestedPage = parsed;
    }
  }

  let candidates: any[] = []
  let totalCount = 0;
  let totalPages = 1;
  let currentPage = requestedPage;
  const take = 25;

  try {
    // Attempt concurrent fetch for requested page
    const skipAttempt = (requestedPage - 1) * take;

    let [fetchedCount, fetchedCandidates] = await Promise.all([
      prisma.candidate.count({ where: { status: "ACTIVE" } }),
      prisma.candidate.findMany({
        where: { status: "ACTIVE" },
        take,
        skip: skipAttempt,
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
    ]);

    totalCount = fetchedCount;

    if (totalCount > 0) {
      totalPages = Math.ceil(totalCount / take);

      if (requestedPage > totalPages) {
        // Out of bounds, fetch the actual last page
        currentPage = totalPages;
        const actualSkip = (currentPage - 1) * take;
        candidates = await prisma.candidate.findMany({
          where: { status: "ACTIVE" },
          take,
          skip: actualSkip,
          include: {
            recruiter: true,
            applications: {
              include: { job: true },
              orderBy: { createdAt: "desc" },
              take: 1
            }
          },
          orderBy: { createdAt: "desc" }
        });
      } else {
        currentPage = requestedPage;
        candidates = fetchedCandidates;
      }
    }
  } catch (e) {
    console.error("Failed to load candidates", e);
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
        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="w-[20%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate Info</th>
                <th className="w-[10%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Experience</th>
                <th className="w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Salary Info (C/E)</th>
                <th className="w-[10%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Notice</th>
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
                    <td className="px-4 py-4 text-sm truncate" title={`${candidate.firstName} ${candidate.lastName || ''}`}>
                      <Link href={`/candidates/${candidate.id}`} className="font-semibold text-light group-hover:text-accent transition-colors truncate block">
                        {candidate.firstName} {candidate.lastName || ''}
                      </Link>
                      <div className="text-gray-500 text-xs mt-1 truncate" title={candidate.email}>{candidate.email}</div>
                      <div className="text-gray-500 text-xs truncate" title={candidate.phone || 'No phone'}>{candidate.phone || 'No phone'}</div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors truncate" title={candidate.experience || 'N/A'}>
                      {candidate.experience || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted truncate">
                      <div className="truncate" title={`Cur: ${formatSalary(candidate.currentSalary)}`}>Cur: <span className="font-medium text-light">{formatSalary(candidate.currentSalary)}</span></div>
                      <div className="truncate" title={`Exp: ${formatSalary(candidate.expectedSalary)}`}>Exp: <span className="font-medium text-light">{formatSalary(candidate.expectedSalary)}</span></div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors truncate" title={candidate.noticePeriod || 'N/A'}>
                      {candidate.noticePeriod || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors">
                      {latestApp ? (
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate" title={latestApp.job.title}>{latestApp.job.title}</span>
                          <div className="mt-1 flex">
                            <span className="inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent border-accent/20 truncate" title={latestApp.status.replace(/_/g, ' ')}>
                              {latestApp.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not applied</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted truncate" title={candidate.recruiter ? candidate.recruiter.name : 'System/Admin'}>
                      {candidate.recruiter ? candidate.recruiter.name : 'System/Admin'}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium">
                      <CandidateActions candidate={candidate} />
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

      {totalCount > 25 && (
        <div className="flex items-center justify-between border-t border-border bg-primary-lighter px-4 py-2.5">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-muted">
                Showing <span className="font-medium text-light">{(currentPage - 1) * take + 1}</span>&ndash;<span className="font-medium text-light">{Math.min(currentPage * take, totalCount)}</span> of <span className="font-medium text-light">{totalCount}</span> candidates
              </p>
            </div>
            <div>
              <nav className="flex items-center gap-1.5" aria-label="Pagination">
                <Link
                  href={currentPage > 1 ? `/candidates?page=${currentPage - 1}` : '#'}
                  className={`inline-flex items-center justify-center h-8 px-2.5 text-xs font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary-lighter ${
                    currentPage <= 1
                      ? 'border-border/50 text-gray-600 cursor-not-allowed bg-primary-lighter/50'
                      : 'border-border text-muted hover:border-gray-500 hover:text-light bg-transparent'
                  }`}
                  aria-disabled={currentPage <= 1}
                  {...(currentPage <= 1 ? { tabIndex: -1 } : {})}
                >
                  Previous
                </Link>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((p, i, arr) => {
                    const isCurrent = p === currentPage;
                    const showEllipsisBefore = i > 0 && arr[i - 1] !== p - 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsisBefore && (
                          <span className="inline-flex items-center justify-center h-8 px-2 text-xs font-medium text-muted">
                            ...
                          </span>
                        )}
                        <Link
                          href={`/candidates?page=${p}`}
                          className={`inline-flex items-center justify-center h-8 min-w-[32px] px-2.5 text-xs font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary-lighter ${
                            isCurrent
                              ? 'border-accent/30 bg-accent/10 text-accent z-10'
                              : 'border-border text-muted hover:border-gray-500 hover:text-light bg-transparent'
                          }`}
                          aria-current={isCurrent ? 'page' : undefined}
                        >
                          {p}
                        </Link>
                      </React.Fragment>
                    );
                  })}

                <Link
                  href={currentPage < totalPages ? `/candidates?page=${currentPage + 1}` : '#'}
                  className={`inline-flex items-center justify-center h-8 px-2.5 text-xs font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary-lighter ${
                    currentPage >= totalPages
                      ? 'border-border/50 text-gray-600 cursor-not-allowed bg-primary-lighter/50'
                      : 'border-border text-muted hover:border-gray-500 hover:text-light bg-transparent'
                  }`}
                  aria-disabled={currentPage >= totalPages}
                  {...(currentPage >= totalPages ? { tabIndex: -1 } : {})}
                >
                  Next
                </Link>
              </nav>
            </div>
          </div>

          {/* Mobile pagination */}
          <div className="flex flex-1 justify-between sm:hidden items-center gap-2">
            <Link
              href={currentPage > 1 ? `/candidates?page=${currentPage - 1}` : '#'}
              className={`inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-md border transition-colors ${
                currentPage <= 1
                  ? 'border-border/50 text-gray-600 cursor-not-allowed bg-primary-lighter/50'
                  : 'border-border text-muted hover:border-gray-500 hover:text-light bg-transparent'
              }`}
              aria-disabled={currentPage <= 1}
              {...(currentPage <= 1 ? { tabIndex: -1 } : {})}
            >
              Previous
            </Link>
            <div className="flex items-center text-xs text-muted">
              Page <span className="font-medium text-light mx-1">{currentPage}</span> of <span className="font-medium text-light mx-1">{totalPages}</span>
            </div>
            <Link
              href={currentPage < totalPages ? `/candidates?page=${currentPage + 1}` : '#'}
              className={`inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-md border transition-colors ${
                currentPage >= totalPages
                  ? 'border-border/50 text-gray-600 cursor-not-allowed bg-primary-lighter/50'
                  : 'border-border text-muted hover:border-gray-500 hover:text-light bg-transparent'
              }`}
              aria-disabled={currentPage >= totalPages}
              {...(currentPage >= totalPages ? { tabIndex: -1 } : {})}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}