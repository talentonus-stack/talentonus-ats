import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import AdminNewCandidateForm from "./AdminNewCandidateForm"

export default async function NewCandidatePage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/recruiter")
  }

  let activeJobs: any[] = []
  try {
    activeJobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      orderBy: { title: "asc" }
    })
  } catch (e) {
    console.error("Failed to load active jobs", e)
  }

  async function createCandidateAction(formData: FormData) {
    "use server"
    const authSession = await getServerSession(authOptions)
    if (!authSession || (authSession.user as any).role !== "ADMIN") {
      throw new Error("Unauthorized")
    }

    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const selectedJobId = formData.get("jobId") as string;

    if (phone && phone.trim() !== '') {
      const existingPhone = await prisma.candidate.findFirst({
        where: { phone }
      });
      if (existingPhone) {
        return { success: false, error: "A candidate with this mobile number already exists." };
      }
    }

    try {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: formData.get("firstName") as string,
          lastName: formData.get("lastName") as string,
          email: formData.get("email") as string,
          phone: formData.get("phone") as string,
          currentLocation: formData.get("currentLocation") as string,
          experience: formData.get("experience") as string,
          currentSalary: formData.get("currentSalary") as string,
          expectedSalary: formData.get("expectedSalary") as string,
          noticePeriod: formData.get("noticePeriod") as string,
          skills: formData.get("skills") as string,
          remarks: formData.get("remarks") as string,
          portfolioUrl: formData.get("portfolioUrl") as string,
          resumeUrl: formData.get("resumeUrl") as string,
          resumeFileName: formData.get("resumeFileName") as string,
        }
      })

      if (selectedJobId) {
        await prisma.application.create({
          data: {
            jobId: selectedJobId,
            candidateId: candidate.id,
            status: "SUBMITTED"
          }
        })
      }
    } catch(e: any) {
      console.error(e)
      if (e.code === 'P2002') {
        return { success: false, error: "A candidate with this email already exists." };
      }
      return { success: false, error: "Database error occurred." };
    }

    redirect("/candidates")
  }

  return <AdminNewCandidateForm activeJobs={activeJobs} createCandidateAction={createCandidateAction} />
}
