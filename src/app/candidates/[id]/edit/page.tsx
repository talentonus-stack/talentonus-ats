import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import SubmitButton from "@/components/SubmitButton"

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { id }
  })

  if (!candidate) {
    redirect("/candidates")
  }

  async function updateCandidate(formData: FormData) {
    "use server"
    const authSession = await getServerSession(authOptions)
    if (!authSession) throw new Error("Unauthorized")
    try {
      await prisma.candidate.update({
        where: { id },
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
          resumeUrl: formData.get("resumeUrl") as string,
        }
      })
    } catch(e) {
      console.error(e)
    }
    redirect(`/candidates/${id}`)
  }

  return (
    <div className="max-w-4xl animate-fade-in mx-auto">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-light">Edit Candidate: {candidate.firstName}</h1>

      <form action={updateCandidate} className="bg-primary-lighter p-8 rounded-2xl shadow-xl border border-border">

        <h2 className="text-xl font-bold text-light mb-6 border-b border-border pb-4">Candidate Details</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">First Name</label>
            <input required type="text" name="firstName" defaultValue={candidate.firstName} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Last Name</label>
            <input type="text" name="lastName" defaultValue={candidate.lastName || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Email Address</label>
            <input required type="email" name="email" defaultValue={candidate.email} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Mobile Number</label>
            <input type="text" name="phone" defaultValue={candidate.phone || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Current Location</label>
            <input type="text" name="currentLocation" defaultValue={candidate.currentLocation || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Total Experience</label>
            <input type="text" name="experience" defaultValue={candidate.experience || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Current Salary</label>
            <input type="text" name="currentSalary" defaultValue={candidate.currentSalary || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Expected Salary</label>
            <input type="text" name="expectedSalary" defaultValue={candidate.expectedSalary || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Notice Period</label>
            <input type="text" name="noticePeriod" defaultValue={candidate.noticePeriod || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Resume URL</label>
            <input type="text" name="resumeUrl" defaultValue={candidate.resumeUrl || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Key Skills</label>
            <input type="text" name="skills" defaultValue={candidate.skills || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Remarks</label>
            <textarea name="remarks" rows={4} defaultValue={candidate.remarks || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t border-border pt-8">
          <a href={`/candidates/${id}`} className="rounded-lg border border-border bg-primary px-5 py-2.5 text-sm font-medium text-light hover:border-accent hover:text-accent transition-all duration-200">
            Cancel
          </a>
        <SubmitButton
          type="submit"
          loadingText="Saving..."
          className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-bold text-primary hover:bg-accent-hover hover:scale-[1.02] transition-all duration-200 shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)] flex justify-center items-center disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
            Save Changes
        </SubmitButton>
        </div>
      </form>
    </div>
  )
}
