"use client"

import { useState } from "react"
import { markRecruiterPaid } from "./actions"

export default function RecruiterPaymentsClient({ placements }: { placements: any[] }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const handleMarkPaid = async (id: string) => {
    setIsProcessing(id)
    try {
      await markRecruiterPaid(id)
    } catch (e) {
      alert("Failed to mark as paid")
    } finally {
      setIsProcessing(null)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
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
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border ${p.recruiterPaymentStatus === 'PAID' ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-orange-900/20 text-orange-400 border-orange-800/30'}`}>
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
