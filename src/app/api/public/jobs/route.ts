import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Allowed origins for CORS (could be restricted in production)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Filters
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const department = searchParams.get("department");
    const experience = searchParams.get("experience");
    const jobTiming = searchParams.get("jobTiming");
    const industry = searchParams.get("industry");

    // Pagination / Limit
    const limitParam = searchParams.get("limit");
    let limit: number | undefined = undefined;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
      }
    }

    const whereClause: any = {
      status: "OPEN",
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (location) {
      whereClause.location = { contains: location, mode: "insensitive" };
    }
    if (department) {
      whereClause.department = { contains: department, mode: "insensitive" };
    }
    if (experience) {
      whereClause.experience = { contains: experience, mode: "insensitive" };
    }
    if (jobTiming) {
      whereClause.jobTiming = jobTiming;
    }
    if (industry) {
      whereClause.industry = { contains: industry, mode: "insensitive" };
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
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
      },
      orderBy: {
        postedDate: "desc",
      },
      take: limit,
    });

    return NextResponse.json(
      { success: true, jobs },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Public Jobs API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500, headers: corsHeaders }
    );
  }
}
