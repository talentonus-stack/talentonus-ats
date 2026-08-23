"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const PIPELINE_STATUSES = [
  "SUBMITTED",
  "SCREENING",
  "L1_SCHEDULED",
  "L1_CLEARED",
  "L2_SCHEDULED",
  "L2_CLEARED",
  "FINAL_ROUND_SCHEDULED",
  "SELECTED",
  "REJECTED",
  "JOINED",
  "BACKED_OUT"
]

type Application = {
  id: string
  status: string
  candidate: { firstName: string; lastName: string | null }
  job: { title: string }
}

export default function KanbanBoard({ initialApplications }: { initialApplications: Application[] }) {
  const [applications, setApplications] = useState(initialApplications)
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  const [selectedModalState, setSelectedModalState] = useState<{ appId: string, show: boolean }>({ appId: '', show: false })
  const [modalForm, setModalForm] = useState({ offeredCTC: '', expectedJoiningDate: '' })

  const [reasonModalState, setReasonModalState] = useState<{ appId: string, show: boolean, status: 'REJECTED' | 'BACKED_OUT', candidateName: string }>({ appId: '', show: false, status: 'REJECTED', candidateName: '' })
  const [reasonForm, setReasonForm] = useState({ reason: '' })
  const router = useRouter()

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleStatusChange = async (appId: string, newStatus: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    if (newStatus === 'SELECTED') {
      setSelectedModalState({ appId, show: true })
      setModalForm({ offeredCTC: '', expectedJoiningDate: '' })
      return
    }

    if (newStatus === 'REJECTED' || newStatus === 'BACKED_OUT') {
      setReasonModalState({ appId, show: true, status: newStatus as 'REJECTED' | 'BACKED_OUT', candidateName: `${app.candidate.firstName} ${app.candidate.lastName || ''}`.trim() })
      setReasonForm({ reason: '' })
      return
    }

    await performStatusUpdate(appId, newStatus)
  }

  const performStatusUpdate = async (appId: string, newStatus: string, payload?: { offeredCTC?: number, expectedJoiningDate?: string, statusChangeReason?: string }) => {
    // Save previous state for rollback
    const previousApplications = [...applications]

    // Optimistic update
    setApplications(prev =>
      prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
    )

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...payload })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update status")
      }

      showToast(`Status successfully updated to ${newStatus.replace('_', ' ')}`, 'success')
      router.refresh()
    } catch(e: any) {
      console.error("Status Update Error:", e)
      // Rollback optimistic update
      setApplications(previousApplications)
      showToast(e.message || "Failed to update status. Changes reverted.", 'error')
    }
  }

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const offeredCTC = parseFloat(modalForm.offeredCTC)
    if (isNaN(offeredCTC) || !modalForm.expectedJoiningDate) {
      alert("Both Final Offered CTC and Expected Joining Date are required.")
      return
    }

    const { appId } = selectedModalState
    setSelectedModalState({ appId: '', show: false })
    await performStatusUpdate(appId, 'SELECTED', {
      offeredCTC,
      expectedJoiningDate: new Date(modalForm.expectedJoiningDate).toISOString()
    })
  }

  const handleModalCancel = () => {
    setSelectedModalState({ appId: '', show: false })
    setApplications([...applications])
  }

  const handleReasonModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const reason = reasonForm.reason.trim();
    if (!reason) {
      alert("A reason is required.");
      return;
    }

    const { appId, status } = reasonModalState
    setReasonModalState({ appId: '', show: false, status: 'REJECTED', candidateName: '' })

    await performStatusUpdate(appId, status, { statusChangeReason: reason })
  }

  const handleReasonModalCancel = () => {
    setReasonModalState({ appId: '', show: false, status: 'REJECTED', candidateName: '' })
    setApplications([...applications])
  }

  return (
    <div className="relative">
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl border font-bold text-sm transition-all animate-fade-in ${
          toastMessage.type === 'success'
            ? 'bg-green-900/20 text-green-400 border-green-500/50'
            : 'bg-red-900/20 text-red-400 border-red-500/50'
        }`}>
          {toastMessage.text}
        </div>
      )}

      <div className="flex h-[calc(100vh-12rem)] space-x-4 overflow-x-auto pb-4 custom-scrollbar">
        {selectedModalState.show && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 p-4 bg-black/50" style={{ backdropFilter: 'blur(4px)' }}>
            <div className="bg-primary border border-border rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[calc(100vh-96px)]">
              <div className="p-6 border-b border-border shrink-0">
                <h3 className="text-xl font-bold text-light">Candidate Selected</h3>
                <p className="text-sm text-muted mt-1">Please provide the final offer details to proceed.</p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <form id="selected-form" onSubmit={handleModalSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-light mb-1">Final Offered CTC</label>
                    <input
                      type="number"
                      required
                      value={modalForm.offeredCTC}
                      onChange={(e) => setModalForm(prev => ({ ...prev, offeredCTC: e.target.value }))}
                      className="w-full rounded-md border border-border bg-primary-lighter px-3 py-2 text-sm text-light focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="e.g. 1500000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light mb-1">Expected Joining Date</label>
                    <input
                      type="date"
                      required
                      value={modalForm.expectedJoiningDate}
                      onChange={(e) => setModalForm(prev => ({ ...prev, expectedJoiningDate: e.target.value }))}
                      className="w-full rounded-md border border-border bg-primary-lighter px-3 py-2 text-sm text-light focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-border bg-primary-lighter flex justify-end gap-3 shrink-0 rounded-b-xl">
                <button
                  type="button"
                  onClick={handleModalCancel}
                  className="px-4 py-2 border border-border rounded-md text-sm font-medium text-light bg-primary hover:bg-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="selected-form"
                  className="px-4 py-2 bg-accent text-primary rounded-md text-sm font-bold hover:bg-accent-hover transition-colors"
                >
                  Confirm Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {reasonModalState.show && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 p-4 bg-black/50" style={{ backdropFilter: 'blur(4px)' }}>
            <div className="bg-primary border border-border rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[calc(100vh-96px)]">
              <div className="p-6 border-b border-border shrink-0">
                <h3 className="text-xl font-bold text-light">{reasonModalState.status === 'REJECTED' ? 'Reject Candidate' : 'Back Out Candidate'}</h3>
                <p className="text-sm text-accent font-medium mt-2">{reasonModalState.candidateName}</p>
                <p className="text-sm text-muted mt-1">Please provide a reason for {reasonModalState.status === 'REJECTED' ? 'rejecting' : 'backing out'} this candidate.</p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <form id="reason-form" onSubmit={handleReasonModalSubmit} className="space-y-4">
                  <div>
                    <textarea
                      required
                      value={reasonForm.reason}
                      onChange={(e) => setReasonForm({ reason: e.target.value })}
                      className="w-full rounded-md border border-border bg-primary-lighter px-3 py-2 text-sm text-light focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[100px] resize-y custom-scrollbar"
                      placeholder={`Enter ${reasonModalState.status === 'REJECTED' ? 'rejection' : 'back out'} reason...`}
                    />
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-border bg-primary-lighter flex justify-end gap-3 shrink-0 rounded-b-xl">
                <button
                  type="button"
                  onClick={handleReasonModalCancel}
                  className="px-4 py-2 border border-border rounded-md text-sm font-medium text-light bg-primary hover:bg-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="reason-form"
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700 transition-colors"
                >
                  {reasonModalState.status === 'REJECTED' ? 'Reject Candidate' : 'Back Out Candidate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {PIPELINE_STATUSES.map(status => (
          <div key={status} className="flex w-80 flex-shrink-0 flex-col rounded-2xl bg-primary-lighter border border-border p-4 shadow-sm">
            <h3 className="mb-4 text-xs font-bold text-muted uppercase tracking-wider border-b border-border pb-2">{status === "L1_SCHEDULED" ? "L1 Schedule" : status === "L2_SCHEDULED" ? "L2 Schedule" : status === "FINAL_ROUND_SCHEDULED" ? "Final Round Schedule" : status.replace(/_/g, ' ')}</h3>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
              {applications.filter(app => app.status === status).map(app => (
                <div key={app.id} className="rounded-xl bg-primary border border-border hover:border-accent/50 transition-colors p-4 shadow-sm text-light">
                  <p className="font-bold text-sm text-light">{app.candidate.firstName} {app.candidate.lastName || ''}</p>
                  <p className="text-xs text-muted mb-4 truncate">{app.job.title}</p>

                  <select
                    className="block w-full rounded-lg border border-border bg-primary-lighter px-3 py-2 text-xs font-medium shadow-sm focus:border-accent focus:ring-1 focus:ring-accent transition-all cursor-pointer"
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  >
                    {PIPELINE_STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              ))}
              {applications.filter(app => app.status === status).length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-border/50 p-6 flex items-center justify-center h-24">
                  <span className="text-xs font-medium text-muted">No applications</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
