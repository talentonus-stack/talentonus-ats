import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth/next"


import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import KanbanBoard from "@/components/KanbanBoard"
import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import { FileText } from "lucide-react"

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if (!["ADMIN", "ASSOCIATE_PARTNER"].includes((session.user as any).role)) {
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
    <div className="animate-fade-in max-w-full mx-auto">
      <PageHeader
        title="Applications Pipeline"
        description="Drag and drop candidates across stages to manage the recruitment workflow."
        icon={FileText}
        action={
          <Link
            href="/applications/new"
            className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]"
          >
            Add application
          </Link>
        }
      />

      <KanbanBoard initialApplications={applications} />
    </div>
  )
}
