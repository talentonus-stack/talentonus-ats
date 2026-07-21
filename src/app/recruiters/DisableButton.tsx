"use client"

import { disableRecruiter } from "./actions"
import { Ban } from "lucide-react"

export default function DisableButton({ id, status }: { id: string, status: string }) {
  const isInactive = status === "INACTIVE"

  const handleDisable = async () => {
    if (confirm("Are you sure you want to disable this recruiter? They will no longer be able to log in.")) {
      await disableRecruiter(id)
    }
  }

  if (isInactive) {
    return (
      <span className="text-red-900/50" title="Disabled">
        <Ban className="w-4 h-4" />
      </span>
    )
  }

  return (
    <button
      onClick={handleDisable}
      className="text-muted hover:text-red-400 transition-colors"
      title="Disable Recruiter"
    >
      <Ban className="w-4 h-4" />
    </button>
  )
}
