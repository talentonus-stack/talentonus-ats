import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  const isAdmin = user.role === "ADMIN";
  const recruiterId = user.id;

  try {
    const interviews = await prisma.interview.findMany({
      where: isAdmin ? {} : { recruiterId },
      include: {
        application: true,
        candidate: true,
        job: { include: { company: true } },
        recruiter: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(interviews);
  } catch (error: any) {
    console.error("Failed to fetch interviews:", error);
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
  }
}

// POST endpoint to handle Rescheduling (creating a brand new record)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Only admins can schedule interviews" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { applicationId, candidateId, jobId, recruiterId, round, mode, interviewDate, meetingLink, location } = body;

    if (!applicationId || !candidateId || !jobId || !round || !mode || !interviewDate) {
      return NextResponse.json({ error: "Missing required interview fields" }, { status: 400 });
    }

    const newInterview = await prisma.interview.create({
      data: {
        applicationId,
        candidateId,
        jobId,
        recruiterId: recruiterId || null,
        round,
        mode,
        interviewDate: new Date(interviewDate),
        meetingLink: meetingLink || null,
        location: location || null,
        status: "SCHEDULED" // Explicitly defaulting to SCHEDULED on new creation/reschedule
      }
    });

    return NextResponse.json(newInterview, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create interview:", error);
    return NextResponse.json({ error: "Failed to create interview" }, { status: 500 });
  }
}
