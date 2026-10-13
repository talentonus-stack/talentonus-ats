import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import CandidateListingClient from "./CandidateListingClient"
import PageHeader from "@/components/PageHeader"
import { Users } from "lucide-react"

export default async function RecruiterCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; candidateId?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session || !["RECRUITER", "ASSOCIATE_PARTNER"].includes((session.user as any).role)) {
    redirect("/recruiter-login")
  }

  const recruiterId = (session.user as any).id
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams?.page;

  let requestedPage = 1;
  if (typeof pageParam === 'string') {
    const parsed = parseInt(pageParam, 10);
    if (!isNaN(parsed) && parsed > 0) {
      requestedPage = parsed;
    }
  }

  let candidates: any[] = []
  let totalCount = 0;
  let totalPages = 1;
  let currentPage = requestedPage;
  const take = 25;

  try {
    const skipAttempt = (requestedPage - 1) * take;
    const whereClause = { recruiterId, status: "ACTIVE" as const };

    const selectQuery = {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      createdAt: true,
      currentLocation: true,
      experience: true,
      currentSalary: true,
      expectedSalary: true,
      noticePeriod: true,
      skills: true,
      remarks: true,
      resumeUrl: true,
      resumeFileName: true,
      portfolioUrl: true,
      applications: {
        select: {
          id: true,
          status: true,
          statusChangeReason: true,
          job: { select: { title: true } },
          placement: { select: { expectedJoiningDate: true } }
        }
      },
      updateRequests: {
        where: { status: "OPEN" as const },
        select: {
          id: true,
          status: true,
          priority: true,
          requestText: true,
          createdAt: true,
          requestedBy: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" as const }
      }
    };

    const [fetchedCount, fetchedCandidates] = await Promise.all([
      prisma.candidate.count({ where: whereClause }),
      prisma.candidate.findMany({
        where: whereClause,
        take,
        skip: skipAttempt,
        select: selectQuery,
        orderBy: { createdAt: "desc" }
      })
    ]);

    totalCount = fetchedCount;

    if (totalCount > 0) {
      totalPages = Math.ceil(totalCount / take);

      if (requestedPage > totalPages) {
        currentPage = totalPages;
        const actualSkip = (currentPage - 1) * take;
        candidates = await prisma.candidate.findMany({
          where: whereClause,
          take,
          skip: actualSkip,
          select: selectQuery,
          orderBy: { createdAt: "desc" }
        });
      } else {
        currentPage = requestedPage;
        candidates = fetchedCandidates;
      }
    }
  } catch (e) {
    console.error("Failed to load recruiter candidates", e)
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-1">
        <PageHeader
          title="My Candidates"
          description="Track candidates you have submitted."
          icon={Users}
          action={
            <Link
              href="/recruiter/candidates/new"
              className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]"
            >
              Submit Candidate
            </Link>
          }
        />
        <CandidateListingClient
          candidates={candidates}
          pagination={{ totalCount, totalPages, currentPage, take }}
        />
      </div>
    </div>
  )
}
