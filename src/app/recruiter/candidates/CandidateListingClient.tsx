"use client"

import { useState, useEffect, Suspense } from "react"
import { X, User, Briefcase, FileText, CheckCircle, Clock, Eye, Edit2, AlertCircle } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

type Application = {
  id: string
  status: string
  statusChangeReason?: string | null
  job: {
    title: string
  }
  placement?: {
    expectedJoiningDate: string | Date | null
  } | null
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
  resumeFileName: string | null
  portfolioUrl: string | null
  applications: Application[]
  updateRequests?: any[]
}

const STAGES = [
  "SUBMITTED",
  "SCREENING",
  "L1_SCHEDULED",
  "L1_CLEARED",
  "L2_SCHEDULED",
  "L2_CLEARED",
  "FINAL_ROUND_SCHEDULED",
  "SELECTED",
  "JOINED"
]

function CandidateListingInner({ candidates }: { candidates: Candidate[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const candidateIdQuery = searchParams.get("candidateId")

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [resolvingRequestId, setResolvingRequestId] = useState<string | null>(null)
  const [responseTextMap, setResponseTextMap] = useState<Record<string, string>>({})
  const [resolveError, setResolveError] = useState<Record<string, string>>({})

  // Handle deep linking to a candidate via URL
  useEffect(() => {
    if (candidateIdQuery) {
      const candidate = candidates.find(c => c.id === candidateIdQuery)
      if (candidate) {
        setSelectedCandidate(candidate)
      }
    }
  }, [candidateIdQuery, candidates])

  useEffect(() => {
    if (selectedCandidate) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selectedCandidate])


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

  const handleResolveRequest = async (requestId: string) => {
    const responseText = responseTextMap[requestId] || ""
    if (!responseText.trim()) {
      setResolveError(prev => ({ ...prev, [requestId]: "Please enter your update/response." }))
      return
    }

    setResolvingRequestId(requestId)
    setResolveError(prev => ({ ...prev, [requestId]: "" }))

    try {
      const res = await fetch(`/api/candidate-requests/${requestId}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseText: responseText.trim() })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit update.")
      }

      // Success
      setResponseTextMap(prev => ({ ...prev, [requestId]: "" }))

      // Update local state temporarily to hide the request, while waiting for router.refresh
      if (selectedCandidate) {
        const updatedCandidate = {
          ...selectedCandidate,
          updateRequests: selectedCandidate.updateRequests?.filter(req => req.id !== requestId) || []
        }
        setSelectedCandidate(updatedCandidate)
      }

      router.refresh()
    } catch (err: any) {
      setResolveError(prev => ({ ...prev, [requestId]: err.message || "An unexpected error occurred." }))
    } finally {
      setResolvingRequestId(null)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="w-full">
          <table className="w-full table-fixed divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="w-[15%] px-4 xl:px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                <th className="w-[20%] px-4 xl:px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Contact</th>
                <th className="w-[20%] px-4 xl:px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Job Applied</th>
                <th className="w-[15%] px-4 xl:px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Application Status</th>
                <th className="w-[10%] px-4 xl:px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Expected DOJ</th>
                <th className="w-[10%] px-4 xl:px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Submitted</th>
                <th className="w-[10%] px-4 xl:px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-primary-lighter">
              {candidates.map((candidate) => {
                const latestApp = candidate.applications[0];
                const expectedDOJ = latestApp?.placement?.expectedJoiningDate ? new Date(latestApp.placement.expectedJoiningDate).toLocaleDateString() : null;

                return (
                  <tr key={candidate.id} className="hover:bg-primary/50 transition-colors group">
                    <td className="px-4 xl:px-6 py-4 overflow-hidden">
                      <button
                        onClick={() => setSelectedCandidate(candidate)}
                        className="text-light group-hover:text-accent hover:underline transition-colors text-left focus:outline-none flex flex-col"
                      >
                        <span className="text-sm font-semibold truncate w-full" title={candidate.firstName}>{candidate.firstName}</span>
                        {candidate.lastName && <span className="text-xs text-muted truncate w-full" title={candidate.lastName}>{candidate.lastName}</span>}
                      </button>
                    </td>
                    <td className="px-4 xl:px-6 py-4 overflow-hidden">
                      <div className="text-sm text-muted truncate" title={candidate.email}>{candidate.email}</div>
                      <div className="text-xs text-muted truncate mt-0.5" title={candidate.phone || 'N/A'}>{candidate.phone || 'N/A'}</div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 overflow-hidden">
                      <div className="text-sm font-medium text-light group-hover:text-accent transition-colors truncate" title={latestApp ? latestApp.job.title : 'N/A'}>
                        {latestApp ? latestApp.job.title : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 overflow-hidden">
                      {latestApp ? (
                        <span className="inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase leading-tight text-accent border border-accent/20 truncate">
                          {latestApp.status === "L1_SCHEDULED" ? "L1 Schedule" : latestApp.status === "L2_SCHEDULED" ? "L2 Schedule" : latestApp.status === "FINAL_ROUND_SCHEDULED" ? "Final Round Schedule" : latestApp.status.replace(/_/g, ' ')}
                        </span>
                      ) : <span className="text-sm text-muted">N/A</span>}
                    </td>
                    <td className="px-4 xl:px-6 py-4 text-sm font-medium text-light overflow-hidden">
                      {latestApp && ['SELECTED', 'JOINED'].includes(latestApp.status) && expectedDOJ ? <span className="truncate">{expectedDOJ}</span> : <span className="text-muted">—</span>}
                    </td>
                    <td className="px-4 xl:px-6 py-4 text-sm text-muted overflow-hidden">
                      <span className="truncate">{new Date(candidate.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-4 xl:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setSelectedCandidate(candidate)}
                          className="text-muted hover:text-accent transition-colors focus:outline-none p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`/recruiter/candidates/${candidate.id}/edit`}
                          className="text-muted hover:text-accent transition-colors p-1"
                          title="Edit Candidate"
                        >
                          <Edit2 className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {candidates.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-sm text-muted text-center">No candidates submitted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 pt-12 sm:pt-16 animate-fade-in">
          <div className="bg-primary-lighter rounded-2xl shadow-2xl border border-border w-full max-w-3xl flex flex-col relative overflow-hidden max-h-[85vh]">

            {/* Modal Header */}
            <div className="flex justify-between items-start p-4 sm:p-6 border-b border-border bg-primary/30 shrink-0">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 shadow-[0_0_10px_rgba(170,255,0,0.15)]">
                  <User className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-light">{selectedCandidate.firstName} {selectedCandidate.lastName}</h2>
                  <p className="text-xs text-muted mt-0.5 flex items-center gap-2">
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
            <div className="flex-1 overflow-y-auto bg-primary custom-scrollbar">

              {/* Candidate Update Requests Section */}
              {selectedCandidate.updateRequests && selectedCandidate.updateRequests.length > 0 && (
                <div className="p-4 sm:p-6 bg-orange-900/5 border-b border-orange-900/20">
                  <div className="inline-flex items-center gap-1.5 bg-orange-900/20 text-orange-400 border border-orange-800/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                    <AlertCircle className="h-3 w-3" />
                    Pending Action Required
                  </div>
                  <div className="space-y-4">
                    {selectedCandidate.updateRequests.map((req) => (
                      <div key={req.id} className="bg-primary-lighter rounded-md border border-orange-900/30 p-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                        <div className="flex justify-between items-start mb-2 pl-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted">Requested by {req.requestedBy?.name || 'Admin'}</span>
                            <span className="text-[10px] text-muted">•</span>
                            <span className={`text-[10px] font-bold tracking-wider uppercase ${req.priority === 'HIGH' ? 'text-red-400' : 'text-muted'}`}>
                              {req.priority === 'HIGH' ? 'High' : 'Normal'}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted">{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-light mb-3 pl-2 whitespace-pre-wrap">{req.requestText}</p>

                        <div className="pl-2">
                          {resolveError[req.id] && (
                            <p className="text-xs text-red-400 mb-2 font-medium">{resolveError[req.id]}</p>
                          )}
                          <textarea
                            value={responseTextMap[req.id] || ""}
                            onChange={(e) => setResponseTextMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                            placeholder="Type your response/update here..."
                            rows={2}
                            disabled={resolvingRequestId === req.id}
                            className="w-full bg-primary border border-border rounded-md px-3 py-2 text-sm text-light placeholder-muted/50 focus:border-accent focus:ring-1 focus:ring-accent transition-colors disabled:opacity-50"
                          />
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => handleResolveRequest(req.id)}
                              disabled={resolvingRequestId === req.id || !(responseTextMap[req.id] || "").trim()}
                              className="px-3 py-1.5 bg-accent text-primary text-xs font-bold rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50"
                            >
                              {resolvingRequestId === req.id ? "Submitting..." : "Confirm Update"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-light mb-3 flex items-center gap-2 border-b border-border pb-2">
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
                      {selectedCandidate.resumeUrl ? (
                        <div className="flex gap-4 items-center">
                          <a
                            href={selectedCandidate.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium bg-primary border border-border px-4 py-2 rounded text-light hover:text-accent hover:border-accent transition-colors"
                          >
                            <FileText className="h-4 w-4" /> View Resume
                          </a>
                          <a
                            href={selectedCandidate.resumeUrl}
                            download
                            className="inline-flex items-center gap-2 text-sm font-medium bg-primary border border-border px-4 py-2 rounded text-light hover:text-accent hover:border-accent transition-colors"
                          >
                            <FileText className="h-4 w-4" /> Download Resume
                          </a>
                          {selectedCandidate.resumeFileName && <span className="text-xs text-muted">({selectedCandidate.resumeFileName})</span>}
                        </div>
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
                <h3 className="text-base font-semibold text-light mb-3 flex items-center gap-2 border-b border-border pb-2">
                  <Clock className="h-5 w-5 text-accent" />
                  Application Status Timeline
                </h3>

                {selectedCandidate.applications.length > 0 ? (
                  <div className="space-y-4 mt-3">
                    <div className="mb-3">
                      <span className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Applied For</span>
                      <p className="text-sm font-medium text-accent">{selectedCandidate.applications[0].job.title}</p>
                    </div>

                    <div className="relative border-l border-border ml-2 mt-4">
                      {(() => {
                        const application = selectedCandidate.applications[0];
                        const currentStatus = application.status;
                        const isRejected = currentStatus === "REJECTED";
                        const isBackedOut = currentStatus === "BACKED_OUT";
                        const currentIndex = (isRejected || isBackedOut) ? -1 : getStageIndex(currentStatus);

                        if (isRejected || isBackedOut) {
                          return (
                            <div className="mb-8 ml-6 relative">
                              <span className="absolute -left-[35px] flex items-center justify-center w-6 h-6 bg-red-900 rounded-full ring-4 ring-primary">
                                <X className="w-3 h-3 text-red-400" />
                              </span>
                              <h4 className="text-sm font-bold text-red-400">Application {isRejected ? 'Rejected' : 'Backed Out'}</h4>
                              <p className="text-xs text-muted whitespace-pre-wrap">{application.statusChangeReason || (isRejected ? 'This candidate was not selected.' : 'This candidate has backed out.')}</p>
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
                                {stage === "L1_SCHEDULED" ? "L1 Schedule" : stage === "L2_SCHEDULED" ? "L2 Schedule" : stage === "FINAL_ROUND_SCHEDULED" ? "Final Round Schedule" : stage.replace(/_/g, ' ')}
                              </h4>
                              {stage === 'SELECTED' && isCompleted && selectedCandidate.applications[0].placement?.expectedJoiningDate && (
                                <p className="text-xs mt-1 text-muted">
                                  Expected DOJ: <span className="font-medium text-light">{new Date(selectedCandidate.applications[0].placement.expectedJoiningDate).toLocaleDateString()}</span>
                                </p>
                              )}
                              {stage === 'SELECTED' && isCurrent && selectedCandidate.applications[0].placement?.expectedJoiningDate && (
                                <p className="text-xs mt-1 text-accent">
                                  Expected DOJ: <span className="font-bold">{new Date(selectedCandidate.applications[0].placement.expectedJoiningDate).toLocaleDateString()}</span>
                                </p>
                              )}
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
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-border bg-primary-lighter flex justify-end shrink-0">
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

export default function CandidateListingClient({ candidates }: { candidates: Candidate[] }) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted">Loading candidates...</div>}>
      <CandidateListingInner candidates={candidates} />
    </Suspense>
  )
}
