"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, Pencil, Ban } from "lucide-react"
import { disableRecruiter } from "./actions"

export default function RecruiterActions({ recruiter }: { recruiter: any }) {
  const isInactive = recruiter.status === "INACTIVE"
  const [isDisabling, setIsDisabling] = useState(false)

  const handleDisable = async () => {
    if (confirm("Are you sure you want to disable this recruiter? They will no longer be able to log in.")) {
      setIsDisabling(true)
      await disableRecruiter(recruiter.id)
      setIsDisabling(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-3 text-muted">
      <Link
        href={`/recruiters/${recruiter.id}`}
        className="hover:text-accent transition-colors"
        title="View Recruiter"
      >
        <Eye className="w-4 h-4" />
      </Link>
      <Link
        href={`/recruiters/${recruiter.id}/edit`}
        className="hover:text-accent transition-colors"
        title="Edit Recruiter"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      {isInactive ? (
        <span className="text-gray-400 text-xs font-medium ml-1">Disabled</span>
      ) : (
        <button
          onClick={handleDisable}
          disabled={isDisabling}
          className="hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          title="Disable Recruiter"
        >
          {isDisabling ? (
            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Ban className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  )
}
