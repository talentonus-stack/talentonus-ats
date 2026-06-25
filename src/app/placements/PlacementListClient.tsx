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
    <div className="w-full">
      {/* Mobile Card View (<768px) */}
      <div className="block md:hidden space-y-4">
        {placements.map((p) => (
          <div key={p.id} className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-5 flex flex-col gap-4 relative">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-light">{p.candidateName}</h3>
                <p className="text-xs text-muted mt-0.5">{p.jobTitle}</p>
                <p className="text-xs font-semibold text-light mt-1.5">{p.companyName}</p>
              </div>
              <button
                onClick={() => deletePlacement(p.id)}
                className="text-muted hover:text-red-500 transition-colors p-2 -mt-2 -mr-2"
                title="Delete Placement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-y border-border/50 py-3">
               <div>
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Recruiter</span>
                  <span className="text-light">{p.recruiterName}</span>
               </div>
               <div>
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Offered CTC</span>
                  <span className="font-medium text-accent">₹{(p.offeredCTC).toLocaleString('en-IN')}</span>
               </div>
               <div>
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Total Value</span>
                  <span className="font-medium text-light">₹{(p.placementValue).toLocaleString('en-IN')}</span>
               </div>
               <div>
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Our Share</span>
                  <span className="font-bold text-accent">₹{(p.talentonusShare).toLocaleString('en-IN')}</span>
               </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Expected DOJ</span>
                <span className="text-xs text-light font-medium">
                  {p.expectedJoiningDate ? new Date(p.expectedJoiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                </span>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border
                ${p.status === 'SELECTED' ? 'bg-blue-900/20 text-blue-400 border-blue-800/30' : ''}
                ${p.status === 'JOINED' ? 'bg-accent/10 text-accent border-accent/20' : ''}
                ${p.status === 'INVOICE_GENERATED' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800/30' : ''}
                ${p.status === 'INVOICE_PAID' ? 'bg-green-900/20 text-green-400 border-green-800/30' : ''}
                ${p.status === 'RECRUITER_PAID' ? 'bg-purple-900/20 text-purple-400 border-purple-800/30' : ''}
              `}>
                {p.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
        {placements.length === 0 && (
          <div className="bg-primary-lighter rounded-2xl border border-border p-8 text-center text-sm text-muted">
            No placements recorded yet.
          </div>
        )}
      </div>

      {/* Responsive Table View (≥768px) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="w-full">
          <table className="w-full table-fixed divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="w-[20%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate / Job</th>
                <th className="w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Company</th>
                <th className="w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recruiter</th>
                <th className="w-[10%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Offered CTC</th>
                {/* Hide secondary info on tablets (md), show on laptops+ (lg) */}
                <th className="hidden lg:table-cell w-[10%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">DOJ</th>
                <th className="hidden lg:table-cell w-[10%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Our Share</th>
                <th className="w-[12%] px-4 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="w-[8%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {placements.map((p) => (
                <tr key={p.id} className="hover:bg-primary/50 transition-colors group">
                  <td className="px-4 py-4 overflow-hidden">
                    <div className="text-sm font-bold text-light group-hover:text-accent transition-colors truncate" title={p.candidateName}>
                      {p.candidateName}
                    </div>
                    <div className="text-xs text-muted mt-1 truncate" title={p.jobTitle}>{p.jobTitle}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-light font-medium truncate" title={p.companyName}>{p.companyName}</td>
                  <td className="px-4 py-4 text-sm text-muted truncate" title={p.recruiterName}>{p.recruiterName}</td>
                  <td className="px-4 py-4 text-right text-sm text-light font-medium truncate">₹{(p.offeredCTC).toLocaleString('en-IN')}</td>

                  <td className="hidden lg:table-cell px-4 py-4 text-right text-sm text-muted truncate">
                    {p.expectedJoiningDate ? new Date(p.expectedJoiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-4 text-right text-sm text-light font-bold truncate">₹{(p.talentonusShare).toLocaleString('en-IN')}</td>

                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border truncate max-w-full
                      ${p.status === 'SELECTED' ? 'bg-blue-900/20 text-blue-400 border-blue-800/30' : ''}
                      ${p.status === 'JOINED' ? 'bg-accent/10 text-accent border-accent/20' : ''}
                      ${p.status === 'INVOICE_GENERATED' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800/30' : ''}
                      ${p.status === 'INVOICE_PAID' ? 'bg-green-900/20 text-green-400 border-green-800/30' : ''}
                      ${p.status === 'RECRUITER_PAID' ? 'bg-purple-900/20 text-purple-400 border-purple-800/30' : ''}
                    `} title={p.status.replace('_', ' ')}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium">
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
                  <td colSpan={8} className="px-4 py-12 text-sm text-muted text-center">
                    No placements recorded yet. Move a candidate to "SELECTED" status to create a placement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
