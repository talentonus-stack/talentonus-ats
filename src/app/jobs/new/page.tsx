import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import NewJobClientForm from "./NewJobClientForm"

export default async function NewJobPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/recruiter")
  }

  const companies = await prisma.company.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" }
  })

  async function createJob(formData: FormData) {
    "use server"
    const authSession = await getServerSession(authOptions)
    if (!authSession || (authSession.user as any).role !== "ADMIN") throw new Error("Unauthorized")
    try {
      await prisma.$transaction(async (tx) => {
        // Calculate current 2-digit year using Asia/Kolkata timezone
        const yearPart = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
        }).formatToParts(new Date()).find((part) => part.type === "year");

        if (!yearPart) {
          throw new Error("Unable to determine the business year.");
        }

        const currentYear2Digit = Number(yearPart.value) % 100;

        // Atomically fetch and increment the sequence for the current year
        const result = await tx.$queryRaw<{ lastNumber: number }[]>`
          INSERT INTO "JobSequence" ("year", "lastNumber")
          VALUES (${currentYear2Digit}, 1)
          ON CONFLICT ("year")
          DO UPDATE SET "lastNumber" = "JobSequence"."lastNumber" + 1
          RETURNING "lastNumber";
        `

        const nextNumber = result[0].lastNumber
        const jobRef = `TN-${currentYear2Digit}${String(nextNumber).padStart(3, '0')}`

        await tx.job.create({
          data: {
            jobReference: jobRef,
            title: formData.get("title") as string,
            companyId: formData.get("companyId") as string || null,
            department: formData.get("department") as string,
            location: formData.get("location") as string,
            experience: formData.get("experience") as string,
            skills: formData.get("skills") as string,
            salaryRange: formData.get("salaryRange") as string,
            industry: formData.get("industry") as string,
            jobTiming: formData.get("jobTiming") as any,
            workingDays: formData.get("workingDays") as string,
            workingHours: formData.get("workingHours") as string,
            priority: formData.get("priority") as any,
            status: formData.get("status") as any,
            gender: formData.get("gender") as any,
            vacancies: parseInt(formData.get("vacancies") as string) || 1,
            education: formData.get("education") as string,
            description: formData.get("description") as string,
          }
        })
      })
    } catch(e) {
      console.error(e)
    }

    redirect("/jobs")
  }

  return (
    <div className="max-w-4xl animate-fade-in mx-auto">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-light">Create New Job</h1>
      <NewJobClientForm companies={companies} createJobAction={createJob} />
    </div>
  )
}
