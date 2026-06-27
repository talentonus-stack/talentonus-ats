"use client"

import { useState } from "react"
import { formatCreatedDate } from "@/lib/dateUtils"
import { processPasswordReset } from "./actions"

type ResetRequest = {
  id: string
  status: "PENDING" | "COMPLETED"
  createdAt: Date
  updatedAt: Date
  user: { name: string | null; email: string }
}

export default function PasswordResetsClient({ initialRequests }: { initialRequests: ResetRequest[] }) {
  const [requests, setRequests] = useState<ResetRequest[]>(initialRequests)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ResetRequest | null>(null)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const filteredRequests = requests.filter(r => filter === "ALL" || r.status === filter)

  const openModal = (request: ResetRequest) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
    setNewPassword("")
    setConfirmPassword("")
    setError("")
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return
    setError("")

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    const res = await processPasswordReset(selectedRequest.id, newPassword)
    setIsSubmitting(false)

    if (res.success) {
      setRequests(requests.map(r =>
        r.id === selectedRequest.id
          ? { ...r, status: "COMPLETED", updatedAt: new Date() }
          : r
      ))
      setIsModalOpen(false)
    } else {
      setError(res.error || "Failed to reset password.")
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex space-x-2">
        {["ALL", "PENDING", "COMPLETED"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border ${
              filter === f
                ? "bg-accent/10 text-accent border-accent/20"
                : "bg-primary-lighter text-muted border-border hover:bg-primary-lighter/80 hover:text-light"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-primary-lighter/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recruiter</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Requested At</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Processed At</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-primary-lighter">
            {filteredRequests.map((r) => (
              <tr key={r.id} className="hover:bg-primary/50 transition-colors group">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-bold text-light truncate">{r.user.name || "N/A"}</div>
                  <div className="text-xs text-muted mt-1 truncate">{r.user.email}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-light">{formatCreatedDate(r.createdAt)}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${r.status === 'COMPLETED' ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-yellow-900/20 text-yellow-400 border-yellow-800/30'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                  {r.status === 'COMPLETED' ? formatCreatedDate(r.updatedAt) : "-"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  {r.status === "PENDING" && (
                    <button
                      onClick={() => openModal(r)}
                      className="px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-primary text-xs font-bold rounded-lg transition-colors"
                    >
                      Reset Password
                    </button>
                  )}
                  {r.status === "COMPLETED" && (
                    <span className="text-xs text-muted italic">Resolved</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan={5} className="whitespace-nowrap px-6 py-12 text-sm text-muted text-center">No password reset requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-primary-lighter border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border/50 shrink-0">
              <h3 className="text-lg font-bold text-light">Reset Password</h3>
              <p className="text-xs text-muted mt-1">For {selectedRequest.user.email}</p>
            </div>
            <div className="px-6 py-6 overflow-y-auto flex-1">
              {error && <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm text-center">{error}</div>}
              <form id="reset-form" onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  />
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-border/50 shrink-0 bg-primary/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-bold rounded-lg border border-border bg-primary text-light hover:text-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="reset-form"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-accent text-primary hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Resetting..." : "Confirm Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
