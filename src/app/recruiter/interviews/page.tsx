import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import RecruiterInterviewsClient from "./RecruiterInterviewsClient"

export default async function RecruiterInterviewsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }

  const recruiterId = (session.user as any).id

  let interviews: any[] = []
  try {
    interviews = await prisma.interview.findMany({
      where: { recruiterId },
      include: {
        application: true,
        candidate: true,
        job: { include: { company: true } },
        recruiter: true,
      },
      orderBy: { createdAt: "desc" }
    })
  } catch (e) {
    console.error("Failed to load recruiter interviews", e)
  }

  return <RecruiterInterviewsClient initialInterviews={interviews} />
}
