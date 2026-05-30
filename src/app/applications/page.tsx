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
          <h1 className="text-xl font-semibold text-gray-900">Applications Pipeline</h1>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/applications/new"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
          >
            Add application
          </Link>
        </div>
      </div>

      <KanbanBoard initialApplications={applications} />
    </div>
  )
}
