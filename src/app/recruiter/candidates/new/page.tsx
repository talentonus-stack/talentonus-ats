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
    <div className="max-w-4xl text-black">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Submit New Candidate</h1>

      <form action={createCandidate} className="bg-white p-6 rounded-lg shadow border border-gray-200">

        <div className="mb-6 border-b pb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Select Job Applied For</label>
          <select required name="jobId" defaultValue={jobId || ""} className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50">
            <option value="">-- Please select an active job opening --</option>
            {activeJobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title} ({j.location})</option>
            ))}
          </select>
        </div>

        <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Candidate Details</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input required type="text" name="firstName" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input type="text" name="lastName" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input required type="email" name="email" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input required type="text" name="phone" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Location</label>
            <input required type="text" name="currentLocation" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Experience</label>
            <input required type="text" name="experience" placeholder="e.g. 5 Years" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Salary</label>
            <input type="text" name="currentSalary" placeholder="e.g. $90k" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expected Salary</label>
            <input required type="text" name="expectedSalary" placeholder="e.g. $110k" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notice Period</label>
            <input required type="text" name="noticePeriod" placeholder="e.g. 30 Days" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Resume Upload (Mock/Text URL)</label>
            <input type="text" name="resumeUrl" placeholder="https://..." className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Key Skills</label>
            <input required type="text" name="skills" placeholder="React, Node, SQL..." className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Recruiter Remarks</label>
            <textarea name="remarks" rows={4} placeholder="Any notes on the candidate..." className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t pt-6">
          <a href="/recruiter/candidates" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            Cancel
          </a>
          <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Submit Candidate
          </button>
        </div>
      </form>
    </div>
  )
}
