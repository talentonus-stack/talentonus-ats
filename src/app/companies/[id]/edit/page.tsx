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
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    const name = formData.get("name") as string
    const industry = formData.get("industry") as string
    const website = formData.get("website") as string
    const contactPerson = formData.get("contactPerson") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const notes = formData.get("notes") as string
    const status = formData.get("status") as any

    const isConfidential = formData.get("isConfidential") === "on"
    const totalEmployees = formData.get("totalEmployees") as string
    const workingDays = formData.get("workingDays") as string
    const workingHours = formData.get("workingHours") as string
    const location = formData.get("location") as string
    const clientSince = formData.get("clientSince") ? new Date(formData.get("clientSince") as string) : undefined

    const round1Name = formData.get("round1Name") as string
    const round1Desc = formData.get("round1Desc") as string
    const round2Name = formData.get("round2Name") as string
    const round2Desc = formData.get("round2Desc") as string
    const round3Name = formData.get("round3Name") as string
    const round3Desc = formData.get("round3Desc") as string
    const finalRoundName = formData.get("finalRoundName") as string
    const finalRoundDesc = formData.get("finalRoundDesc") as string


    const recruitmentFeePercentage = formData.get("recruitmentFeePercentage") as string
    const paymentTermsDays = formData.get("paymentTermsDays") as string
    const replacementPeriodDays = formData.get("replacementPeriodDays") as string
    const gstApplicable = formData.get("gstApplicable") === "true"
    const clientAgreementSigned = formData.get("clientAgreementSigned") === "true"
    const agreementExpiryDate = formData.get("agreementExpiryDate") as string
    const commercialRemarks = formData.get("commercialRemarks") as string

    await prisma.company.update({
      where: { id },
      data: {
        name,
        industry,
        website,
        contactPerson,
        email,
        phone,
        notes,
        status: status || "ACTIVE",
        isConfidential,
        totalEmployees,
        workingDays,
        workingHours,
        location,
        clientSince,
        round1Name,
        round1Desc,
        round2Name,
        round2Desc,
        round3Name,
        round3Desc,
        finalRoundName,
        finalRoundDesc,

        recruitmentFeePercentage: recruitmentFeePercentage ? parseFloat(recruitmentFeePercentage) : null,
        paymentTermsDays: paymentTermsDays ? parseInt(paymentTermsDays) : null,
        replacementPeriodDays: replacementPeriodDays ? parseInt(replacementPeriodDays) : null,
        gstApplicable,
        clientAgreementSigned,
        agreementExpiryDate: agreementExpiryDate ? new Date(agreementExpiryDate) : null,
        commercialRemarks: commercialRemarks || null,
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

          <div className="sm:col-span-2 flex items-center gap-3">
            <input type="checkbox" name="isConfidential" id="isConfidential" defaultChecked={company.isConfidential} className="w-4 h-4 rounded border-border bg-primary text-accent focus:ring-accent focus:ring-offset-primary" />
            <label htmlFor="isConfidential" className="text-sm font-medium text-light">Mark as Confidential Client (Hide name from recruiters)</label>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Industry</label>
            <input type="text" name="industry" defaultValue={company.industry || ""} placeholder="e.g. Technology, Finance" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Website</label>
            <input type="url" name="website" defaultValue={company.website || ""} placeholder="https://..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Location / HQ</label>
            <input type="text" name="location" defaultValue={company.location || ""} placeholder="e.g. Mumbai, India" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Total Employees</label>
            <input type="text" name="totalEmployees" defaultValue={company.totalEmployees || ""} placeholder="e.g. 50-200" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Working Days</label>
            <input type="text" name="workingDays" defaultValue={company.workingDays || ""} placeholder="e.g. Mon-Fri" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Working Hours</label>
            <input type="text" name="workingHours" defaultValue={company.workingHours || ""} placeholder="e.g. 10:00 AM - 7:00 PM" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Client Since Date</label>
            <input type="date" name="clientSince" defaultValue={company.clientSince ? company.clientSince.toISOString().split('T')[0] : ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Status</label>
            <select name="status" defaultValue={company.status} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <h3 className="sm:col-span-2 text-lg font-bold text-light mt-4 border-b border-border pb-2">Contact Information</h3>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Contact Person</label>
            <input type="text" name="contactPerson" defaultValue={company.contactPerson || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Phone Number</label>
            <input type="text" name="phone" defaultValue={company.phone || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Email Address</label>
            <input type="email" name="email" defaultValue={company.email || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <h3 className="sm:col-span-2 text-lg font-bold text-light mt-4 border-b border-border pb-2">Interview Process</h3>

          <div className="bg-primary/50 p-4 rounded-xl border border-border/50">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Round 1 Name</label>
            <input type="text" name="round1Name" defaultValue={company.round1Name || ""} placeholder="e.g. Technical Interview" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
            <textarea name="round1Desc" defaultValue={company.round1Desc || ""} rows={2} placeholder="Notes for Round 1..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted mt-2 focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div className="bg-primary/50 p-4 rounded-xl border border-border/50">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Round 2 Name</label>
            <input type="text" name="round2Name" defaultValue={company.round2Name || ""} placeholder="e.g. HR Interview" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
            <textarea name="round2Desc" defaultValue={company.round2Desc || ""} rows={2} placeholder="Notes for Round 2..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted mt-2 focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div className="bg-primary/50 p-4 rounded-xl border border-border/50">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Round 3 Name</label>
            <input type="text" name="round3Name" defaultValue={company.round3Name || ""} placeholder="e.g. Department Head Discussion" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
            <textarea name="round3Desc" defaultValue={company.round3Desc || ""} rows={2} placeholder="Notes for Round 3..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted mt-2 focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div className="bg-primary/50 p-4 rounded-xl border border-border/50">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Final Round Name</label>
            <input type="text" name="finalRoundName" defaultValue={company.finalRoundName || ""} placeholder="e.g. Director Approval" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
            <textarea name="finalRoundDesc" defaultValue={company.finalRoundDesc || ""} rows={2} placeholder="Notes for Final Round..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted mt-2 focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div className="sm:col-span-2 mt-4 border-t border-border pt-4">
            <h3 className="text-lg font-bold text-light mb-4">Internal Client Notes</h3>
            <p className="text-xs text-muted mb-2">Admin-only section. Used for client preferences, hiring instructions, feedback process, and internal remarks. Recruiters cannot see this section.</p>
            <textarea name="notes" defaultValue={company.notes || ""} rows={4} placeholder="Any confidential notes about the company..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          {/* Commercial Terms (Admin Only) */}
          <div className="sm:col-span-2 pt-6 border-t border-border mt-6">
            <h3 className="text-lg font-bold text-light mb-4">Commercial Terms (Admin Only)</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Recruitment Fee (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="recruitmentFeePercentage"
                  defaultValue={company.recruitmentFeePercentage || ''}
                  className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
                  placeholder="e.g. 8.33"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Payment Terms (Days)</label>
                <input
                  type="number"
                  name="paymentTermsDays"
                  defaultValue={company.paymentTermsDays || ''}
                  className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
                  placeholder="e.g. 30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Replacement Period (Days)</label>
                <input
                  type="number"
                  name="replacementPeriodDays"
                  defaultValue={company.replacementPeriodDays || ''}
                  className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
                  placeholder="e.g. 90"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">GST Applicable</label>
                <select
                  name="gstApplicable"
                  defaultValue={company.gstApplicable ? "true" : "false"}
                  className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Client Agreement Signed</label>
                <select
                  name="clientAgreementSigned"
                  defaultValue={company.clientAgreementSigned ? "true" : "false"}
                  className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Agreement Expiry Date</label>
                <input
                  type="date"
                  name="agreementExpiryDate"
                  defaultValue={company.agreementExpiryDate ? new Date(company.agreementExpiryDate).toISOString().split("T")[0] : ""}
                  className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Commercial Remarks</label>
              <textarea
                name="commercialRemarks"
                rows={2}
                defaultValue={company.commercialRemarks || ''}
                className="w-full bg-primary border border-border rounded-lg p-3 text-sm text-light focus:outline-none focus:border-accent"
                placeholder="Specific billing or commercial notes..."
              ></textarea>
            </div>
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
