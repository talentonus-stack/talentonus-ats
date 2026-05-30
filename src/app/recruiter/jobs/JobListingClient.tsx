"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Briefcase, DollarSign, X } from "lucide-react"

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
}

export default function JobListingClient({ jobs }: { jobs: Job[] }) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

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
                <button
                  onClick={() => setSelectedJob(job)}
                  className="text-lg font-bold text-accent hover:text-accent-hover hover:underline text-left"
                >
                  {job.title}
                </button>
                <div className="mt-2 flex flex-wrap gap-y-2 gap-x-6 text-sm text-muted">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-muted" />
                    <span>{job.experience || "Experience not specified"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted" />
                    <span>{job.salaryRange || "Salary not disclosed"}</span>
                  </div>
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

            <div className="mt-4">
              <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Required Skills</span>
              <p className="text-sm text-light font-medium">{job.skills || 'Not specified'}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-primary-lighter rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-light">{selectedJob.title}</h2>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getPriorityColor(selectedJob.priority)}`}>
                    {selectedJob.priority}
                  </span>
                </div>
                <p className="text-sm text-muted mt-1">{selectedJob.department} • {selectedJob.location}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-muted hover:text-muted bg-primary hover:bg-gray-200 rounded-full p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 text-black">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                <div>
                  <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Industry</span>
                  <p className="text-sm font-medium">{selectedJob.industry || "N/A"}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Experience</span>
                  <p className="text-sm font-medium">{selectedJob.experience || "N/A"}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Salary Range</span>
                  <p className="text-sm font-medium">{selectedJob.salaryRange || "N/A"}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Job Timing</span>
                  <p className="text-sm font-medium">{selectedJob.jobTiming.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Working Days</span>
                  <p className="text-sm font-medium">{selectedJob.workingDays || "N/A"}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Vacancies</span>
                  <p className="text-sm font-medium">{selectedJob.vacancies}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Gender Preference</span>
                  <p className="text-sm font-medium">{selectedJob.gender}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Required Skills</span>
                <div className="bg-primary border rounded-md p-3 text-sm">
                  {selectedJob.skills || "Not specified"}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Job Description</span>
                <div className="bg-primary border rounded-md p-4 text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedJob.description || "No description provided."}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-primary flex justify-end items-center gap-4 rounded-b-lg">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-6 py-2 border border-border rounded-md text-sm font-medium text-light bg-primary-lighter hover:bg-primary"
              >
                Close
              </button>
              <Link
                href={`/recruiter/candidates/new?jobId=${selectedJob.id}`}
                className="px-6 py-2 bg-accent rounded-md text-sm font-medium text-primary hover:bg-accent-hover hover:scale-[1.02] shadow-[0_0_15px_rgba(170,255,0,0.2)] shadow-sm"
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
