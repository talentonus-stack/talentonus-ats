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
        <div key={status} className="flex w-80 flex-shrink-0 flex-col rounded-md bg-gray-100 p-4">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">{status.replace(/_/g, ' ')}</h3>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {applications.filter(app => app.status === status).map(app => (
              <div key={app.id} className="rounded-md bg-white p-4 shadow-sm text-black border border-gray-200">
                <p className="font-medium text-sm">{app.candidate.firstName} {app.candidate.lastName || ''}</p>
                <p className="text-xs text-gray-500 mb-3 font-semibold">{app.job.title}</p>

                <select
                  className="block w-full rounded-md border-gray-300 bg-gray-50 text-xs shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              <div className="rounded-md border-2 border-dashed border-gray-300 p-4 text-center">
                <span className="text-xs text-gray-500">No applications</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
