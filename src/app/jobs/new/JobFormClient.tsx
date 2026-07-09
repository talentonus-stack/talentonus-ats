"use client"
import { useState } from "react"

export default function JobFormClient({ companies, createJob, initialData }: { companies: any[], createJob: any, initialData?: any }) {
  const [workingDays, setWorkingDays] = useState(initialData?.workingDays || "")
  const [workingHours, setWorkingHours] = useState(initialData?.workingHours || "")

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCompany = companies.find(c => c.id === e.target.value)
    if (selectedCompany) {
      setWorkingDays(selectedCompany.workingDays || "")
      setWorkingHours(selectedCompany.workingHours || "")
    }
  }

  return (
    <form action={createJob} className="bg-primary-lighter p-8 rounded-2xl shadow-xl border border-border">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Company (Client)</label>
          <select required name="companyId" defaultValue={initialData?.companyId || ""} onChange={handleCompanyChange} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="">Select a Company...</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Job Title</label>
          <input required type="text" name="title" defaultValue={initialData?.title || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Department</label>
          <input required type="text" name="department" defaultValue={initialData?.department || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Location</label>
          <input required type="text" name="location" defaultValue={initialData?.location || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Industry</label>
          <input type="text" name="industry" defaultValue={initialData?.industry || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Experience</label>
          <input type="text" name="experience" defaultValue={initialData?.experience || ""} placeholder="e.g. 2-4 Years" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Education</label>
          <input type="text" name="education" defaultValue={initialData?.education || ""} placeholder="e.g. Bachelor's Degree" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Salary Range</label>
          <input type="text" name="salaryRange" defaultValue={initialData?.salaryRange || ""} placeholder="e.g. ₹5,00,000 - ₹8,00,000" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Working Days</label>
          <input type="text" name="workingDays" value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} placeholder="e.g. Mon-Fri" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Working Hours</label>
          <input type="text" name="workingHours" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} placeholder="e.g. 9 AM - 6 PM" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Vacancies</label>
          <input required type="number" name="vacancies" defaultValue={initialData?.vacancies || 1} min={1} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Required Skills</label>
          <input type="text" name="skills" defaultValue={initialData?.skills || ""} placeholder="React, Node.js, SQL..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Employment Type</label>
          <select name="jobTiming" defaultValue={initialData?.jobTiming || "FULL_TIME"} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Priority</label>
          <select name="priority" defaultValue={initialData?.priority || "MEDIUM"} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="HIGH">High</option>
            <option value="MEDIUM" >Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Status</label>
          <select name="status" defaultValue={initialData?.status || "OPEN"} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="OPEN" >Open</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Gender Preference</label>
          <select name="gender" defaultValue={initialData?.gender || "BOTH"} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="BOTH" >Both</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Description</label>
          <textarea name="description" defaultValue={initialData?.description || ""} rows={5} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4 border-t border-border pt-8">
        <a href="/jobs" className="rounded-lg border border-border bg-primary px-5 py-2.5 text-sm font-medium text-light hover:border-accent hover:text-accent transition-all duration-200">
          Cancel
        </a>
        <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary hover:bg-accent-hover hover:scale-[1.02] transition-all duration-200 shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]">
          {initialData ? "Update Job" : "Create Job"}
        </button>
      </div>
    </form>
  )
}
