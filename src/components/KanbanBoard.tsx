"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const PIPELINE_STATUSES = [
  "SUBMITTED",
  "SCREENING",
  "INTERVIEW_SCHEDULED",
  "L1_CLEARED",
  "L2_CLEARED",
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
  const router = useRouter()

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }


  const [selectedAppInfo, setSelectedAppInfo] = useState<{ id: string, name: string } | null>(null);
  const [showSelectedModal, setShowSelectedModal] = useState(false);
  const [formData, setFormData] = useState({ offeredCTC: '', expectedJoiningDate: '', remarks: '' });

  useEffect(() => {
    if (showSelectedModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showSelectedModal])

  const handleStatusChange = async (appId: string, newStatus: string) => {
    if (newStatus === 'SELECTED') {
      const app = applications.find(a => a.id === appId);
      if (app) {
        setSelectedAppInfo({ id: appId, name: `${app.candidate.firstName} ${app.candidate.lastName || ''}` });
        setShowSelectedModal(true);
        setFormData({ offeredCTC: '', expectedJoiningDate: '', remarks: '' });
      } else {
        // Reset the select dropdown to its original status by forcing a re-render
        setApplications([...applications])
      }
      return;
    }

    await processStatusUpdate(appId, newStatus);
  }

  const processStatusUpdate = async (appId: string, newStatus: string, extraData?: any) => {
    // Save previous state for rollback
    const previousApplications = [...applications]

    // Optimistic update
    setApplications(prev =>
      prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
    )

    try {
      const payload = { status: newStatus, ...(extraData || {}) };
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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

  const submitSelectedModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppInfo) return;

    if (!formData.offeredCTC || isNaN(parseFloat(formData.offeredCTC))) {
      showToast("Valid Offered CTC is required", "error");
      return;
    }

    if (!formData.expectedJoiningDate) {
      showToast("Expected Joining Date is required", "error");
      return;
    }

    const extraData = {
      offeredCTC: parseFloat(formData.offeredCTC),
      expectedJoiningDate: new Date(formData.expectedJoiningDate).toISOString(),
      remarks: formData.remarks
    };

    setShowSelectedModal(false);
    await processStatusUpdate(selectedAppInfo.id, 'SELECTED', extraData);
  }

  const cancelSelectedModal = () => {
    setShowSelectedModal(false);
    setSelectedAppInfo(null);
    setApplications([...applications]); // Force re-render to reset dropdown
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
        {PIPELINE_STATUSES.map(status => (
          <div key={status} className="flex w-80 flex-shrink-0 flex-col rounded-2xl bg-primary-lighter border border-border p-4 shadow-sm">
            <h3 className="mb-4 text-xs font-bold text-muted uppercase tracking-wider border-b border-border pb-2">{status.replace(/_/g, ' ')}</h3>
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

      {showSelectedModal && selectedAppInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-primary-lighter border border-border rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border bg-primary/30 shrink-0 rounded-t-2xl">
              <h2 className="text-xl font-bold text-light">Candidate Selected</h2>
              <p className="text-sm text-muted mt-1">Finalize placement details for {selectedAppInfo.name}</p>
            </div>
            <form onSubmit={submitSelectedModal} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-light uppercase tracking-wider mb-2">Offered CTC *</label>
                <input
                  type="number"
                  required
                  value={formData.offeredCTC}
                  onChange={(e) => setFormData({...formData, offeredCTC: e.target.value})}
                  className="w-full bg-primary border border-border rounded-lg p-2.5 text-sm text-light focus:outline-none focus:border-accent"
                  placeholder="e.g. 1500000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-light uppercase tracking-wider mb-2">Expected Joining Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expectedJoiningDate}
                  onChange={(e) => setFormData({...formData, expectedJoiningDate: e.target.value})}
                  className="w-full bg-primary border border-border rounded-lg p-2.5 text-sm text-light focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-light uppercase tracking-wider mb-2">Remarks (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  className="w-full bg-primary border border-border rounded-lg p-2.5 text-sm text-light focus:outline-none focus:border-accent custom-scrollbar resize-none"
                  placeholder="Any conditions or notes..."
                />
              </div>
            </form>
            <div className="flex justify-end gap-3 p-6 border-t border-border bg-primary-lighter/50 shrink-0 rounded-b-2xl">
              <button type="button" onClick={cancelSelectedModal} className="px-4 py-2 rounded-lg text-sm font-bold text-muted hover:text-light transition-colors">Cancel</button>
              <button onClick={submitSelectedModal} type="button" className="px-4 py-2 rounded-lg text-sm font-bold bg-accent text-primary hover:bg-accent-hover transition-colors">Confirm Selection</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
