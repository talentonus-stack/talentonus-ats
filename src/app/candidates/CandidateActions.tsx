"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, Pencil, Trash2, X, FileText, CheckCircle, Clock } from "lucide-react"
import { deleteCandidate } from "./actions"

export default function CandidateActions({ candidate }: { candidate: any }) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

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

  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this candidate and all their applications?")) {
      await deleteCandidate(candidate.id)
    }
  }

  // Handle modal body scroll locking
  useEffect(() => {
    if (isViewModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isViewModalOpen])

  const latestApp = candidate.applications && candidate.applications.length > 0 ? candidate.applications[0] : null

  return (
    <>
      <div className="flex items-center justify-end gap-3 text-muted">
        <button
          onClick={() => setIsViewModalOpen(true)}
          className="hover:text-accent transition-colors"
          title="View Candidate"
        >
          <Eye className="w-4 h-4" />
        </button>
        <Link
          href={`/candidates/${candidate.id}/edit`}
          className="hover:text-accent transition-colors"
          title="Edit Candidate"
        >
          <Pencil className="w-4 h-4" />
        </Link>
        <button
          onClick={handleDelete}
          className="hover:text-red-400 transition-colors"
          title="Delete Candidate"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-primary-lighter w-full max-w-4xl rounded-lg shadow-2xl border border-border flex flex-col max-h-[calc(100vh-96px)] relative">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-primary-lighter shrink-0 rounded-t-lg">
              <div>
                <h2 className="text-xl font-bold text-light">Candidate Profile</h2>
                <p className="text-sm text-muted mt-1">{candidate.firstName} {candidate.lastName}</p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-muted hover:text-light transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-primary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Personal Information */}
                <div className="bg-primary-lighter rounded-lg border border-border p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-light border-b border-border pb-2">Personal Information</h3>
                  <div>
                    <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Full Name</span>
                    <p className="text-sm font-medium text-light">{candidate.firstName} {candidate.lastName}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Email</span>
                    <p className="text-sm font-medium text-light break-all">{candidate.email}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Phone</span>
                    <p className="text-sm font-medium text-light">{candidate.phone || "N/A"}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Current Location</span>
                    <p className="text-sm font-medium text-light">{candidate.currentLocation || "N/A"}</p>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-primary-lighter rounded-lg border border-border p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-light border-b border-border pb-2">Professional Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Experience</span>
                      <p className="text-sm font-medium text-light">{candidate.experience || "N/A"}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Notice Period</span>
                      <p className="text-sm font-medium text-light">{candidate.noticePeriod || "N/A"}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Current Salary</span>
                      <p className="text-sm font-medium text-light">{formatSalary(candidate.currentSalary)}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Expected Salary</span>
                      <p className="text-sm font-medium text-light">{formatSalary(candidate.expectedSalary)}</p>
                    </div>
                  </div>
                </div>

                {/* Application Information */}
                <div className="bg-primary-lighter rounded-lg border border-border p-5 space-y-4 md:col-span-2">
                  <h3 className="text-sm font-semibold text-light border-b border-border pb-2">Application Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Applied Job</span>
                      <p className="text-sm font-medium text-light">{latestApp ? latestApp.job?.title || 'Unknown Job' : 'No active applications'}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Status</span>
                      {latestApp ? (
                        <span className="inline-flex rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent border border-accent/20">
                          {latestApp.status.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <p className="text-sm font-medium text-muted">N/A</p>
                      )}
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Recruiter</span>
                      <p className="text-sm font-medium text-light">{candidate.recruiter ? candidate.recruiter.name : 'System/Admin'}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Submitted Date</span>
                      <p className="text-sm font-medium text-light">{new Date(candidate.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-primary-lighter rounded-lg border border-border p-5 space-y-4 md:col-span-2">
                  <h3 className="text-sm font-semibold text-light border-b border-border pb-2">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Skills</span>
                      <p className="text-sm font-medium text-light bg-primary p-3 rounded border border-border">{candidate.skills || "N/A"}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Remarks</span>
                      <p className="text-sm font-medium text-light bg-primary p-3 rounded border border-border whitespace-pre-wrap">{candidate.remarks || "No remarks provided."}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Portfolio</span>
                      {candidate.portfolioUrl ? (
                        <a
                          href={candidate.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-accent hover:text-accent-hover hover:underline break-all"
                        >
                          {candidate.portfolioUrl}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-muted">No portfolio link provided</p>
                      )}
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2 mt-4 border-t border-border pt-4">Resume</span>
                      {candidate.resumeUrl ? (
                        <div className="flex gap-4 items-center">
                          <a
                            href={candidate.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium bg-primary border border-border px-4 py-2 rounded text-light hover:text-accent hover:border-accent transition-colors"
                          >
                            <FileText className="h-4 w-4" /> View Resume
                          </a>
                          <a
                            href={candidate.resumeUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium bg-primary border border-border px-4 py-2 rounded text-light hover:text-accent hover:border-accent transition-colors"
                          >
                            <FileText className="h-4 w-4" /> Download
                          </a>
                          {candidate.resumeFileName && <span className="text-xs text-muted truncate">({candidate.resumeFileName})</span>}
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-muted">No resume uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border bg-primary-lighter flex justify-end shrink-0 rounded-b-lg">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 border border-border rounded-md text-sm font-medium text-light bg-primary hover:bg-border transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
