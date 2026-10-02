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

import { Building2, Users, Briefcase, Trophy, Globe, MapPin } from "lucide-react"

export default function CompanyListClient({ companies, isAdmin }: { companies: CompanyStat[], isAdmin: boolean }) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="flex flex-col bg-primary-lighter border border-border rounded-2xl shadow-lg hover:border-accent/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(170,255,0,0.05)] overflow-hidden">
            {/* Header Area */}
            <div className="p-6 border-b border-border/50">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <Link href={`/companies/${company.id}`} className="group block">
                    <h3 className="text-xl font-bold text-light group-hover:text-accent transition-colors line-clamp-1">
                      {company.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted">
                    {company.industry && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {company.industry}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border ${company.status === 'ACTIVE' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                  {company.status}
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 divide-x divide-border/50 bg-primary/20 p-4 flex-1">
              <div className="flex flex-col items-center justify-center px-2">
                <div className="flex items-center gap-1.5 text-muted mb-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Jobs</span>
                </div>
                <span className="text-lg font-bold text-light">{company._count.jobs}</span>
              </div>
              <div className="flex flex-col items-center justify-center px-2">
                <div className="flex items-center gap-1.5 text-muted mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Candidates</span>
                </div>
                <span className="text-lg font-bold text-light">{company.totalCandidates}</span>
              </div>
              <div className="flex flex-col items-center justify-center px-2">
                <div className="flex items-center gap-1.5 text-accent mb-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Hired</span>
                </div>
                <span className="text-lg font-bold text-accent">{company.hiredCandidates}</span>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-4 border-t border-border/50 flex items-center justify-between bg-primary-lighter">
              <div className="flex items-center gap-2">
                {company.website && (
                  <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors p-2 rounded-lg hover:bg-accent/10" title="Visit Website">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/companies/${company.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary border border-border text-xs font-bold text-light hover:border-accent hover:text-accent transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Link>
                {isAdmin && (
                  <>
                    <Link href={`/companies/${company.id}/edit`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted hover:text-light hover:border-light transition-colors" title="Edit Company">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => confirmDelete(company)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted hover:text-red-400 hover:border-red-400 transition-colors"
                      title="Delete Company"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-20 bg-primary-lighter border border-border rounded-2xl">
          <Building2 className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-light mb-2">No Companies Found</h3>
          <p className="text-sm text-muted">Get started by adding your first client company.</p>
        </div>
      )}

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
