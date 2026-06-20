import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth/next"

import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function NewCandidatePage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/recruiter")
  }

  async function createCandidate(formData: FormData) {
    "use server"
    const authSession = await getServerSession(authOptions)
    if (!authSession) throw new Error("Unauthorized")
    try {
      await prisma.candidate.create({
        data: {
          firstName: formData.get("firstName") as string,
          lastName: formData.get("lastName") as string,
          email: formData.get("email") as string,
          phone: formData.get("phone") as string,
        }
      })
    } catch(e) {
      console.error(e)
    }

    redirect("/candidates")
  }

  return (
    <div className="max-w-2xl animate-fade-in mx-auto">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-light">Add New Candidate</h1>
      <form action={createCandidate} className="space-y-6 bg-primary-lighter p-8 rounded-2xl shadow-xl border border-border">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">First Name</label>
            <input required type="text" name="firstName" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Last Name</label>
            <input required type="text" name="lastName" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Email</label>
          <input required type="email" name="email" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Phone</label>
          <input type="tel" name="phone" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>
        <button type="submit" className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-bold text-primary hover:bg-[#E8952C] hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg">
          Save Candidate
        </button>
      </form>
    </div>
  )
}
