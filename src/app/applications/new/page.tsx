import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function NewApplicationPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  let jobs: any[] = []
  let candidates: any[] = []
  try {
    jobs = await prisma.job.findMany({ where: { status: "OPEN" }, orderBy: { title: "asc" } })
    candidates = await prisma.candidate.findMany({ orderBy: { firstName: "asc" } })
  } catch (e) {
    console.error(e)
  }

  async function createApplication(formData: FormData) {
    "use server"
    try {
      await prisma.application.create({
        data: {
          jobId: formData.get("jobId") as string,
          candidateId: formData.get("candidateId") as string,
          status: "NEW",
        }
      })
    } catch(e) {
      console.error(e)
    }
    redirect("/applications")
  }

  return (
    <div className="max-w-2xl text-black">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Create New Application</h1>
      <form action={createApplication} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Job</label>
          <select required name="jobId" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">Select a job...</option>
            {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Candidate</label>
          <select required name="candidateId" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">Select a candidate...</option>
            {candidates.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.firstName} {candidate.lastName}</option>)}
          </select>
        </div>
        <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Create Application
        </button>
      </form>
    </div>
  )
}
