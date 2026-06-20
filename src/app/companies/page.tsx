import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { Building2 } from "lucide-react"
import CompanyListClient from "./CompanyListClient"

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
      id: company.id,
      name: company.name,
      website: company.website,
      status: company.status,
      industry: company.industry,
      _count: company._count,
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
            className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[#E8952C] transition-colors shadow-md hover:shadow-lg"
          >
            Add Company
          </Link>
        </div>
      </div>

      <CompanyListClient companies={companyStats} />
    </div>
  )
}
