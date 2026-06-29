import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const recruiterId = (session.user as any).id

    const formData = await req.formData()
    const selectedJobId = formData.get("jobId") as string



    const candidateId = formData.get("candidateId") as string | null

    const resumeUrl = formData.get("resumeUrl") as string;
    if (!candidateId && (!resumeUrl || resumeUrl.trim() === '')) {
      return NextResponse.json({ error: "Resume attachment is required." }, { status: 400 });
    }

    let candidate;

    if (candidateId) {
      // EDIT MODE
      const existing = await prisma.candidate.findUnique({ where: { id: candidateId } });
      if (!existing || existing.recruiterId !== recruiterId) {
        return NextResponse.json({ error: "Unauthorized or not found." }, { status: 403 });
      }

      const updateData: any = {
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
        portfolioUrl: formData.get("portfolioUrl") as string,
        remarks: formData.get("remarks") as string,
      };

      if (resumeUrl && resumeUrl.trim() !== '') {
        updateData.resumeUrl = resumeUrl;
        updateData.resumeFileName = formData.get("resumeFileName") as string;
      }

      candidate = await prisma.candidate.update({
        where: { id: candidateId },
        data: updateData
      });

    } else {
      // CREATE MODE
      candidate = await prisma.candidate.create({
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
        recruiterId,
      }
    })
    }

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
