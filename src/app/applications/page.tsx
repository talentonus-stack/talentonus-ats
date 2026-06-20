import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth/next"


import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import KanbanBoard from "@/components/KanbanBoard"
import Link from "next/link"

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/recruiter")
  }

  let applications: any[] = []
  try {
    applications = await prisma.application.findMany({
      include: {
        candidate: true,
        job: true,
      },
      orderBy: { updatedAt: "desc" }
    })
  } catch (e) {
    console.error("Failed to load applications")
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-light">Applications Pipeline</h1>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/applications/new"
            className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]"
          >
            Add application
          </Link>
        </div>
      </div>

      <KanbanBoard initialApplications={applications} />
    </div>
  )
}
