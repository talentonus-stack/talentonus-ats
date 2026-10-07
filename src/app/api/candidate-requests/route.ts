import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const requestedById = (session.user as any).id;

    if (!["ADMIN", "ASSOCIATE_PARTNER"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden. Only Admin or Associate Partner can create requests." }, { status: 403 });
    }

    const body = await req.json();
    const { candidateId, requestText, priority } = body;

    if (!candidateId || typeof candidateId !== "string") {
      return NextResponse.json({ error: "Candidate ID is required." }, { status: 400 });
    }

    if (!requestText || typeof requestText !== "string" || requestText.trim() === "") {
      return NextResponse.json({ error: "Request text is required and cannot be empty." }, { status: 400 });
    }

    const validPriorities = ["NORMAL", "HIGH"];
    const resolvedPriority = validPriorities.includes(priority) ? priority : "NORMAL";

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { id: true, recruiterId: true, firstName: true, lastName: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }

    if (!candidate.recruiterId) {
      return NextResponse.json({ error: "This candidate does not have an assigned recruiter." }, { status: 400 });
    }

    const candidateName = `${candidate.firstName} ${candidate.lastName || ""}`.trim();

    // Use a transaction to ensure both the request and notification are created atomically
    const newRequest = await prisma.$transaction(async (tx) => {
      const createdRequest = await tx.candidateUpdateRequest.create({
        data: {
          candidateId: candidate.id,
          recruiterId: candidate.recruiterId!,
          requestedById: requestedById,
          requestText: requestText.trim(),
          priority: resolvedPriority as any,
          status: "OPEN",
        },
      });

      await tx.notification.create({
        data: {
          userId: candidate.recruiterId!,
          message: `Update requested for ${candidateName}: ${requestText.trim()}`,
          type: "NEUTRAL",
          isDismissed: false,
        },
      });

      return createdRequest;
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error: any) {
    console.error("Create CandidateUpdateRequest Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred while creating the request." }, { status: 500 });
  }
}
