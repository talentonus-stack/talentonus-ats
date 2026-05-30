import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export default async function NewJobPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/recruiter")
  }

  async function createJob(formData: FormData) {
    "use server"

    try {
      await prisma.job.create({
        data: {
          title: formData.get("title") as string,
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
    <div className="max-w-4xl text-black">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Create New Job</h1>
      <form action={createJob} className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
            <input required type="text" name="title" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input required type="text" name="department" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input required type="text" name="location" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Industry</label>
            <input type="text" name="industry" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Experience</label>
            <input type="text" name="experience" placeholder="e.g. 2-4 Years" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Education</label>
            <input type="text" name="education" placeholder="e.g. Bachelor's Degree" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Salary Range</label>
            <input type="text" name="salaryRange" placeholder="e.g. $80k - $100k" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Working Days</label>
            <input type="text" name="workingDays" placeholder="e.g. Mon-Fri" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vacancies</label>
            <input required type="number" name="vacancies" defaultValue={1} min={1} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Required Skills</label>
            <input type="text" name="skills" placeholder="React, Node.js, SQL..." className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job Timing</label>
            <select name="jobTiming" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select name="priority" defaultValue="MEDIUM" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="HIGH">High</option>
              <option value="MEDIUM" >Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" defaultValue="OPEN" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="OPEN" >Open</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender Preference</label>
            <select name="gender" defaultValue="BOTH" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="BOTH" >Both</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" rows={5} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t pt-6">
          <a href="/jobs" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            Cancel
          </a>
          <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Create Job
          </button>
        </div>
      </form>
    </div>
  )
}
