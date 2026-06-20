"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { markRecruiterPaid } from "./actions"

export default function RecruiterPaymentsClient({ placements }: { placements: any[] }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [modalData, setModalData] = useState<{ isOpen: boolean, companyName: string, applicationId: string, candidateName: string }>({ isOpen: false, companyName: "", applicationId: "", candidateName: "" })
  const router = useRouter()

  const handleMarkPaid = async (id: string) => {
    setIsProcessing(id)
    try {
      const res = await markRecruiterPaid(id)
      if (res?.error === "NOT_JOINED") {
        setModalData({ isOpen: true, companyName: res.companyName!, applicationId: res.applicationId!, candidateName: res.candidateName! })
      }
    } catch (e: any) {
      alert(e.message || "Failed to mark as paid")
    } finally {
      setIsProcessing(null)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
      {modalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-primary-lighter border border-border p-6 rounded-2xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold text-light mb-4">Candidate Not Yet Joined</h2>
            <div className="text-muted mb-6 space-y-4">
              <p>This candidate is currently in SELECTED status.</p>
              <p>Please confirm that candidate {modalData.candidateName} has joined at {modalData.companyName} before processing recruiter payment.</p>
              <p>Recruiter payments can only be released after candidate joining confirmation.</p>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setModalData({ isOpen: false, companyName: "", applicationId: "", candidateName: "" })}
                className="px-4 py-2 bg-primary border border-border text-light font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push(`/applications?highlight=${modalData.applicationId}`)}
                className="px-4 py-2 bg-[#F4A340] text-white font-semibold rounded-lg hover:bg-[#E8952C] transition-colors shadow-md hover:shadow-lg"
              >
                Go To Application Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-primary-lighter/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recruiter Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate & Company</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Placement Value</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Recruiter Share</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Payment Status</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Payment Date</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {placements.map((p) => (
              <tr key={p.id} className="hover:bg-primary/50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-light">
                  {p.recruiter ? p.recruiter.name || p.recruiter.email : 'N/A'}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-bold text-light">{p.candidate.firstName} {p.candidate.lastName}</div>
                  <div className="text-xs text-muted mt-1">{p.company.name}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-accent font-bold">₹{p.placementValue.toLocaleString('en-IN')}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-yellow-400 font-bold">₹{p.recruiterShare.toLocaleString('en-IN')}</td>
                <td className="whitespace-nowrap px-6 py-4 text-center">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border ${p.recruiterPaymentStatus === 'PAID' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
                    {p.recruiterPaymentStatus}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-light">
                  {p.recruiterPaidDate ? new Date(p.recruiterPaidDate).toLocaleDateString() : '-'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  {p.recruiterPaymentStatus === 'PENDING' ? (
                    <button
                      onClick={() => handleMarkPaid(p.id)}
                      disabled={isProcessing === p.id}
                      className="px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent text-xs font-bold rounded-lg hover:bg-accent hover:text-primary transition-colors disabled:opacity-50"
                    >
                      {isProcessing === p.id ? 'Processing...' : 'Mark as Paid'}
                    </button>
                  ) : (
                    <span className="text-xs text-muted">Paid</span>
                  )}
                </td>
              </tr>
            ))}
            {placements.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-sm text-muted text-center">No recruiter placements found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
