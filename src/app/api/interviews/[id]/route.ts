import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Only admins can update interviews" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const { status, interviewDate, mode, meetingLink } = await request.json();

    if (!status) {
      return NextResponse.json({ error: "Missing required status field" }, { status: 400 });
    }

    // Explicitly enforce state transition rules at the API level
    const existingInterview = await prisma.interview.findUnique({
      where: { id }
    });

    if (!existingInterview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Handle Rescheduling (Updating an existing NO_SHOW or CANCELLED interview back to SCHEDULED)
    if (status === "SCHEDULED") {
      if (existingInterview.status !== "NO_SHOW" && existingInterview.status !== "CANCELLED") {
        return NextResponse.json({ error: "Can only reschedule NO_SHOW or CANCELLED interviews." }, { status: 400 });
      }

      if (!interviewDate || !mode) {
        return NextResponse.json({ error: "Missing required scheduling fields for reschedule." }, { status: 400 });
      }

      const updatedInterview = await prisma.interview.update({
        where: { id },
        data: {
          status: "SCHEDULED",
          interviewDate: new Date(interviewDate),
          mode,
          meetingLink: meetingLink || null
        }
      });

      return NextResponse.json(updatedInterview);
    }

    // Handle standard status updates (SCHEDULED -> COMPLETED/CANCELLED/NO_SHOW)
    if (existingInterview.status !== "SCHEDULED") {
      return NextResponse.json({ error: "Cannot modify an interview that is already COMPLETED, CANCELLED, or NO_SHOW." }, { status: 400 });
    }

    if (!["COMPLETED", "CANCELLED", "NO_SHOW"].includes(status)) {
      return NextResponse.json({ error: "Invalid status transition. Can only transition from SCHEDULED to COMPLETED, CANCELLED, or NO_SHOW." }, { status: 400 });
    }

    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updatedInterview);
  } catch (error: any) {
    console.error("Failed to update interview:", error);
    return NextResponse.json({ error: "Failed to update interview" }, { status: 500 });
  }
}
