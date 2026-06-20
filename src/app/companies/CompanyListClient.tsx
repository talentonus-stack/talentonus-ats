"use client"

import Link from "next/link"
import { useState } from "react"
import { deleteCompany } from "./actions"
import { Eye, Edit2, Trash2, X, AlertTriangle } from "lucide-react"

type CompanyStat = {
  id: string
  name: string
  website: string | null
  status: string
  industry: string | null
  _count: { jobs: number }
  totalCandidates: number
  hiredCandidates: number
}

export default function CompanyListClient({ companies }: { companies: CompanyStat[] }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<CompanyStat | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)

  const confirmDelete = (company: CompanyStat) => {
    setCompanyToDelete(company)
    setDeleteMessage(null)
    setDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!companyToDelete) return
    setIsDeleting(true)
    try {
      const res = await deleteCompany(companyToDelete.id)
      setDeleteMessage(res.message)
      setTimeout(() => {
        setDeleteModalOpen(false)
        setCompanyToDelete(null)
      }, 2000)
    } catch (e: any) {
      setDeleteMessage(e.message || "Failed to delete company")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Company Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Industry</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Active Jobs</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Total Candidates</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Hired</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-primary/50 transition-colors group">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link href={`/companies/${company.id}`} className="block">
                      <div className="text-sm font-bold text-light group-hover:text-accent transition-colors">{company.name}</div>
                      <div className="text-xs text-muted mt-1">{company.website || 'No website'}</div>
                      <span className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${company.status === 'ACTIVE' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                        {company.status}
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-light font-medium">{company.industry || 'N/A'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-light font-medium">{company._count.jobs}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-light font-medium">{company.totalCandidates}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-accent font-bold">{company.hiredCandidates}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/companies/${company.id}`} className="text-muted hover:text-accent transition-colors p-1" title="View Dashboard">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/companies/${company.id}/edit`} className="text-muted hover:text-light transition-colors p-1" title="Edit Company">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => confirmDelete(company)}
                        className="text-muted hover:text-red-500 transition-colors p-1"
                        title="Delete Company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-sm text-muted text-center">No companies found. Add your first client company.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteModalOpen && companyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-primary-lighter border border-border rounded-2xl w-full max-w-md shadow-2xl relative p-6">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-light transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4 text-red-500">
              <AlertTriangle className="w-8 h-8" />
              <h2 className="text-xl font-bold text-light">Delete Company</h2>
            </div>

            <p className="text-sm text-muted mb-6">
              Are you sure you want to delete <span className="font-bold text-light">{companyToDelete.name}</span>?
              {companyToDelete._count.jobs > 0 && (
                <span className="block mt-2 text-red-400 font-medium">
                  This company has {companyToDelete._count.jobs} associated jobs and cannot be permanently deleted. It will be marked as INACTIVE instead.
                </span>
              )}
            </p>

            {deleteMessage && (
              <div className="mb-4 p-3 rounded-lg text-sm font-bold bg-primary border border-border text-center text-accent">
                {deleteMessage}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-muted hover:text-light transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Processing..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
