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
    const authSession = await getServerSession(authOptions)
    if (!authSession || (authSession.user as any).role !== "ADMIN") throw new Error("Unauthorized")
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
    <div className="max-w-2xl animate-fade-in mx-auto">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-light">Add New Recruiter</h1>
      <form action={createRecruiter} className="space-y-6 bg-primary-lighter p-8 rounded-2xl shadow-xl border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Name</label>
            <input required type="text" name="name" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Email</label>
            <input required type="email" name="email" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Password</label>
            <input required type="password" name="password" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Mobile Number</label>
            <input required type="text" name="mobile" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Location</label>
            <input type="text" name="location" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Status</label>
            <select name="status" defaultValue="ACTIVE" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4 border-t border-border pt-8">
          <a href="/recruiters" className="rounded-lg border border-border bg-primary px-5 py-2.5 text-sm font-medium text-light hover:border-accent hover:text-accent transition-all duration-200">Cancel</a>
          <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary hover:bg-accent-hover hover:scale-[1.02] transition-all duration-200 shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]">Save Recruiter</button>
        </div>
      </form>
    </div>
  )
}
