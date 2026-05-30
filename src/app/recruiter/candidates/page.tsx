import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"

export default async function RecruiterCandidatesPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }

  const recruiterId = (session.user as any).id

  let candidates: any[] = []
  try {
    candidates = await prisma.candidate.findMany({
      where: { recruiterId },
      include: { applications: { include: { job: true } } },
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Failed to load recruiter candidates", e)
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-light">My Candidates</h1>
          <p className="mt-2 text-sm text-muted">Track candidates you have submitted.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/recruiter/candidates/new"
            className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]"
          >
            Submit Candidate
          </Link>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-primary-lighter/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Job Applied</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Application Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Submitted On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-primary-lighter">
            {candidates.map((candidate) => {
              const latestApp = candidate.applications[0];
              return (
                <tr key={candidate.id} className="hover:bg-primary/50 transition-colors group">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors">
                    {candidate.firstName} {candidate.lastName || ''}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                    <div>{candidate.email}</div>
                    <div>{candidate.phone || 'N/A'}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors">
                    {latestApp ? latestApp.job.title : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {latestApp ? (
                      <span className="inline-flex rounded-full bg-accent/10 px-2 text-xs font-semibold leading-5 text-accent border-accent/20">
                        {latestApp.status.replace(/_/g, ' ')}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                    {new Date(candidate.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={5} className="whitespace-nowrap px-6 py-12 text-sm text-muted text-center">No candidates submitted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
