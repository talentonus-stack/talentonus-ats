import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const resolvedById = (session.user as any).id;
    const resolverName = (session.user as any).name || "Recruiter";

    if (!["RECRUITER", "ASSOCIATE_PARTNER"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden. Only Recruiter or Associate Partner can resolve requests." }, { status: 403 });
    }

    const { id } = await context.params;

    const body = await req.json();
    const { responseText } = body;

    if (!responseText || typeof responseText !== "string" || responseText.trim() === "") {
      return NextResponse.json({ error: "Response text is required and cannot be empty." }, { status: 400 });
    }

    // Fetch the request to validate ownership and state
    const existingRequest = await prisma.candidateUpdateRequest.findUnique({
      where: { id },
      include: {
        candidate: { select: { firstName: true, lastName: true } },
      },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Candidate update request not found." }, { status: 404 });
    }

    if (existingRequest.recruiterId !== resolvedById) {
      return NextResponse.json({ error: "Forbidden. You can only resolve requests assigned to you." }, { status: 403 });
    }

    if (existingRequest.status === "RESOLVED") {
      return NextResponse.json({ error: "This request has already been resolved." }, { status: 400 });
    }

    const candidateName = `${existingRequest.candidate.firstName} ${existingRequest.candidate.lastName || ""}`.trim();

    // Use a transaction to resolve the request and notify the original requester
    const resolvedRequest = await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.candidateUpdateRequest.update({
        where: { id },
        data: {
          status: "RESOLVED",
          responseText: responseText.trim(),
          resolvedAt: new Date(),
          resolvedById: resolvedById,
        },
      });

      await tx.notification.create({
        data: {
          userId: existingRequest.requestedById,
          message: `Candidate update request resolved for ${candidateName}`,
          type: "NEUTRAL",
          isDismissed: false,
          actionUrl: `/candidates/${existingRequest.candidateId}`,
        },
      });

      return updatedRequest;
    });

    return NextResponse.json(resolvedRequest, { status: 200 });
  } catch (error: any) {
    console.error("Resolve CandidateUpdateRequest Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred while resolving the request." }, { status: 500 });
  }
}
