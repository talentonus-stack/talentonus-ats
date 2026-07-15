"use client"

import { useState } from "react"
import { CheckCircle, X, Key, AlertTriangle } from "lucide-react"

type ResetRequest = {
  id: string
  userId: string
  recruiterName: string
  email: string
  requestDate: Date
  status: "PENDING" | "COMPLETED"
}

export default function PasswordResetListClient({ initialRequests }: { initialRequests: ResetRequest[] }) {
  const [requests, setRequests] = useState<ResetRequest[]>(initialRequests)

  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ResetRequest | null>(null)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [statusMsg, setStatusMsg] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const openResetModal = (req: ResetRequest) => {
    setSelectedRequest(req)
    setNewPassword("")
    setConfirmPassword("")
    setStatusMsg("")
    setIsResetModalOpen(true)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return

    if (newPassword !== confirmPassword) {
      setStatusMsg("Passwords do not match.")
      return
    }
    if (newPassword.length < 6) {
      setStatusMsg("Password must be at least 6 characters.")
      return
    }

    setIsSaving(true)
    setStatusMsg("")

    try {
      const res = await fetch(`/api/password-resets/${selectedRequest.id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword, userId: selectedRequest.userId })
      })

      if (!res.ok) throw new Error("Failed to reset password")

      setStatusMsg("success: Password updated successfully!")

      // Update local state to COMPLETED
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: "COMPLETED" } : r))

      setTimeout(() => {
        setIsResetModalOpen(false)
      }, 1500)
    } catch (err: any) {
      setStatusMsg(`error: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const markCompleted = async (id: string) => {
    try {
      const res = await fetch(`/api/password-resets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" })
      })

      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "COMPLETED" } : r))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recruiter</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-primary/50 transition-colors group">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-light">
                    {req.recruiterName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                    {req.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                    {new Date(req.requestDate).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${req.status === 'COMPLETED' ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-orange-900/20 text-orange-400 border-orange-800/30'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    {req.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => markCompleted(req.id)}
                          className="text-xs text-muted hover:text-green-400 transition-colors"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => openResetModal(req)}
                          className="px-3 py-1 rounded bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-primary transition-colors text-xs font-bold"
                        >
                          Reset Password
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-sm text-muted text-center">No password reset requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isResetModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-primary-lighter border border-border rounded-2xl w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-light transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-light flex items-center gap-2">
                <Key className="w-5 h-5 text-accent" /> Reset Recruiter Password
              </h2>
              <p className="text-sm text-muted mt-1">For {selectedRequest.recruiterName} ({selectedRequest.email})</p>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-5">
              {statusMsg && (
                <div className={`p-3 rounded-lg text-sm font-bold flex items-start gap-2 ${statusMsg.startsWith('success:') ? 'bg-green-900/20 border border-green-800 text-green-400' : 'bg-red-900/20 border border-red-800 text-red-400'}`}>
                  {statusMsg.startsWith('success:') ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                  {statusMsg.replace('success:', '').replace('error:', '')}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-muted hover:text-light transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-accent px-4 py-2 text-primary text-sm font-bold hover:bg-accent-hover transition-all duration-200 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
