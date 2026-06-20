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
      jobs: {
        where: { status: 'OPEN' }
      },
      placements: {
        where: { application: { status: 'JOINED' } }
      },
      _count: {
        select: { jobs: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // We need to count total candidates submitted to jobs for this company
  // We can query applications for these companies
  const companyIds = companies.map(c => c.id);
  const applications = await prisma.application.findMany({
    where: { job: { companyId: { in: companyIds } } },
    select: { status: true, job: { select: { companyId: true } } }
  });

  const appsByCompany = applications.reduce((acc, app) => {
    const cid = app.job.companyId;
    if (cid) {
      if (!acc[cid]) acc[cid] = { total: 0, selected: 0, joined: 0 };
      acc[cid].total += 1;
      if (app.status === 'SELECTED') acc[cid].selected += 1;
      if (app.status === 'JOINED') acc[cid].joined += 1;
    }
    return acc;
  }, {} as Record<string, { total: number, selected: number, joined: number }>);

  // Calculate stats for each company
  const companyStats = companies.map(company => {
    const openJobs = company.jobs.length;
    const stats = appsByCompany[company.id] || { total: 0, selected: 0, joined: 0 };
    const candidatesSubmitted = stats.total;
    const selectedCandidates = stats.selected;
    const joinedCandidates = stats.joined;

    const revenueGenerated = company.placements.reduce((sum, p) => sum + p.placementValue, 0);

    return {
      id: company.id,
      name: company.name,
      website: company.website,
      status: company.status,
      openJobs,
      candidatesSubmitted,
      selectedCandidates,
      joinedCandidates,
      revenueGenerated
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

      <CompanyListClient companies={companyStats} />
    </div>
  )
}
