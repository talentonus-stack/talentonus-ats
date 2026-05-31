"use client"

import { useState } from "react"
import { X, User, Briefcase, FileText, CheckCircle, Clock } from "lucide-react"

type Application = {
  id: string
  status: string
  job: {
    title: string
  }
}

type Candidate = {
  id: string
  firstName: string
  lastName: string | null
  email: string
  phone: string | null
  createdAt: string | Date
  currentLocation: string | null
  experience: string | null
  currentSalary: string | null
  expectedSalary: string | null
  noticePeriod: string | null
  skills: string | null
  remarks: string | null
  resumeUrl: string | null
  resumeFile: string | null
  portfolioUrl: string | null
  applications: Application[]
}

const STAGES = [
  "SUBMITTED",
  "SCREENING",
  "INTERVIEW_SCHEDULED",
  "L1_CLEARED",
  "L2_CLEARED",
  "SELECTED",
  "JOINED"
]

export default function CandidateListingClient({ candidates }: { candidates: Candidate[] }) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

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

  const getStageIndex = (status: string) => {
    return STAGES.indexOf(status)
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-primary-lighter/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Job Applied</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Application Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Submitted On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-primary-lighter">
            {candidates.map((candidate) => {
              const latestApp = candidate.applications[0];
              return (
                <tr key={candidate.id} className="hover:bg-primary/50 transition-colors group">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="text-light group-hover:text-accent hover:underline transition-colors text-left font-semibold focus:outline-none"
                    >
                      {candidate.firstName} {candidate.lastName || ''}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                    <div>{candidate.email}</div>
                    <div>{candidate.phone || 'N/A'}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors">
                    {latestApp ? latestApp.job.title : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {latestApp ? (
                      <span className="inline-flex rounded-full bg-accent/10 px-2 text-xs font-semibold leading-5 text-accent border-accent/20">
                        {latestApp.status.replace(/_/g, ' ')}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                    {new Date(candidate.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={5} className="whitespace-nowrap px-6 py-12 text-sm text-muted text-center">No candidates submitted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-fade-in overflow-y-auto">
          <div className="bg-primary-lighter rounded-2xl shadow-2xl border border-border w-full max-w-4xl flex flex-col relative overflow-hidden my-auto max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 sm:p-8 border-b border-border bg-primary/30">
              <div className="flex gap-4 items-center">
                <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 shadow-[0_0_15px_rgba(170,255,0,0.15)]">
                  <User className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-light">{selectedCandidate.firstName} {selectedCandidate.lastName}</h2>
                  <p className="text-sm text-muted mt-1 flex items-center gap-2">
                    {selectedCandidate.email} {selectedCandidate.phone && `• ${selectedCandidate.phone}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-muted hover:text-light bg-primary/50 hover:bg-primary rounded-full p-2 transition-colors border border-transparent hover:border-border"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-primary">

              {/* Left Column: Details */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-light mb-4 flex items-center gap-2 border-b border-border pb-2">
                    <Briefcase className="h-5 w-5 text-accent" />
                    Professional Profile
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Current Location</span>
                      <p className="text-sm font-medium text-light">{selectedCandidate.currentLocation || "N/A"}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Experience</span>
                      <p className="text-sm font-medium text-light">{selectedCandidate.experience || "N/A"}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Current Salary</span>
                      <p className="text-sm font-medium text-light">{formatSalary(selectedCandidate.currentSalary)}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Expected Salary</span>
                      <p className="text-sm font-medium text-light">{formatSalary(selectedCandidate.expectedSalary)}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Notice Period</span>
                      <p className="text-sm font-medium text-light">{selectedCandidate.noticePeriod || "N/A"}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Portfolio</span>
                      {selectedCandidate.portfolioUrl ? (
                        <a
                          href={selectedCandidate.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-accent hover:text-accent-hover hover:underline truncate block"
                        >
                          {selectedCandidate.portfolioUrl}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-muted">No portfolio link provided</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Resume</span>
                      {selectedCandidate.resumeFile ? (
                        <div className="flex gap-4">
                          <a
                            href={selectedCandidate.resumeFile}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium bg-primary border border-border px-4 py-2 rounded text-light hover:text-accent hover:border-accent transition-colors"
                          >
                            <FileText className="h-4 w-4" /> View Resume
                          </a>
                          <a
                            href={selectedCandidate.resumeFile}
                            download
                            className="inline-flex items-center gap-2 text-sm font-medium bg-primary border border-border px-4 py-2 rounded text-light hover:text-accent hover:border-accent transition-colors"
                          >
                            <FileText className="h-4 w-4" /> Download Resume
                          </a>
                        </div>
                      ) : selectedCandidate.resumeUrl ? (
                        <a
                          href={selectedCandidate.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover hover:underline"
                        >
                          <FileText className="h-4 w-4" /> View Resume Link
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-muted">No resume uploaded</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Skills</span>
                      <p className="text-sm font-medium text-light bg-primary/50 p-2 rounded border border-border">{selectedCandidate.skills || "N/A"}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Remarks</span>
                      <p className="text-sm font-medium text-light bg-primary/50 p-2 rounded border border-border">{selectedCandidate.remarks || "No remarks provided."}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-light mb-4 flex items-center gap-2 border-b border-border pb-2">
                  <Clock className="h-5 w-5 text-accent" />
                  Application Status Timeline
                </h3>

                {selectedCandidate.applications.length > 0 ? (
                  <div className="space-y-6 mt-4">
                    <div className="mb-4">
                      <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Applied For</span>
                      <p className="text-md font-medium text-accent">{selectedCandidate.applications[0].job.title}</p>
                    </div>

                    <div className="relative border-l-2 border-border ml-3 mt-6">
                      {(() => {
                        const currentStatus = selectedCandidate.applications[0].status;
                        const isRejected = currentStatus === "REJECTED";
                        const currentIndex = isRejected ? -1 : getStageIndex(currentStatus);

                        if (isRejected) {
                          return (
                            <div className="mb-8 ml-6 relative">
                              <span className="absolute -left-[35px] flex items-center justify-center w-6 h-6 bg-red-900 rounded-full ring-4 ring-primary">
                                <X className="w-3 h-3 text-red-400" />
                              </span>
                              <h4 className="text-sm font-bold text-red-400">Application Rejected</h4>
                              <p className="text-xs text-muted">This candidate was not selected.</p>
                            </div>
                          )
                        }

                        return STAGES.map((stage, idx) => {
                          const isCompleted = idx < currentIndex;
                          const isCurrent = idx === currentIndex;
                          const isPending = idx > currentIndex;

                          let dotClass = "bg-primary border-2 border-muted";
                          let textClass = "text-muted";
                          let icon = null;

                          if (isCompleted) {
                            dotClass = "bg-accent border-2 border-accent shadow-[0_0_10px_rgba(170,255,0,0.5)]";
                            textClass = "text-light opacity-70";
                            icon = <CheckCircle className="w-3 h-3 text-primary absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />;
                          } else if (isCurrent) {
                            dotClass = "bg-accent border-2 border-accent shadow-[0_0_15px_rgba(170,255,0,0.8)] animate-pulse";
                            textClass = "text-accent font-bold";
                            icon = <div className="w-2 h-2 bg-primary rounded-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>;
                          }

                          return (
                            <div key={stage} className={`mb-8 ml-6 relative ${isPending ? 'opacity-50' : ''}`}>
                              <span className={`absolute -left-[35px] flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-primary ${dotClass}`}>
                                {icon}
                              </span>
                              <h4 className={`text-sm tracking-wide ${textClass}`}>
                                {stage.replace(/_/g, ' ')}
                              </h4>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted">No application data found.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border bg-primary-lighter flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-6 py-2 border border-border rounded-md text-sm font-medium text-light bg-primary hover:bg-border transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
