import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { Building2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CompaniesPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  const companies = await prisma.company.findMany({
    include: {
      _count: {
        select: { jobs: true }
      },
      jobs: {
        include: {
          _count: {
            select: { applications: true }
          },
          applications: {
            where: { status: "JOINED" }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Calculate stats for each company
  const companyStats = companies.map(company => {
    let totalCandidates = 0
    let hiredCandidates = 0

    company.jobs.forEach(job => {
      totalCandidates += job._count.applications
      hiredCandidates += job.applications.length
    })

    return {
      ...company,
      totalCandidates,
      hiredCandidates
    }
  })

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-light flex items-center gap-3">
            <Building2 className="w-8 h-8 text-accent" />
            Companies
          </h1>
          <p className="mt-2 text-sm text-muted">Manage client companies, view their jobs, and track hiring performance.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/companies/new"
            className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]"
          >
            Add Company
          </Link>
        </div>
      </div>

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
              {companyStats.map((company) => (
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
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-4">
                    <Link href={`/companies/${company.id}`} className="text-accent hover:text-accent-hover transition-colors">
                      View Dashboard
                    </Link>
                    <Link href={`/companies/${company.id}/edit`} className="text-muted hover:text-light transition-colors">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {companyStats.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-sm text-muted text-center">No companies found. Add your first client company.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
