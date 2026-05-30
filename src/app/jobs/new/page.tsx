import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function NewJobPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  async function createJob(formData: FormData) {
    "use server"

    try {
      await prisma.job.create({
        data: {
          title: formData.get("title") as string,
          department: formData.get("department") as string,
          location: formData.get("location") as string,
          description: formData.get("description") as string,
        }
      })
    } catch(e) {
      console.error(e)
    }

    redirect("/jobs")
  }

  return (
    <div className="max-w-2xl text-black">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Create New Job</h1>
      <form action={createJob} className="space-y-6 bg-white p-6 rounded-lg shadow">
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
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" rows={4} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Create Job
        </button>
      </form>
    </div>
  )
}
