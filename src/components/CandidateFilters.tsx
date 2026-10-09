"use client"

import { useState, Suspense, useEffect, useCallback } from "react"
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

  // Helper to push to router
  const updateUrl = useCallback((newName: string, newJobId: string, newRecruiterId: string) => {
    const params = new URLSearchParams(searchParams.toString())

    // Always reset to page 1 when filters change
    params.delete("page")

    if (newName.trim()) params.set("name", newName.trim())
    else params.delete("name")

    if (newJobId) params.set("jobId", newJobId)
    else params.delete("jobId")

    if (newRecruiterId) params.set("recruiterId", newRecruiterId)
    else params.delete("recruiterId")

    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router]);

  // Debounce effect for candidate name
  useEffect(() => {
    const pName = searchParams.get("name") || "";
    if (name !== pName) {
      const timer = setTimeout(() => {
        updateUrl(name, jobId, recruiterId);
      }, 400); // 400ms debounce
      return () => clearTimeout(timer);
    }
  }, [name, jobId, recruiterId, searchParams, updateUrl]);

  return (
    <div className="bg-primary-lighter rounded-2xl border border-border p-6 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label htmlFor="filter-name" className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Candidate Name</label>
          <input
            id="filter-name"
            type="text"
            placeholder="Search by name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 px-3.5 text-light bg-primary shadow-sm ring-1 ring-inset ring-border placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="filter-job" className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Applied Job</label>
          <select
            id="filter-job"
            value={jobId}
            onChange={(e) => {
              const newVal = e.target.value;
              setJobId(newVal);
              updateUrl(name, newVal, recruiterId);
            }}
            className="block w-full rounded-lg border-0 py-2.5 px-3.5 text-light bg-primary shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 [&>option]:bg-primary"
          >
            <option value="">All Jobs</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="filter-recruiter" className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Recruiter Name</label>
          <select
            id="filter-recruiter"
            value={recruiterId}
            onChange={(e) => {
              const newVal = e.target.value;
              setRecruiterId(newVal);
              updateUrl(name, jobId, newVal);
            }}
            className="block w-full rounded-lg border-0 py-2.5 px-3.5 text-light bg-primary shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 [&>option]:bg-primary"
          >
            <option value="">All Recruiters</option>
            {recruiters.map(r => (
              <option key={r.id} value={r.id}>{r.name || 'Unknown'}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default function CandidateFilters(props: { jobs: JobOption[], recruiters: RecruiterOption[] }) {
  return (
    <Suspense fallback={<div className="h-[104px] bg-primary-lighter rounded-2xl border border-border p-6 mb-6 shadow-sm animate-pulse"></div>}>
      <FiltersInner {...props} />
    </Suspense>
  )
}
