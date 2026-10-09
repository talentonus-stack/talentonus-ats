"use client"

import { useState, Suspense, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

type JobOption = {
  id: string
  title: string
}

type RecruiterOption = {
  id: string
  name: string | null
}

function FiltersInner({ jobs, recruiters }: { jobs: JobOption[], recruiters: RecruiterOption[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [name, setName] = useState(searchParams.get("name") || "")
  const [jobId, setJobId] = useState(searchParams.get("jobId") || "")
  const [recruiterId, setRecruiterId] = useState(searchParams.get("recruiterId") || "")

  // Sync state with URL params
  useEffect(() => {
    const pName = searchParams.get("name") || "";
    const pJob = searchParams.get("jobId") || "";
    const pRec = searchParams.get("recruiterId") || "";

    // Using a timeout to avoid synchronous setState inside useEffect warning during hydration
    const timer = setTimeout(() => {
      if (name !== pName) setName(pName);
      if (jobId !== pJob) setJobId(pJob);
      if (recruiterId !== pRec) setRecruiterId(pRec);
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Always reset to page 1 when filters change
    params.delete("page")

    if (name.trim()) params.set("name", name.trim())
    else params.delete("name")

    if (jobId) params.set("jobId", jobId)
    else params.delete("jobId")

    if (recruiterId) params.set("recruiterId", recruiterId)
    else params.delete("recruiterId")

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    setName("")
    setJobId("")
    setRecruiterId("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("name")
    params.delete("jobId")
    params.delete("recruiterId")
    params.delete("page") // Reset to page 1
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-primary-lighter rounded-xl border border-border p-4 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-1/3">
          <label htmlFor="filter-name" className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Candidate Name</label>
          <input
            id="filter-name"
            type="text"
            placeholder="Search by name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="block w-full rounded-md border-0 py-2 text-light bg-primary shadow-sm ring-1 ring-inset ring-border placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6"
          />
        </div>

        <div className="w-full sm:w-1/3">
          <label htmlFor="filter-job" className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Applied Job</label>
          <select
            id="filter-job"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="block w-full rounded-md border-0 py-2 text-light bg-primary shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 [&>option]:bg-primary"
          >
            <option value="">All Jobs</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-1/3">
          <label htmlFor="filter-recruiter" className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Recruiter Name</label>
          <select
            id="filter-recruiter"
            value={recruiterId}
            onChange={(e) => setRecruiterId(e.target.value)}
            className="block w-full rounded-md border-0 py-2 text-light bg-primary shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 [&>option]:bg-primary"
          >
            <option value="">All Recruiters</option>
            {recruiters.map(r => (
              <option key={r.id} value={r.id}>{r.name || 'Unknown'}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={applyFilters}
            className="w-full sm:w-auto flex-1 rounded-md bg-accent/10 px-3.5 py-2 text-sm font-semibold text-accent shadow-sm ring-1 ring-inset ring-accent/20 hover:bg-accent/20 transition-colors"
          >
            Filter
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="w-full sm:w-auto flex-1 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-muted shadow-sm ring-1 ring-inset ring-border hover:bg-primary-lighter hover:text-light transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CandidateFilters(props: { jobs: JobOption[], recruiters: RecruiterOption[] }) {
  return (
    <Suspense fallback={<div className="h-[84px] bg-primary-lighter rounded-xl border border-border p-4 mb-6 shadow-sm animate-pulse"></div>}>
      <FiltersInner {...props} />
    </Suspense>
  )
}
