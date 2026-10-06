"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Briefcase, Users as UsersIcon, X, Filter } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

export default function CandidateFilterClient({
  q,
  jobId,
  recruiterId,
  availableJobs,
  availableRecruiters
}: {
  q: string,
  jobId: string,
  recruiterId: string,
  availableJobs: any[],
  availableRecruiters: any[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(q)
  const initialMount = useRef(true)

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false
      return
    }

    const timer = setTimeout(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))

      if (searchTerm) {
        current.set("q", searchTerm)
      } else {
        current.delete("q")
      }

      // Reset page when searching
      current.delete("page")

      const search = current.toString()
      const query = search ? `?${search}` : ""
      router.push(`${pathname}${query}`)
    }, 400) // 400ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm, pathname, router, searchParams])

  return (
    <div className="mb-6 relative bg-primary-lighter border border-border/60 rounded-xl shadow-sm overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/20 via-accent to-accent/20 opacity-20"></div>
      <form className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/60" method="GET" action="/candidates">

        {/* Search Name (Auto-submit via state) */}
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className={`w-4 h-4 transition-colors ${searchTerm ? 'text-accent' : 'text-muted group-focus-within:text-accent'}`} />
          </div>
          <input
            type="text"
            name="q"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate..."
            className={`block w-full bg-transparent border-none pl-11 pr-4 py-3.5 text-sm text-light placeholder-muted focus:ring-0 transition-colors ${searchTerm ? 'bg-accent/5' : 'hover:bg-primary/30'}`}
          />
        </div>

        {/* Job Dropdown */}
        <div className="flex-1 relative group md:max-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Briefcase className={`w-4 h-4 transition-colors ${jobId ? 'text-accent' : 'text-muted group-focus-within:text-accent'}`} />
          </div>
          <select
            name="jobId"
            defaultValue={jobId}
            className={`block w-full bg-transparent border-none pl-11 pr-10 py-3.5 text-sm ${jobId ? 'text-light bg-accent/5 font-medium' : 'text-muted'} focus:ring-0 appearance-none cursor-pointer hover:bg-primary/30 transition-colors`}
          >
            <option value="" className="bg-primary text-muted font-normal">All Jobs</option>
            {availableJobs.map(job => (
              <option key={job.id} value={job.id} className="bg-primary text-light font-normal">{job.title}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-muted">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* Recruiter Dropdown */}
        <div className="flex-1 relative group md:max-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <UsersIcon className={`w-4 h-4 transition-colors ${recruiterId ? 'text-accent' : 'text-muted group-focus-within:text-accent'}`} />
          </div>
          <select
            name="recruiterId"
            defaultValue={recruiterId}
            className={`block w-full bg-transparent border-none pl-11 pr-10 py-3.5 text-sm ${recruiterId ? 'text-light bg-accent/5 font-medium' : 'text-muted'} focus:ring-0 appearance-none cursor-pointer hover:bg-primary/30 transition-colors`}
          >
            <option value="" className="bg-primary text-muted font-normal">All Recruiters</option>
            <option value="system" className="bg-primary text-light font-normal">System / Admin (Direct)</option>
            {availableRecruiters.map(rec => (
              <option key={rec.id} value={rec.id} className="bg-primary text-light font-normal">{rec.name || rec.email}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-muted">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center bg-primary/20 md:w-auto shrink-0">
          <button
            type="submit"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-accent hover:text-primary hover:bg-accent transition-colors border-l border-border/60"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
          {(searchTerm || jobId || recruiterId) && (
            <Link
              href="/candidates"
              className="flex items-center justify-center px-4 py-3.5 text-muted hover:text-red-400 hover:bg-red-900/10 transition-colors border-l border-border/60"
              title="Clear Filters"
            >
              <X className="w-4 h-4" />
            </Link>
          )}
        </div>

      </form>
    </div>
  )
}
