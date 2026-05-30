import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

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
    <div className="max-w-4xl text-black">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Edit Candidate: {candidate.firstName}</h1>

      <form action={updateCandidate} className="bg-white p-6 rounded-lg shadow border border-gray-200">

        <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Candidate Details</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input required type="text" name="firstName" defaultValue={candidate.firstName} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input type="text" name="lastName" defaultValue={candidate.lastName || ""} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input required type="email" name="email" defaultValue={candidate.email} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input type="text" name="phone" defaultValue={candidate.phone || ""} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Location</label>
            <input type="text" name="currentLocation" defaultValue={candidate.currentLocation || ""} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Experience</label>
            <input type="text" name="experience" defaultValue={candidate.experience || ""} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Salary</label>
            <input type="text" name="currentSalary" defaultValue={candidate.currentSalary || ""} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expected Salary</label>
            <input type="text" name="expectedSalary" defaultValue={candidate.expectedSalary || ""} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notice Period</label>
            <input type="text" name="noticePeriod" defaultValue={candidate.noticePeriod || ""} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Resume URL</label>
            <input type="text" name="resumeUrl" defaultValue={candidate.resumeUrl || ""} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Key Skills</label>
            <input type="text" name="skills" defaultValue={candidate.skills || ""} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Remarks</label>
            <textarea name="remarks" rows={4} defaultValue={candidate.remarks || ""} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t pt-6">
          <a href={`/candidates/${id}`} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            Cancel
          </a>
          <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
