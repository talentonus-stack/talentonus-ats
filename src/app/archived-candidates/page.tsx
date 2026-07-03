import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import ArchivedCandidatesClient from "./ArchivedCandidatesClient"

export const dynamic = "force-dynamic"

export default async function ArchivedCandidatesPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/recruiter")
  }

  let candidates: any[] = []
  try {
    candidates = await prisma.candidate.findMany({
      where: { status: "ARCHIVED" },
      include: {
        recruiter: true,
        applications: {
          include: { job: true },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Failed to load archived candidates", e)
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold text-light">Archived Candidates</h1>
          <p className="text-sm text-muted mt-1">Candidates older than 90 days are moved here automatically.</p>
        </div>
        <Link href="/candidates" className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">
          &larr; Back to Active Candidates
        </Link>
      </div>

      <ArchivedCandidatesClient candidates={candidates} />
    </div>
  )
}
