"use client"

import { deleteCandidate } from "./actions"

export default function DeleteButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this candidate and all their applications?")) {
      await deleteCandidate(id)
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
    >
      Delete
    </button>
  )
}
