import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import DisableButton from "./DisableButton"
import { Eye, Edit2 } from "lucide-react"

export const dynamic = "force-dynamic"


export default async function RecruitersPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  let recruiters: any[] = []
  try {
    recruiters = await prisma.user.findMany({
      where: { role: "RECRUITER" },
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Failed to load recruiters", e)
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-light">Recruiters</h1>
          <p className="mt-2 text-sm text-muted">Manage recruiter accounts.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/recruiters/new"
            className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]"
          >
            Add Recruiter
          </Link>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-primary-lighter/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Mobile</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-primary-lighter">
            {recruiters.map((r) => (
              <tr key={r.id} className="hover:bg-primary/50 transition-colors group">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors">{r.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{r.email}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{r.mobile || 'N/A'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{r.location || 'N/A'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${r.status === 'ACTIVE' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/recruiters/${r.id}`} className="text-muted hover:text-accent transition-colors p-1" title="View">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link href={`/recruiters/${r.id}/edit`} className="text-muted hover:text-accent transition-colors p-1" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <DisableButton id={r.id} status={r.status} />
                  </div>
                </td>
              </tr>
            ))}
            {recruiters.length === 0 && (
              <tr>
                <td colSpan={6} className="whitespace-nowrap px-6 py-12 text-sm text-muted text-center">No recruiters found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
