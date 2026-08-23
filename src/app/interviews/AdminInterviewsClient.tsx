"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarSync, CheckCircle, XCircle, Clock } from "lucide-react"

export default function AdminInterviewsClient({ initialInterviews }: { initialInterviews: any[] }) {
  const [interviews, setInterviews] = useState(initialInterviews)
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  // Reschedule Modal State
  const [rescheduleModalState, setRescheduleModalState] = useState<{ interview: any, show: boolean }>({ interview: null, show: false })
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '', mode: 'ONLINE', meetingLink: '', location: '' })

  const router = useRouter()

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleStatusChange = async (interviewId: string, newStatus: string) => {
    // Only allow changing status if current status is SCHEDULED
    const targetInterview = interviews.find(i => i.id === interviewId);
    if (!targetInterview || targetInterview.status !== 'SCHEDULED') {
        showToast("Can only update status of SCHEDULED interviews.", 'error');
        return;
    }

    try {
      const res = await fetch(`/api/interviews/${interviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) {
        throw new Error("Failed to update status")
      }

      setInterviews(prev => prev.map(i => i.id === interviewId ? { ...i, status: newStatus } : i))
      showToast(`Interview marked as ${newStatus}`, 'success')
      router.refresh()
    } catch(e: any) {
      showToast(e.message || "Failed to update status", 'error')
    }
  }

  const openRescheduleModal = (interview: any) => {
    if (interview.status !== 'NO_SHOW' && interview.status !== 'CANCELLED') {
        showToast("You can only reschedule NO SHOW or CANCELLED interviews.", 'error');
        return;
    }

    setRescheduleForm({
      date: '',
      time: '',
      mode: 'ONLINE',
      meetingLink: '',
      location: ''
    })
    setRescheduleModalState({ interview, show: true })
  }

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { interview } = rescheduleModalState;
    if (!interview) return;

    if (!rescheduleForm.date || !rescheduleForm.time || !rescheduleForm.mode) {
      alert("Please fill out all required fields.")
      return
    }

    if (rescheduleForm.mode === 'ONLINE' && !rescheduleForm.meetingLink) {
        alert("Meeting Link is required for Online interviews.")
        return
    }

    if (rescheduleForm.mode === 'OFFLINE' && !rescheduleForm.location) {
        alert("Location is required for Offline interviews.")
        return
    }

    const combinedDate = new Date(`${rescheduleForm.date}T${rescheduleForm.time}`)

    try {
      const res = await fetch(`/api/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: interview.applicationId,
          candidateId: interview.candidateId,
          jobId: interview.jobId,
          recruiterId: interview.recruiterId,
          round: interview.round,
          mode: rescheduleForm.mode,
          interviewDate: combinedDate.toISOString(),
          meetingLink: rescheduleForm.meetingLink,
          location: rescheduleForm.location
        })
      })

      if (!res.ok) {
        throw new Error("Failed to reschedule interview")
      }

      const newInterview = await res.json()

      // Merge candidate, job, recruiter objects for UI since they aren't returned from create
      newInterview.candidate = interview.candidate;
      newInterview.job = interview.job;
      newInterview.recruiter = interview.recruiter;

      setInterviews([newInterview, ...interviews])
      setRescheduleModalState({ interview: null, show: false })
      showToast("Interview rescheduled successfully", 'success')
      router.refresh()
    } catch(e: any) {
      showToast(e.message || "Failed to reschedule", 'error')
    }
  }

  // Metrics
  const todayStart = new Date()
  todayStart.setHours(0,0,0,0)
  const todayEnd = new Date()
  todayEnd.setHours(23,59,59,999)

  const todayCount = interviews.filter(i => {
    const d = new Date(i.interviewDate);
    return d >= todayStart && d <= todayEnd && i.status === 'SCHEDULED'
  }).length;

  const upcomingCount = interviews.filter(i => new Date(i.interviewDate) > todayEnd && i.status === 'SCHEDULED').length;
  const completedCount = interviews.filter(i => i.status === 'COMPLETED').length;
  const cancelledCount = interviews.filter(i => i.status === 'CANCELLED').length;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto text-light">
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl border font-bold text-sm transition-all animate-fade-in ${
          toastMessage.type === 'success'
            ? 'bg-green-900/20 text-green-400 border-green-500/50'
            : 'bg-red-900/20 text-red-400 border-red-500/50'
        }`}>
          {toastMessage.text}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-light">Interviews</h1>
        <p className="mt-2 text-sm text-muted">Manage all candidate interviews and schedules.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-primary border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Today</p>
          <p className="text-2xl font-bold text-light mt-1">{todayCount}</p>
        </div>
        <div className="bg-primary border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Upcoming</p>
          <p className="text-2xl font-bold text-light mt-1">{upcomingCount}</p>
        </div>
        <div className="bg-primary border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Completed</p>
          <p className="text-2xl font-bold text-light mt-1">{completedCount}</p>
        </div>
        <div className="bg-primary border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Cancelled</p>
          <p className="text-2xl font-bold text-light mt-1">{cancelledCount}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate</th>
                <th className="w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Job</th>
                <th className="w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recruiter</th>
                <th className="w-[10%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Round</th>
                <th className="w-[10%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Mode</th>
                <th className="w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Date & Time</th>
                <th className="w-[10%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="w-[10%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-primary-lighter">
              {interviews.map((interview) => (
                <tr key={interview.id} className="hover:bg-primary/50 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium truncate">{interview.candidate.firstName} {interview.candidate.lastName}</td>
                  <td className="px-4 py-4 text-sm text-muted truncate">{interview.job.title}</td>
                  <td className="px-4 py-4 text-sm text-muted truncate">{interview.recruiter ? interview.recruiter.name : 'N/A'}</td>
                  <td className="px-4 py-4 text-sm font-bold text-accent">{interview.round.replace('_', ' ')}</td>
                  <td className="px-4 py-4 text-sm text-muted">{interview.mode}</td>
                  <td className="px-4 py-4 text-sm text-light">
                    {new Date(interview.interviewDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase leading-tight border truncate
                      ${interview.status === 'SCHEDULED' ? 'bg-blue-900/20 text-blue-400 border-blue-500/20' : ''}
                      ${interview.status === 'COMPLETED' ? 'bg-green-900/20 text-green-400 border-green-500/20' : ''}
                      ${interview.status === 'CANCELLED' ? 'bg-red-900/20 text-red-400 border-red-500/20' : ''}
                      ${interview.status === 'NO_SHOW' ? 'bg-orange-900/20 text-orange-400 border-orange-500/20' : ''}
                    `}>
                      {interview.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        {interview.status === 'SCHEDULED' && (
                            <>
                                <button onClick={() => handleStatusChange(interview.id, 'COMPLETED')} className="text-green-400 hover:text-green-300 transition-colors" title="Mark Completed"><CheckCircle className="w-4 h-4" /></button>
                                <button onClick={() => handleStatusChange(interview.id, 'NO_SHOW')} className="text-orange-400 hover:text-orange-300 transition-colors" title="Mark No Show"><Clock className="w-4 h-4" /></button>
                                <button onClick={() => handleStatusChange(interview.id, 'CANCELLED')} className="text-red-400 hover:text-red-300 transition-colors" title="Cancel"><XCircle className="w-4 h-4" /></button>
                            </>
                        )}
                        {(interview.status === 'NO_SHOW' || interview.status === 'CANCELLED') && (
                            <button onClick={() => openRescheduleModal(interview)} className="text-accent hover:text-accent-hover transition-colors" title="Reschedule"><CalendarSync className="w-4 h-4" /></button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {interviews.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-sm text-muted text-center">No interviews found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rescheduleModalState.show && rescheduleModalState.interview && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 p-4 bg-black/50" style={{ backdropFilter: 'blur(4px)' }}>
            <div className="bg-primary border border-border rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[calc(100vh-96px)]">
              <div className="p-6 border-b border-border shrink-0">
                <h3 className="text-xl font-bold text-light">Reschedule Interview</h3>
                <p className="text-sm text-accent font-medium mt-2">{rescheduleModalState.interview.candidate.firstName} {rescheduleModalState.interview.candidate.lastName}</p>
                <p className="text-sm text-muted mt-1">This will create a new scheduled interview for {rescheduleModalState.interview.round.replace('_', ' ')}.</p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <form id="reschedule-form" onSubmit={handleRescheduleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-light mb-1">Interview Date <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        required
                        value={rescheduleForm.date}
                        onChange={(e) => setRescheduleForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full rounded-md border border-border bg-primary-lighter px-3 py-2 text-sm text-light focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light mb-1">Interview Time <span className="text-red-500">*</span></label>
                      <input
                        type="time"
                        required
                        value={rescheduleForm.time}
                        onChange={(e) => setRescheduleForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full rounded-md border border-border bg-primary-lighter px-3 py-2 text-sm text-light focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-light mb-1">Interview Mode <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={rescheduleForm.mode}
                        onChange={(e) => setRescheduleForm(prev => ({ ...prev, mode: e.target.value }))}
                        className="w-full rounded-md border border-border bg-primary-lighter px-3 py-2 text-sm text-light focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        <option value="ONLINE">Online</option>
                        <option value="OFFLINE">Offline</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light mb-1">Interview Round</label>
                      <input
                        type="text"
                        disabled
                        value={rescheduleModalState.interview.round.replace('_', ' ')}
                        className="w-full rounded-md border border-border bg-gray-800 px-3 py-2 text-sm text-muted cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {rescheduleForm.mode === 'ONLINE' && (
                    <div>
                      <label className="block text-sm font-medium text-light mb-1">Meeting Link <span className="text-red-500">*</span></label>
                      <input
                        type="url"
                        required
                        value={rescheduleForm.meetingLink}
                        onChange={(e) => setRescheduleForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                        className="w-full rounded-md border border-border bg-primary-lighter px-3 py-2 text-sm text-light focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  )}

                  {rescheduleForm.mode === 'OFFLINE' && (
                    <div>
                      <label className="block text-sm font-medium text-light mb-1">Location <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={rescheduleForm.location}
                        onChange={(e) => setRescheduleForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full rounded-md border border-border bg-primary-lighter px-3 py-2 text-sm text-light focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  )}
                </form>
              </div>
              <div className="p-6 border-t border-border bg-primary-lighter flex justify-end gap-3 shrink-0 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setRescheduleModalState({ interview: null, show: false })}
                  className="px-4 py-2 border border-border rounded-md text-sm font-medium text-light bg-primary hover:bg-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="reschedule-form"
                  className="px-4 py-2 bg-accent text-primary rounded-md text-sm font-bold hover:bg-accent-hover transition-colors"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
