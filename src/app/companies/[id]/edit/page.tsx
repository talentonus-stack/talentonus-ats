import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  const { id } = await params
  const company = await prisma.company.findUnique({
    where: { id }
  })

  if (!company) notFound()

  async function updateCompany(formData: FormData) {
    "use server"
    await prisma.company.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        industry: formData.get("industry") as string,
        website: formData.get("website") as string,
        contactPerson: formData.get("contactPerson") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        notes: formData.get("notes") as string,
        status: formData.get("status") as any
      }
    })
    redirect("/companies")
  }

  return (
    <div className="max-w-3xl animate-fade-in mx-auto">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-light">Edit Company</h1>

      <form action={updateCompany} className="bg-primary-lighter p-8 rounded-2xl shadow-xl border border-border">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Company Name *</label>
            <input required type="text" name="name" defaultValue={company.name} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Industry</label>
            <input type="text" name="industry" defaultValue={company.industry || ""} placeholder="e.g. Technology, Finance" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Website</label>
            <input type="url" name="website" defaultValue={company.website || ""} placeholder="https://..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <h3 className="sm:col-span-2 text-lg font-bold text-light mt-4 border-b border-border pb-2">Contact Information</h3>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Contact Person</label>
            <input type="text" name="contactPerson" defaultValue={company.contactPerson || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Status</label>
            <select name="status" defaultValue={company.status} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Email Address</label>
            <input type="email" name="email" defaultValue={company.email || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Phone Number</label>
            <input type="text" name="phone" defaultValue={company.phone || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div className="sm:col-span-2 mt-4">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Internal Notes</label>
            <textarea name="notes" rows={4} defaultValue={company.notes || ""} placeholder="Any confidential notes about the company..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t border-border pt-8">
          <a href="/companies" className="rounded-lg border border-border bg-primary px-5 py-2.5 text-sm font-medium text-light hover:border-accent hover:text-accent transition-all duration-200">
            Cancel
          </a>
          <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary hover:bg-accent-hover hover:scale-[1.02] transition-all duration-200 shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]">
            Update Company
          </button>
        </div>
      </form>
    </div>
  )
}
