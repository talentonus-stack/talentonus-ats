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
          commissionPercentage: formData.get("commissionPercentage") ? parseFloat(formData.get("commissionPercentage") as string) : 0,
          paymentTermsDays: formData.get("paymentTermsDays") ? parseInt(formData.get("paymentTermsDays") as string) : null,
          paymentReleaseCondition: formData.get("paymentReleaseCondition") as string || null,
          recruiterType: formData.get("recruiterType") as string || null,
          agreementSigned: formData.get("agreementSigned") === "true",
          agreementDate: formData.get("agreementDate") ? new Date(formData.get("agreementDate") as string) : null,
          agreementExpiryDate: formData.get("agreementExpiryDate") ? new Date(formData.get("agreementExpiryDate") as string) : null,
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
            <input type="text" name="location"  className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Status</label>
            <select name="status" defaultValue="ACTIVE" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-border mt-6">
          <h3 className="text-lg font-bold text-light mb-4">Commercial & Payment Terms (Admin Only)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Commission Percentage (%)</label>
              <input
                type="number"
                step="0.01"
                name="commissionPercentage"
                defaultValue={0}
                className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
                placeholder="e.g. 50"
              />
              <p className="text-xs text-muted mt-2">Percentage of the placement value.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Payment Terms (Days)</label>
              <input
                type="number"
                name="paymentTermsDays"

                className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
                placeholder="e.g. 30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Payment Release Condition</label>
              <select
                name="paymentReleaseCondition"

                className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
              >
                <option value="">Select Condition</option>
                <option value="After Candidate Joins">After Candidate Joins</option>
                <option value="After Client Payment Received">After Client Payment Received</option>
                <option value="After Replacement Period Complete">After Replacement Period Complete</option>
                <option value="Manual Approval by Admin">Manual Approval by Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Recruiter Type</label>
              <select
                name="recruiterType"

                className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
              >
                <option value="">Select Type</option>
                <option value="Internal Recruiter">Internal Recruiter</option>
                <option value="Freelance Recruiter">Freelance Recruiter</option>
                <option value="Partner Agency">Partner Agency</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Agreement Signed</label>
              <select
                name="agreementSigned"
                defaultValue="false"
                className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Agreement Date</label>
              <input
                type="date"
                name="agreementDate"

                className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Agreement Expiry Date</label>
              <input
                type="date"
                name="agreementExpiryDate"

                className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4 border-t border-border pt-8">
          <a href="/recruiters" className="rounded-lg border border-border bg-primary px-5 py-2.5 text-sm font-medium text-light hover:border-accent hover:text-accent transition-all duration-200">Cancel</a>
          <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary hover:bg-[#E8952C] hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg">Save Recruiter</button>
        </div>
      </form>
    </div>
  )
}
