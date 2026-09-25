import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        description: true,
        postedDate: true,
        experience: true,
        skills: true,
        salaryRange: true,
        industry: true,
        jobTiming: true,
        workingDays: true,
        workingHours: true,
        vacancies: true,
        education: true,
        status: true, // Need this to check if OPEN
      },
    });

    if (!job || job.status !== "OPEN") {
      return NextResponse.json(
        { success: false, error: "Job not found or no longer available" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Strip status before returning
    const { status, ...publicJobData } = job;

    return NextResponse.json(
      { success: true, job: publicJobData },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Public Job Detail API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job details" },
      { status: 500, headers: corsHeaders }
    );
  }
}
