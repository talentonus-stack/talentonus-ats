"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, Edit2, Trash2 } from "lucide-react"
import { deleteJob } from "./actions"
import { useRouter } from "next/navigation"

export default function JobListingClient({ initialJobs }: { initialJobs: any[] }) {
  const [jobs, setJobs] = useState(initialJobs)
  const [deleteModal, setDeleteModal] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setIsDeleting(true)
    try {
      const res = await deleteJob(deleteModal.id)
      if (res.success) {
        setJobs(jobs.filter(j => j.id !== deleteModal.id))
        showToast("Job deleted successfully.", 'success')
        setDeleteModal(null)
      } else {
        showToast(res.error || "Failed to delete job.", 'error')
        if (res.error?.includes("applications")) {
           // We can also close the modal so they see the toast, or keep it open.
           // Closing it is cleaner if it's an unrecoverable state like having applications.
           setDeleteModal(null)
        }
      }
    } catch(e: any) {
      showToast(e.message || "Failed to delete job.", 'error')
      setDeleteModal(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-xl shadow-2xl border font-bold text-sm transition-all animate-fade-in ${
          toastMessage.type === 'success'
            ? 'bg-green-900/20 text-green-400 border-green-500/50'
            : 'bg-red-900/20 text-red-400 border-red-500/50'
        }`}>
          {toastMessage.text}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Title / Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Experience</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Posted</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-primary-lighter">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-primary/50 transition-colors group">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-light group-hover:text-accent transition-colors">{job.title}</div>
                    <div className="text-xs text-muted mt-1">{job.company?.name || 'No Company'}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{job.experience || 'N/A'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{job.location}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${job.priority === 'HIGH' ? 'bg-red-900/20 text-red-400 border-red-800/30' : job.priority === 'MEDIUM' ? 'bg-orange-900/20 text-orange-400 border-orange-800/30' : 'bg-accent/10 text-accent border-accent/20'}`}>
                      {job.priority}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${job.status === 'OPEN' ? 'bg-accent/10 text-accent border-accent/20' : job.status === 'ON_HOLD' ? 'bg-orange-900/20 text-orange-400 border-orange-800/30' : 'bg-border text-muted border-border'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{new Date(job.postedDate).toLocaleDateString()}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/jobs/${job.id}`} className="text-muted hover:text-accent transition-colors" title="View Job">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/jobs/${job.id}/edit`} className="text-muted hover:text-accent transition-colors" title="Edit Job">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => setDeleteModal(job)} className="text-muted hover:text-red-400 transition-colors focus:outline-none" title="Delete Job">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-sm text-muted text-center">No jobs found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 p-4 bg-black/50" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="bg-primary border border-border rounded-xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-border shrink-0">
              <h3 className="text-xl font-bold text-light">Delete Job</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted">
                Are you sure you want to permanently delete this job?
                <br />
                This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-border bg-primary-lighter flex justify-end gap-3 shrink-0 rounded-b-xl">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-border rounded-md text-sm font-medium text-light bg-primary hover:bg-border transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Delete Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
