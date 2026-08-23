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
