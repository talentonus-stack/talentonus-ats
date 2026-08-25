import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import AdminInterviewsClient from "./AdminInterviewsClient"

export default async function InterviewsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  let interviews: any[] = []
  try {
    interviews = await prisma.interview.findMany({
      include: {
        application: true,
        candidate: true,
        job: { include: { company: true } },
        recruiter: true,
      },
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Failed to load interviews", e)
  }

  return <AdminInterviewsClient initialInterviews={interviews} />
}
