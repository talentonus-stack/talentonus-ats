import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const role = (session.user as any).role;
    // Admins have their candidate recruiterId set to null (or they can optionally select one if logic is built)
    const recruiterId = role === "RECRUITER" ? (session.user as any).id : null;

    const formData = await req.formData()
    const selectedJobId = formData.get("jobId") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const resumeUrl = formData.get("resumeUrl") as string

    if (!resumeUrl) {
      return NextResponse.json({ error: "Resume upload is mandatory." }, { status: 400 })
    }

    const existingCandidate = await prisma.candidate.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      },
      include: {
        recruiter: true,
        applications: {
          include: { job: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (existingCandidate) {
      const submittedBy = existingCandidate.recruiter ? existingCandidate.recruiter.name : 'System Admin';
      const submissionDate = new Date(existingCandidate.createdAt).toLocaleDateString();
      const latestApp = existingCandidate.applications[0];
      const status = latestApp ? latestApp.status.replace(/_/g, ' ') : 'NO ACTIVE APPLICATION';
      const assignedJob = latestApp ? latestApp.job.title : 'None';

      return NextResponse.json({
        error: "DUPLICATE_CANDIDATE",
        duplicateData: {
          name: `${existingCandidate.firstName} ${existingCandidate.lastName || ''}`,
          submittedBy,
          submissionDate,
          status,
          assignedJob
        }
      }, { status: 409 })
    }

    const candidate = await prisma.candidate.create({
      data: {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email,
        phone,
        currentLocation: formData.get("currentLocation") as string,
        experience: formData.get("experience") as string,
        currentSalary: formData.get("currentSalary") as string,
        expectedSalary: formData.get("expectedSalary") as string,
        noticePeriod: formData.get("noticePeriod") as string,
        skills: formData.get("skills") as string,
        remarks: formData.get("remarks") as string,
        portfolioUrl: formData.get("portfolioUrl") as string,
        resumeUrl,
        resumeFileName: formData.get("resumeFileName") as string,
        recruiterId,
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

    return NextResponse.json({ success: true, id: candidate.id })
  } catch (error: any) {
    console.error("Candidate creation error:", error)

    let errorMessage = "Failed to create candidate."

    // Check if it's a known Prisma error
    if (error.code) {
      if (error.code === 'P2002') {
        errorMessage = `A candidate with this ${error.meta?.target?.join(', ') || 'email'} already exists.`
      } else {
        errorMessage = `Database Error (${error.code}): ${error.message}`
      }
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
