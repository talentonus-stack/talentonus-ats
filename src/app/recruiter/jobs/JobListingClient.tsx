"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Briefcase, IndianRupee, X } from "lucide-react"

type Job = {
  id: string
  title: string
  department: string
  location: string
  experience: string | null
  skills: string | null
  salaryRange: string | null
  industry: string | null
  workingDays: string | null
  priority: string
  gender: string
  vacancies: number
  description: string | null
  jobTiming: string
  postedDate: Date | string
  companyId?: string | null
}

export default function JobListingClient({ jobs }: { jobs: Job[] }) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const formatSalary = (salary: string) => {
    if (!salary) return ""
    // Basic check: if it already has rupees symbol, leave it. Or simply prepend if it's a number.
    // Given the previous code just rendered strings like "100000", we can format it.
    if (salary.includes("₹")) return salary
    // Remove any $ signs
    const cleaned = salary.replace(/\$/g, "")
    // Try formatting as currency if it looks like a number, else just prepend ₹
    const num = parseFloat(cleaned.replace(/,/g, ""))
    if (!isNaN(num)) {
       return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 21 }).format(num)
    }
    return `₹${cleaned}`
  }

  const isNewJob = (date: Date | string) => {
    if (!date) return false
    const jobDate = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - jobDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-900/20 text-red-400 border-red-800/30"
      case "MEDIUM":
        return "bg-orange-900/20 text-orange-400 border-orange-800/30"
      case "LOW":
        return "bg-accent/10 text-accent border-accent/20"
      default:
        return "bg-primary text-light border-border"
    }
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1">
        {jobs.map((job) => (
          <div key={job.id} className="bg-primary-lighter rounded-lg shadow-sm border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="text-lg font-bold text-accent hover:text-accent-hover hover:underline text-left"
                  >
                    {job.title}
                  </button>
                  {isNewJob(job.postedDate) && (
                    <span className="bg-accent text-primary px-2 py-0.5 rounded text-[10px] font-bold tracking-wider animate-pulse">
                      NEW
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-border/50 text-light border border-border/80 shadow-sm">
                     {(job as any).company?.isConfidential ? "Confidential Client" : ((job as any).company?.name || "Unknown Company")}
                  </span>
                </div>
                              </div>

              {/* Desktop action buttons */}
              <div className="flex items-center gap-3 hidden sm:flex">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${getPriorityColor(job.priority)}`}>
                  {job.priority} PRIORITY
                </span>
                <Link
                  href={`/recruiter/candidates/new?jobId=${job.id}`}
                  className="bg-accent/10 text-accent px-4 py-2 rounded-md hover:bg-accent/20 font-medium text-sm border border-accent/20"
                >
                  Submit Candidate
                </Link>
              </div>
            </div>

            <div className="mt-6 border-t border-border/50 pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Experience</span>
                  <p className="text-sm text-light font-medium truncate" title={job.experience || "Not specified"}>{job.experience || "Not specified"}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Location</span>
                  <p className="text-sm text-light font-medium truncate" title={job.location}>{job.location}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Salary Range</span>
                  <p className="text-sm text-light font-medium truncate" title={job.salaryRange ? formatSalary(job.salaryRange) : "Not disclosed"}>{job.salaryRange ? formatSalary(job.salaryRange) : "Not disclosed"}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Required Skills</span>
                  <p className="text-sm text-light font-medium truncate" title={job.skills || "Not specified"}>{job.skills || "Not specified"}</p>
                </div>
              </div>
            </div>

            {/* Mobile action buttons */}
            <div className="mt-5 sm:hidden flex flex-row items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${getPriorityColor(job.priority)}`}>
                {job.priority} PRIORITY
              </span>
              <Link
                href={`/recruiter/candidates/new?jobId=${job.id}`}
                className="flex-1 text-center bg-accent/10 text-accent px-4 py-2 rounded-md hover:bg-accent/20 font-medium text-sm border border-accent/20"
              >
                Submit Candidate
              </Link>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="text-center py-12 bg-primary-lighter rounded-lg border border-border">
            <p className="text-muted">No active job openings available at the moment.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-fade-in overflow-hidden">
          <div className="bg-primary-lighter rounded-2xl shadow-2xl border border-border w-full max-w-3xl flex flex-col relative overflow-hidden max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-border bg-primary/30 shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{selectedJob.title}</h2>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${getPriorityColor(selectedJob.priority)}`}>
                    {selectedJob.priority}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-border text-light">
                    {(selectedJob as any).company?.isConfidential ? "Confidential Client" : ((selectedJob as any).company?.name || "Unknown Company")}
                  </span>
                  <p className="text-sm text-gray-400">{selectedJob.department} • {selectedJob.location}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-white bg-primary/50 hover:bg-primary rounded-full p-2 transition-colors border border-transparent hover:border-border"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-primary custom-scrollbar">
              {/* Info Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Experience</span>
                  <p className="text-sm font-semibold text-white">{selectedJob.experience || "N/A"}</p>
                </div>
                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Salary</span>
                  <p className="text-sm font-semibold text-white">{selectedJob.salaryRange ? formatSalary(selectedJob.salaryRange) : "N/A"}</p>
                </div>
                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Job Timing</span>
                  <p className="text-sm font-semibold text-white">{selectedJob.jobTiming.replace(/_/g, ' ')}</p>
                </div>
                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Vacancies</span>
                  <p className="text-sm font-semibold text-white">{selectedJob.vacancies}</p>
                </div>
                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Working Days</span>
                  <p className="text-sm font-semibold text-white">{selectedJob.workingDays || "N/A"}</p>
                </div>
                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Industry</span>
                  <p className="text-sm font-semibold text-white truncate" title={selectedJob.industry || "N/A"}>{selectedJob.industry || "N/A"}</p>
                </div>
                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors sm:col-span-2">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Gender Preference</span>
                  <p className="text-sm font-semibold text-white">{selectedJob.gender}</p>
                </div>
              </div>

              <div className="mb-8">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Required Skills</span>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills ? selectedJob.skills.split(',').map((skill, index) => (
                    <span key={index} className="inline-flex items-center rounded-md bg-accent/10 px-3 py-1 text-xs font-semibold text-accent border border-accent/20">
                      {skill.trim()}
                    </span>
                  )) : (
                    <span className="text-sm text-gray-500">Not specified</span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Job Description</span>
                <div className="bg-primary-lighter rounded-xl p-5 text-sm text-white whitespace-pre-wrap leading-relaxed shadow-sm border border-border/50">
                  {selectedJob.description || "No description provided."}
                </div>
              </div>
            </div>

            {/* Sticky Floating Action Button (Submit) */}
            <div className="absolute bottom-6 right-6">
              <Link
                href={`/recruiter/candidates/new?jobId=${selectedJob.id}`}
                className="flex items-center justify-center px-6 py-3 bg-[#B6FF00] rounded-full text-sm font-bold text-[#0D0D0D] hover:bg-[#c4ff33] hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(182,255,0,0.3)] hover:shadow-[0_0_25px_rgba(182,255,0,0.5)]"
              >
                Submit Candidate
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
