"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const PIPELINE_STATUSES = [
  "SUBMITTED",
  "SCREENING",
  "INTERVIEW_SCHEDULED",
  "L1_CLEARED",
  "L2_CLEARED",
  "SELECTED",
  "REJECTED",
  "JOINED"
]

type Application = {
  id: string
  status: string
  candidate: { firstName: string; lastName: string | null }
  job: { title: string }
}

export default function KanbanBoard({ initialApplications }: { initialApplications: Application[] }) {
  const [applications, setApplications] = useState(initialApplications)
  const router = useRouter()

  const handleStatusChange = async (appId: string, newStatus: string) => {
    // Optimistic update
    setApplications(prev =>
      prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
    )

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) {
        throw new Error("Failed to update status")
      }
      router.refresh()
    } catch(e) {
      console.error(e)
      router.refresh()
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] space-x-4 overflow-x-auto pb-4">
      {PIPELINE_STATUSES.map(status => (
        <div key={status} className="flex w-80 flex-shrink-0 flex-col rounded-md bg-primary-lighter border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold text-light">{status.replace(/_/g, ' ')}</h3>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {applications.filter(app => app.status === status).map(app => (
              <div key={app.id} className="rounded-md bg-primary border border-border hover:border-accent/50 transition-colors p-4 shadow-sm text-light border border-gray-200">
                <p className="font-medium text-sm">{app.candidate.firstName} {app.candidate.lastName || ''}</p>
                <p className="text-xs text-muted mb-3 font-semibold">{app.job.title}</p>

                <select
                  className="block w-full rounded-md border-border bg-primary-lighter text-xs shadow-sm focus:border-accent focus:ring-1 focus:ring-accent"
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
              <div className="rounded-md border-2 border-dashed border-border p-4 text-center">
                <span className="text-xs text-muted">No applications</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
