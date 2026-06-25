"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

type Placement = {
  id: string
  candidateName: string
  jobTitle: string
  companyName: string
  recruiterName: string
  offeredCTC: number
  expectedJoiningDate: Date | null
  placementValue: number
  talentonusShare: number
  status: string
}

export default function PlacementListClient({ initialPlacements }: { initialPlacements: Placement[] }) {
  const [placements, setPlacements] = useState<Placement[]>(initialPlacements)

  const deletePlacement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this placement? The candidate's application status will be reverted to BACKED_OUT.")) return;
    try {
      const res = await fetch(`/api/placements/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setPlacements(prev => prev.filter(p => p.id !== id))
      } else {
        const error = await res.json()
        alert(error.error || "Failed to delete placement")
      }
    } catch (err) {
      console.error("Failed to delete placement", err)
      alert("Failed to delete placement")
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-primary-lighter/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate / Job</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Company</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recruiter</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Offered CTC</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Expected DOJ</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Total Value</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Our Share</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {placements.map((p) => (
              <tr key={p.id} className="hover:bg-primary/50 transition-colors group">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-bold text-light group-hover:text-accent transition-colors">
                    {p.candidateName}
                  </div>
                  <div className="text-xs text-muted mt-1">{p.jobTitle}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-light font-medium">{p.companyName}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{p.recruiterName}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-light font-medium">₹{(p.offeredCTC).toLocaleString('en-IN')}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-muted">
                  {p.expectedJoiningDate ? new Date(p.expectedJoiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-accent font-bold">₹{(p.placementValue).toLocaleString('en-IN')}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-light font-bold">₹{(p.talentonusShare).toLocaleString('en-IN')}</td>
                <td className="whitespace-nowrap px-6 py-4 text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border
                    ${p.status === 'SELECTED' ? 'bg-blue-900/20 text-blue-400 border-blue-800/30' : ''}
                    ${p.status === 'JOINED' ? 'bg-accent/10 text-accent border-accent/20' : ''}
                    ${p.status === 'INVOICE_GENERATED' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800/30' : ''}
                    ${p.status === 'INVOICE_PAID' ? 'bg-green-900/20 text-green-400 border-green-800/30' : ''}
                    ${p.status === 'RECRUITER_PAID' ? 'bg-purple-900/20 text-purple-400 border-purple-800/30' : ''}
                  `}>
                    {p.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => deletePlacement(p.id)}
                      className="text-muted hover:text-red-500 transition-colors p-1"
                      title="Delete Placement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {placements.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-sm text-muted text-center">
                  No placements recorded yet. Move a candidate to "SELECTED" status to create a placement.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
