import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import DisableButton from "./DisableButton"

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
    console.error("Failed to load recruiters")
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
      <div className="w-full">
        {/* Mobile Card View (<768px) */}
        <div className="block md:hidden space-y-4">
          {recruiters.map((r) => (
            <div key={r.id} className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-5 flex flex-col gap-4 relative">
              <div className="flex justify-between items-start">
                <div className="pr-4 overflow-hidden">
                  <h3 className="text-sm font-bold text-light hover:text-accent transition-colors truncate" title={r.name}>{r.name}</h3>
                  <p className="text-xs font-semibold text-muted mt-0.5 truncate" title={r.email}>{r.email}</p>
                </div>
                <div className="flex items-center gap-2 -mt-2 -mr-2 shrink-0">
                  <Link href={`/recruiters/${r.id}/edit`} className="text-xs font-bold text-muted hover:text-accent transition-colors p-2" title="Edit">
                    Edit
                  </Link>
                  <DisableButton id={r.id} status={r.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm border-y border-border/50 py-3">
                 <div className="overflow-hidden">
                    <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Mobile</span>
                    <span className="text-light truncate block" title={r.mobile || 'N/A'}>{r.mobile || 'N/A'}</span>
                 </div>
                 <div className="overflow-hidden">
                    <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Location</span>
                    <span className="text-light truncate block" title={r.location || 'N/A'}>{r.location || 'N/A'}</span>
                 </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex rounded-full px-2 text-[10px] font-bold tracking-wider uppercase leading-5 ${r.status === 'ACTIVE' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                  {r.status}
                </span>
                <Link href={`/recruiters/${r.id}`} className="text-xs font-bold text-accent hover:text-accent-hover transition-colors">
                  View Profile
                </Link>
              </div>
            </div>
          ))}
          {recruiters.length === 0 && (
            <div className="bg-primary-lighter rounded-2xl border border-border p-8 text-center text-sm text-muted">
              No recruiters found.
            </div>
          )}
        </div>

        {/* Responsive Table View (≥768px) */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
          <table className="w-full table-fixed divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="w-[20%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                <th className="w-[25%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
                <th className="hidden lg:table-cell w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Mobile</th>
                <th className="hidden lg:table-cell w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Location</th>
                <th className="w-[10%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="w-[15%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-primary-lighter">
              {recruiters.map((r) => (
                <tr key={r.id} className="hover:bg-primary/50 transition-colors group">
                  <td className="px-4 py-4 text-sm font-medium text-light group-hover:text-accent transition-colors truncate" title={r.name}>{r.name}</td>
                  <td className="px-4 py-4 text-sm text-muted truncate" title={r.email}>{r.email}</td>
                  <td className="hidden lg:table-cell px-4 py-4 text-sm text-muted truncate" title={r.mobile || 'N/A'}>{r.mobile || 'N/A'}</td>
                  <td className="hidden lg:table-cell px-4 py-4 text-sm text-muted truncate" title={r.location || 'N/A'}>{r.location || 'N/A'}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-[10px] font-bold tracking-wider uppercase leading-5 truncate max-w-full ${r.status === 'ACTIVE' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`} title={r.status}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/recruiters/${r.id}`} className="text-muted hover:text-accent transition-colors">
                        View
                      </Link>
                      <Link href={`/recruiters/${r.id}/edit`} className="text-muted hover:text-accent transition-colors">
                        Edit
                      </Link>
                      <DisableButton id={r.id} status={r.status} />
                    </div>
                  </td>
                </tr>
              ))}
              {recruiters.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-sm text-muted text-center">No recruiters found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
