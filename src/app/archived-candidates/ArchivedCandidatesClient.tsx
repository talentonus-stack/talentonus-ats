"use client"

import { useState } from "react"
import { ArchiveRestore, Eye } from "lucide-react"
import Link from "next/link"
import { restoreCandidate } from "./actions"

export default function ArchivedCandidatesClient({ candidates: initialCandidates }: { candidates: any[] }) {
  const [candidates, setCandidates] = useState(initialCandidates)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const handleRestore = async (id: string) => {
    setIsProcessing(id)
    try {
      const res = await restoreCandidate(id)
      if (res.success) {
        setCandidates(candidates.filter(c => c.id !== id))
        alert("Candidate restored successfully.")
      } else {
        alert(res.error || "Failed to restore candidate")
      }
    } catch(e: any) {
       alert(e.message || "Failed to restore candidate")
    } finally {
      setIsProcessing(null)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-primary-lighter/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Applied Position</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recruiter</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Submitted Date</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-primary-lighter">
            {candidates.map(c => {
               const latestApp = c.applications?.[0]
               return (
                <tr key={c.id} className="hover:bg-primary/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className="text-sm font-semibold text-light">{c.firstName} {c.lastName || ''}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm text-muted truncate max-w-[200px]" title={c.email}>{c.email}</div>
                     <div className="text-xs text-muted truncate max-w-[200px]" title={c.phone || 'N/A'}>{c.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light font-medium">
                     {latestApp?.job?.title || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                     {c.recruiter?.name || 'Admin (Direct)'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                     {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                     <div className="flex items-center justify-end gap-3">
                       <Link href={`/candidates/${c.id}`} className="p-2 text-muted hover:text-accent transition-colors" title="View Details">
                         <Eye className="w-4 h-4" />
                       </Link>
                       <button
                         onClick={() => handleRestore(c.id)}
                         disabled={isProcessing === c.id}
                         className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent text-xs font-bold rounded-lg hover:bg-accent hover:text-primary transition-colors disabled:opacity-50"
                         title="Restore to Active"
                       >
                         <ArchiveRestore className="w-4 h-4" />
                         {isProcessing === c.id ? 'Restoring...' : 'Restore'}
                       </button>
                     </div>
                  </td>
                </tr>
               )
            })}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted">No archived candidates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
