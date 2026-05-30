import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export default async function NewRecruiterPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  async function createRecruiter(formData: FormData) {
    "use server"
    try {
      const plainPassword = formData.get("password") as string
      const hashedPassword = await bcrypt.hash(plainPassword, 10)

      await prisma.user.create({
        data: {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          password: hashedPassword,
          mobile: formData.get("mobile") as string,
          location: formData.get("location") as string,
          status: formData.get("status") as any,
          role: "RECRUITER",
        }
      })
    } catch(e) {
      console.error(e)
    }
    redirect("/recruiters")
  }

  return (
    <div className="max-w-2xl text-black">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Add New Recruiter</h1>
      <form action={createRecruiter} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input required type="text" name="name" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input required type="email" name="email" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input required type="password" name="password" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input required type="text" name="mobile" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" name="location" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" defaultValue="ACTIVE" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t pt-4">
          <a href="/recruiters" className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">Cancel</a>
          <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Save Recruiter</button>
        </div>
      </form>
    </div>
  )
}
