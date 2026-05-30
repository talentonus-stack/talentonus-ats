import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export default async function NewCandidatePage({ searchParams }: { searchParams: Promise<{ jobId?: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }
  const recruiterId = (session.user as any).id
  const { jobId } = await searchParams;

  let activeJobs: any[] = []
  try {
    activeJobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      orderBy: { title: "asc" }
    })
  } catch (e) {
    console.error("Failed to load active jobs", e)
  }

  async function createCandidate(formData: FormData) {
    "use server"
    const authSession = await getServerSession(authOptions)
    if (!authSession) throw new Error("Unauthorized")
    try {
      const selectedJobId = formData.get("jobId") as string

      const candidate = await prisma.candidate.create({
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
          recruiterId,
        }
      })

      if (selectedJobId) {
        await prisma.application.create({
          data: {
            jobId: selectedJobId,
            candidateId: candidate.id,
            status: "SUBMITTED"
          }
        })
      }
    } catch(e) {
      console.error(e)
    }

    redirect("/recruiter/candidates")
  }

  return (
    <div className="max-w-4xl animate-fade-in mx-auto">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-light">Submit New Candidate</h1>

      <form action={createCandidate} className="bg-primary-lighter p-8 rounded-2xl shadow-xl border border-border">

        <div className="mb-6 border-b pb-6">
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Select Job Applied For</label>
          <select required name="jobId" defaultValue={jobId || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="">-- Please select an active job opening --</option>
            {activeJobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title} ({j.location})</option>
            ))}
          </select>
        </div>

        <h2 className="text-xl font-bold text-light mb-6 border-b border-border pb-4">Candidate Details</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">First Name</label>
            <input required type="text" name="firstName" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Last Name</label>
            <input type="text" name="lastName" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Email Address</label>
            <input required type="email" name="email" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Mobile Number</label>
            <input required type="text" name="phone" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Current Location</label>
            <input required type="text" name="currentLocation" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Total Experience</label>
            <input required type="text" name="experience" placeholder="e.g. 5 Years" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Current Salary</label>
            <input type="text" name="currentSalary" placeholder="e.g. $90k" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Expected Salary</label>
            <input required type="text" name="expectedSalary" placeholder="e.g. $110k" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Notice Period</label>
            <input required type="text" name="noticePeriod" placeholder="e.g. 30 Days" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Resume Upload (Mock/Text URL)</label>
            <input type="text" name="resumeUrl" placeholder="https://..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Key Skills</label>
            <input required type="text" name="skills" placeholder="React, Node, SQL..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Recruiter Remarks</label>
            <textarea name="remarks" rows={4} placeholder="Any notes on the candidate..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t border-border pt-8">
          <a href="/recruiter/candidates" className="rounded-lg border border-border bg-primary px-5 py-2.5 text-sm font-medium text-light hover:border-accent hover:text-accent transition-all duration-200">
            Cancel
          </a>
          <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary hover:bg-accent-hover hover:scale-[1.02] transition-all duration-200 shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]">
            Submit Candidate
          </button>
        </div>
      </form>
    </div>
  )
}
