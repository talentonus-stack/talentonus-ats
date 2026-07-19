"use client"

import { useState } from "react"
import { deleteCandidate } from "./actions"

export default function DeleteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this candidate and all their applications?")) {
      setIsDeleting(true)
      await deleteCandidate(id)
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-end"
    >
      {isDeleting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Deleting...
        </>
      ) : (
        "Delete"
      )}
    </button>
  )
}
