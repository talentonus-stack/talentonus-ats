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
    <div className="w-full">
      {modalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-primary-lighter border border-border p-6 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-bold text-light mb-4 shrink-0">Candidate Not Yet Joined</h2>
            <div className="text-muted space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <p>This candidate is currently in SELECTED status.</p>
              <p>Please confirm that candidate {modalData.candidateName} has joined at {modalData.companyName} before processing recruiter payment.</p>
              <p>Recruiter payments can only be released after candidate joining confirmation.</p>
            </div>
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-border shrink-0">
              <button
                onClick={() => setModalData({ isOpen: false, companyName: "", applicationId: "", candidateName: "" })}
                className="px-4 py-2 bg-primary border border-border text-light font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push(`/applications?highlight=${modalData.applicationId}`)}
                className="px-4 py-2 bg-accent text-primary font-semibold rounded-lg hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]"
              >
                Go To Application Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card View (<768px) */}
      <div className="block md:hidden space-y-4">
        {placements.map((p) => (
          <div key={p.id} className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-5 flex flex-col gap-4 relative">
            <div className="flex justify-between items-start">
              <div className="pr-4 overflow-hidden">
                <h3 className="text-sm font-bold text-light truncate" title={p.recruiter ? p.recruiter.name || p.recruiter.email : 'N/A'}>{p.recruiter ? p.recruiter.name || p.recruiter.email : 'N/A'}</h3>
                <p className="text-xs font-semibold text-muted mt-0.5 truncate" title={`${p.candidate.firstName} ${p.candidate.lastName}`}>{p.candidate.firstName} {p.candidate.lastName}</p>
              </div>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border shrink-0 ${p.recruiterPaymentStatus === 'PAID' ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-orange-900/20 text-orange-400 border-orange-800/30'}`}>
                {p.recruiterPaymentStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-y border-border/50 py-3">
               <div className="overflow-hidden">
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Company</span>
                  <span className="text-light truncate block" title={p.company.name}>{p.company.name}</span>
               </div>
               <div>
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Payment Date</span>
                  <span className="text-light">{p.recruiterPaidDate ? new Date(p.recruiterPaidDate).toLocaleDateString() : '-'}</span>
               </div>
               <div>
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Total Value</span>
                  <span className="font-medium text-accent">₹{p.placementValue.toLocaleString('en-IN')}</span>
               </div>
               <div>
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Recruiter Share</span>
                  <span className="font-bold text-yellow-400">₹{p.recruiterShare.toLocaleString('en-IN')}</span>
               </div>
            </div>

            <div className="flex items-center justify-end">
              {p.recruiterPaymentStatus === 'PENDING' ? (
                <button
                  onClick={() => handleMarkPaid(p.id)}
                  disabled={isProcessing === p.id}
                  className="px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent text-xs font-bold rounded-lg hover:bg-accent hover:text-primary transition-colors disabled:opacity-50"
                >
                  {isProcessing === p.id ? 'Processing...' : 'Mark as Paid'}
                </button>
              ) : (
                <span className="text-xs text-muted font-semibold">Paid Successfully</span>
              )}
            </div>
          </div>
        ))}
        {placements.length === 0 && (
          <div className="bg-primary-lighter rounded-2xl border border-border p-8 text-center text-sm text-muted">
            No recruiter placements found.
          </div>
        )}
      </div>

      {/* Responsive Table View (≥768px) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="w-full">
          <table className="w-full table-fixed divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="w-[20%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recruiter Name</th>
                <th className="w-[25%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate & Company</th>
                <th className="hidden lg:table-cell w-[12%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Total Value</th>
                <th className="w-[12%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Recruiter Share</th>
                <th className="w-[10%] px-4 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="hidden lg:table-cell w-[10%] px-4 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                <th className="w-[11%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {placements.map((p) => (
                <tr key={p.id} className="hover:bg-primary/50 transition-colors">
                  <td className="px-4 py-4 text-sm font-bold text-light truncate" title={p.recruiter ? p.recruiter.name || p.recruiter.email : 'N/A'}>
                    {p.recruiter ? p.recruiter.name || p.recruiter.email : 'N/A'}
                  </td>
                  <td className="px-4 py-4 overflow-hidden">
                    <div className="text-sm font-bold text-light truncate" title={`${p.candidate.firstName} ${p.candidate.lastName}`}>{p.candidate.firstName} {p.candidate.lastName}</div>
                    <div className="text-xs text-muted mt-1 truncate" title={p.company.name}>{p.company.name}</div>
                  </td>
                  <td className="hidden lg:table-cell px-4 py-4 text-right text-sm text-accent font-bold truncate">₹{p.placementValue.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4 text-right text-sm text-yellow-400 font-bold truncate">₹{p.recruiterShare.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border truncate max-w-full ${p.recruiterPaymentStatus === 'PAID' ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-orange-900/20 text-orange-400 border-orange-800/30'}`} title={p.recruiterPaymentStatus}>
                      {p.recruiterPaymentStatus}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-4 py-4 text-center text-sm text-light truncate">
                    {p.recruiterPaidDate ? new Date(p.recruiterPaidDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {p.recruiterPaymentStatus === 'PENDING' ? (
                      <button
                        onClick={() => handleMarkPaid(p.id)}
                        disabled={isProcessing === p.id}
                        className="px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent text-xs font-bold rounded-lg hover:bg-accent hover:text-primary transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {isProcessing === p.id ? 'Processing...' : 'Mark as Paid'}
                      </button>
                    ) : (
                      <span className="text-xs text-muted font-semibold">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
              {placements.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-sm text-muted text-center">No recruiter placements found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
