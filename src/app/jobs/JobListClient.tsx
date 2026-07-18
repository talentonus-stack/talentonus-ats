"use client"

import { useState } from "react"
import Link from "next/link"
import { Trash2, Edit2, Eye, X } from "lucide-react"
import { deleteJob } from "./actions"

type Job = {
  id: string
  title: string
  company: { name: string } | null
  experience: string | null
  location: string
  priority: string
  status: string
  postedDate: Date
  salaryRange?: string | null
  jobTiming?: string
  vacancies?: number
  workingDays?: string | null
  industry?: string | null
  gender?: string
  skills?: string | null
  description?: string | null
  department?: string
  _count: {
    applications: number
    placements: number
  }
}

export default function JobListClient({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const formatSalary = (salary: string) => {
    if (!salary) return ""
    if (salary.includes("₹")) return salary
    const cleaned = salary.replace(/\$/g, "")
    const num = parseFloat(cleaned.replace(/,/g, ""))
    if (!isNaN(num)) {
       return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 21 }).format(num)
    }
    return `₹${cleaned}`
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

  const handleDelete = async (id: string, countApp: number, countPlace: number) => {
    if (countApp > 0 || countPlace > 0) {
      alert("This job cannot be deleted because it already contains applications or placement records.")
      return
    }

    if (!confirm("Are you sure you want to delete this job?\n\nThis action cannot be undone.")) {
      return
    }

    try {
      const res = await deleteJob(id)
      if (res.success) {
        setJobs(jobs.filter(j => j.id !== id))
      } else {
        alert(res.error || "Failed to delete job")
      }
    } catch (e: any) {
      alert(e.message || "Failed to delete job")
    }
  }

  return (
    <div className="w-full">
      {/* Mobile Card View (<768px) */}
      <div className="block md:hidden space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-5 flex flex-col gap-4 relative">
            <div className="flex justify-between items-start">
              <div className="pr-4 overflow-hidden">
                <h3 className="text-sm font-bold text-light truncate" title={job.title}>{job.title}</h3>
                <p className="text-xs font-semibold text-muted mt-1 truncate" title={job.company?.name || 'No Company'}>{job.company?.name || 'No Company'}</p>
              </div>
              <div className="flex items-center gap-2 -mt-2 -mr-2">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="text-muted hover:text-accent transition-colors p-2 shrink-0"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <Link href={`/jobs/${job.id}/edit`} className="text-xs font-bold text-muted hover:text-accent transition-colors p-2 shrink-0" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(job.id, job._count.applications, job._count.placements)}
                  className="text-muted hover:text-red-500 transition-colors p-2 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-y border-border/50 py-3">
               <div className="overflow-hidden">
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Experience</span>
                  <span className="text-light truncate block" title={job.experience || 'N/A'}>{job.experience || 'N/A'}</span>
               </div>
               <div className="overflow-hidden">
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Location</span>
                  <span className="text-light truncate block" title={job.location}>{job.location}</span>
               </div>
               <div>
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Priority</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border ${job.priority === 'HIGH' ? 'bg-red-900/20 text-red-400 border-red-800/30' : job.priority === 'MEDIUM' ? 'bg-orange-900/20 text-orange-400 border-orange-800/30' : 'bg-accent/10 text-accent border-accent/20'}`}>
                    {job.priority}
                  </span>
               </div>
               <div>
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Status</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border ${job.status === 'OPEN' ? 'bg-accent/10 text-accent border-accent/20' : job.status === 'ON_HOLD' ? 'bg-orange-900/20 text-orange-400 border-orange-800/30' : 'bg-border text-muted border-border'}`}>
                    {job.status}
                  </span>
               </div>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Posted Date</span>
              <span className="text-xs text-light">{new Date(job.postedDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="bg-primary-lighter rounded-2xl border border-border p-8 text-center text-sm text-muted">
            No jobs found matching your criteria.
          </div>
        )}
      </div>

      {/* Responsive Table View (≥768px) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="w-full">
          <table className="w-full table-fixed divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="w-[30%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Title / Company</th>
                <th className="hidden lg:table-cell w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Experience</th>
                <th className="w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Location</th>
                <th className="w-[10%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Priority</th>
                <th className="w-[10%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="hidden lg:table-cell w-[10%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Posted</th>
                <th className="w-[10%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-primary-lighter">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-primary/50 transition-colors group">
                  <td className="px-4 py-4 overflow-hidden">
                    <div className="text-sm font-medium text-light group-hover:text-accent transition-colors truncate" title={job.title}>{job.title}</div>
                    <div className="text-xs text-muted mt-1 truncate" title={job.company?.name || 'No Company'}>{job.company?.name || 'No Company'}</div>
                  </td>
                  <td className="hidden lg:table-cell px-4 py-4 text-sm text-muted truncate" title={job.experience || 'N/A'}>{job.experience || 'N/A'}</td>
                  <td className="px-4 py-4 text-sm text-muted truncate" title={job.location}>{job.location}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold border truncate max-w-full ${job.priority === 'HIGH' ? 'bg-red-900/20 text-red-400 border-red-800/30' : job.priority === 'MEDIUM' ? 'bg-orange-900/20 text-orange-400 border-orange-800/30' : 'bg-accent/10 text-accent border-accent/20'}`} title={job.priority}>
                      {job.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold border truncate max-w-full ${job.status === 'OPEN' ? 'bg-accent/10 text-accent border-accent/20' : job.status === 'ON_HOLD' ? 'bg-orange-900/20 text-orange-400 border-orange-800/30' : 'bg-border text-muted border-border'}`} title={job.status}>
                      {job.status}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-4 py-4 text-sm text-muted truncate">{new Date(job.postedDate).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="text-muted hover:text-accent transition-colors p-1"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link href={`/jobs/${job.id}/edit`} className="text-muted hover:text-accent transition-colors p-1" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(job.id, job._count.applications, job._count.placements)}
                        className="text-muted hover:text-red-500 transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-sm text-muted text-center">No jobs found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                  <p className="text-sm text-gray-400">{selectedJob.department || "No Department"} • {selectedJob.location}</p>
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
                  <p className="text-sm font-semibold text-white">{selectedJob.jobTiming ? selectedJob.jobTiming.replace(/_/g, ' ') : "N/A"}</p>
                </div>
                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Vacancies</span>
                  <p className="text-sm font-semibold text-white">{selectedJob.vacancies || "N/A"}</p>
                </div>
                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Working Days</span>
                  <p className="text-sm font-semibold text-white">{selectedJob.workingDays || "N/A"}</p>
                </div>
                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Working Hours</span>
                  <p className="text-sm font-semibold text-white">{(selectedJob as any).company?.workingHours || "N/A"}</p>
                </div>
                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Industry</span>
                  <p className="text-sm font-semibold text-white truncate" title={selectedJob.industry || "N/A"}>{selectedJob.industry || "N/A"}</p>
                </div>
                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Gender Preference</span>
                  <p className="text-sm font-semibold text-white">{selectedJob.gender || "N/A"}</p>
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
          </div>
        </div>
      )}
    </div>
  )
}
