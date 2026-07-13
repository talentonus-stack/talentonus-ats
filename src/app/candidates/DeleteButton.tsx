"use client"

import { deleteCandidate } from "./actions"

import { Trash2 } from "lucide-react"

export default function DeleteButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this candidate and all their applications?")) {
      await deleteCandidate(id)
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-muted hover:text-red-500 transition-colors p-1"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
