import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import AdminNewCandidateClientForm from "./AdminNewCandidateClientForm"

export default async function NewCandidatePage({ searchParams }: { searchParams: Promise<{ jobId?: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }
  const { jobId } = await searchParams;

  let activeJobs: any[] = []
  try {
    activeJobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      orderBy: { title: "asc" }
    })
  } catch (e) {
    console.error("Failed to load active jobs", e)
  }

  return <AdminNewCandidateClientForm activeJobs={activeJobs} jobId={jobId} />
}
