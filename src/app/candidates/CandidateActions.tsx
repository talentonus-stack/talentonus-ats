"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { deleteCandidate } from "./actions"

export default function CandidateActions({ candidate }: { candidate: any }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this candidate and all their applications?")) {
      setIsDeleting(true)
      await deleteCandidate(candidate.id)
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-3 text-muted">
      <Link
        href={`/candidates/${candidate.id}`}
        className="hover:text-accent transition-colors"
        title="View Candidate"
      >
        <Eye className="w-4 h-4" />
      </Link>
      <Link
        href={`/candidates/${candidate.id}/edit`}
        className="hover:text-accent transition-colors"
        title="Edit Candidate"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        title="Delete Candidate"
      >
        {isDeleting ? (
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
