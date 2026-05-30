"use client"

import { disableRecruiter } from "./actions"

export default function DisableButton({ id, status }: { id: string, status: string }) {
  const isInactive = status === "INACTIVE"

  const handleDisable = async () => {
    if (confirm("Are you sure you want to disable this recruiter? They will no longer be able to log in.")) {
      await disableRecruiter(id)
    }
  }

  if (isInactive) {
    return <span className="text-gray-400 text-sm">Disabled</span>
  }

  return (
    <button
      onClick={handleDisable}
      className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
    >
      Disable
    </button>
  )
}
