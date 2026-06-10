import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/recruiter")
  }

  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id }
  })

  if (!job) {
    redirect("/jobs")
  }

  const companies = await prisma.company.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" }
  })

  async function updateJob(formData: FormData) {
    "use server"
    const authSession = await getServerSession(authOptions)
    if (!authSession || (authSession.user as any).role !== "ADMIN") throw new Error("Unauthorized")
    try {
      await prisma.job.update({
        where: { id },
        data: {
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
          priority: formData.get("priority") as any,
          status: formData.get("status") as any,
          gender: formData.get("gender") as any,
          vacancies: parseInt(formData.get("vacancies") as string) || 1,
          education: formData.get("education") as string,
          description: formData.get("description") as string,
        }
      })
    } catch(e) {
      console.error(e)
    }

    redirect("/jobs")
  }

  return (
    <div className="max-w-4xl animate-fade-in mx-auto">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-light">Edit Job: {job.title}</h1>
      <form action={updateJob} className="bg-primary-lighter p-8 rounded-2xl shadow-xl border border-border">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Company (Client)</label>
            <select required name="companyId" defaultValue={job.companyId || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
              <option value="">Select a Company...</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Job Title</label>
            <input required type="text" name="title" defaultValue={job.title} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Department</label>
            <input required type="text" name="department" defaultValue={job.department} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Location</label>
            <input required type="text" name="location" defaultValue={job.location} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Industry</label>
            <input type="text" name="industry" defaultValue={job.industry || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Experience</label>
            <input type="text" name="experience" defaultValue={job.experience || ""} placeholder="e.g. 2-4 Years" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Education</label>
            <input type="text" name="education" defaultValue={job.education || ""} placeholder="e.g. Bachelor's Degree" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Salary Range</label>
            <input type="text" name="salaryRange" defaultValue={job.salaryRange || ""} placeholder="e.g. ₹5,00,000 - ₹8,00,000" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Working Days</label>
            <input type="text" name="workingDays" defaultValue={job.workingDays || ""} placeholder="e.g. Mon-Fri" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Vacancies</label>
            <input required type="number" name="vacancies" defaultValue={job.vacancies} min={1} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Required Skills</label>
            <input type="text" name="skills" defaultValue={job.skills || ""} placeholder="React, Node.js, SQL..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Job Timing</label>
            <select name="jobTiming" defaultValue={job.jobTiming} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Priority</label>
            <select name="priority" defaultValue={job.priority} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Status</label>
            <select name="status" defaultValue={job.status} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
              <option value="OPEN">Open</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Gender Preference</label>
            <select name="gender" defaultValue={job.gender} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
              <option value="BOTH">Both</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Description</label>
            <textarea name="description" defaultValue={job.description || ""} rows={5} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t border-border pt-8">
          <a href="/jobs" className="rounded-lg border border-border bg-primary px-5 py-2.5 text-sm font-medium text-light hover:border-accent hover:text-accent transition-all duration-200">
            Cancel
          </a>
          <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary hover:bg-accent-hover hover:scale-[1.02] transition-all duration-200 shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
