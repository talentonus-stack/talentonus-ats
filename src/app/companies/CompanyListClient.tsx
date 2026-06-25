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
  openJobs: number
  candidatesSubmitted: number
  selectedCandidates: number
  joinedCandidates: number
  revenueGenerated: number
}

export default function CompanyListClient({ companies }: { companies: CompanyStat[] }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<CompanyStat | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)

  const formatLakhs = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)}L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

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
      <div className="w-full">
        {/* Mobile Card View (<768px) */}
        <div className="block md:hidden space-y-4">
          {companies.map((company) => (
            <div key={company.id} className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-5 flex flex-col gap-4 relative">
              <div className="flex justify-between items-start">
                <div>
                  <Link href={`/companies/${company.id}`} className="block">
                    <h3 className="text-sm font-bold text-light hover:text-accent transition-colors">{company.name}</h3>
                    <p className="text-xs text-muted mt-0.5">{company.website || 'No website'}</p>
                    <span className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${company.status === 'ACTIVE' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                      {company.status}
                    </span>
                  </Link>
                </div>
                <div className="flex items-center gap-2 -mt-2 -mr-2">
                  <Link href={`/companies/${company.id}/edit`} className="text-muted hover:text-light transition-colors p-2" title="Edit Company">
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => confirmDelete(company)}
                    className="text-muted hover:text-red-500 transition-colors p-2"
                    title="Delete Company"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm border-y border-border/50 py-3">
                 <div>
                    <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Active Jobs</span>
                    <span className="text-light">{company.openJobs}</span>
                 </div>
                 <div>
                    <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Total Submitted</span>
                    <span className="text-light">{company.candidatesSubmitted}</span>
                 </div>
                 <div>
                    <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Selected</span>
                    <span className="font-bold text-accent">{company.selectedCandidates}</span>
                 </div>
                 <div>
                    <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Joined</span>
                    <span className="font-bold text-green-400">{company.joinedCandidates}</span>
                 </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Revenue Generated</span>
                <span className="font-bold text-accent">{formatLakhs(company.revenueGenerated)}</span>
              </div>
            </div>
          ))}
          {companies.length === 0 && (
            <div className="bg-primary-lighter rounded-2xl border border-border p-8 text-center text-sm text-muted">
              No companies found. Add your first client company.
            </div>
          )}
        </div>

        {/* Responsive Table View (≥768px) */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
          <div className="w-full">
            <table className="w-full table-fixed divide-y divide-border">
              <thead className="bg-primary-lighter/50">
                <tr>
                  <th className="w-[25%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Company Details</th>
                  <th className="w-[12%] px-4 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Active Jobs</th>
                  <th className="hidden lg:table-cell w-[12%] px-4 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Submitted</th>
                  <th className="w-[12%] px-4 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Selected</th>
                  <th className="w-[12%] px-4 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Joined</th>
                  <th className="w-[15%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Revenue</th>
                  <th className="w-[12%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-primary/50 transition-colors group">
                    <td className="px-4 py-4 overflow-hidden">
                      <Link href={`/companies/${company.id}`} className="block">
                        <div className="text-sm font-bold text-light group-hover:text-accent transition-colors truncate" title={company.name}>{company.name}</div>
                        <div className="text-xs text-muted mt-1 truncate" title={company.website || 'No website'}>{company.website || 'No website'}</div>
                        <span className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border truncate max-w-full ${company.status === 'ACTIVE' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                          {company.status}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-light font-medium truncate">{company.openJobs}</td>
                    <td className="hidden lg:table-cell px-4 py-4 text-center text-sm text-light font-medium truncate">{company.candidatesSubmitted}</td>
                    <td className="px-4 py-4 text-center text-sm text-accent font-bold truncate">{company.selectedCandidates}</td>
                    <td className="px-4 py-4 text-center text-sm text-green-400 font-bold truncate">{company.joinedCandidates}</td>
                    <td className="px-4 py-4 text-right text-sm text-accent font-bold truncate">{formatLakhs(company.revenueGenerated)}</td>
                    <td className="px-4 py-4 text-right text-sm font-medium">
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
                    <td colSpan={7} className="px-4 py-12 text-sm text-muted text-center">No companies found. Add your first client company.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
              {companyToDelete.openJobs > 0 && (
                <span className="block mt-2 text-red-400 font-medium">
                  This company has {companyToDelete.openJobs} associated jobs and cannot be permanently deleted. It will be marked as INACTIVE instead.
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
