"use client"

import Link from "next/link"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { deleteCandidate } from "./actions"

export default function CandidateActions({ candidate }: { candidate: any }) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this candidate and all their applications?")) {
      await deleteCandidate(candidate.id)
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
        className="hover:text-red-400 transition-colors"
        title="Delete Candidate"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
