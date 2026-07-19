"use client"

import { useState } from "react"

export default function NewJobClientForm({ companies, createJobAction }: { companies: any[], createJobAction: (formData: FormData) => void }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [workingDays, setWorkingDays] = useState("")
  const [workingHours, setWorkingHours] = useState("")

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSelectedCompanyId(id)

    if (id) {
      const company = companies.find(c => c.id === id)
      if (company) {
        setWorkingDays(company.workingDays || "")
        setWorkingHours(company.workingHours || "")
      }
    } else {
      setWorkingDays("")
      setWorkingHours("")
    }
  }

  return (
    <form action={createJobAction} className="bg-primary-lighter p-8 rounded-2xl shadow-xl border border-border">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Company (Client)</label>
          <select required name="companyId" value={selectedCompanyId} onChange={handleCompanyChange} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="">Select a Company...</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Job Title</label>
          <input required type="text" name="title" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Department</label>
          <input required type="text" name="department" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Location</label>
          <input required type="text" name="location" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Industry</label>
          <input type="text" name="industry" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Experience</label>
          <input type="text" name="experience" placeholder="e.g. 2-4 Years" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Education</label>
          <input type="text" name="education" placeholder="e.g. Bachelor's Degree" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Salary Range</label>
          <input type="text" name="salaryRange" placeholder="e.g. ₹5,00,000 - ₹8,00,000" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Working Days</label>
          <input type="text" name="workingDays" value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} placeholder="e.g. Mon-Fri" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Working Hours</label>
          <input type="text" name="workingHours" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} placeholder="e.g. 9:00 AM - 6:00 PM" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Vacancies</label>
          <input required type="number" name="vacancies" defaultValue={1} min={1} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Required Skills</label>
          <input type="text" name="skills" placeholder="React, Node.js, SQL..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Employment Type</label>
          <select name="jobTiming" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Priority</label>
          <select name="priority" defaultValue="MEDIUM" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="HIGH">High</option>
            <option value="MEDIUM" >Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Status</label>
          <select name="status" defaultValue="OPEN" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="OPEN" >Open</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Gender Preference</label>
          <select name="gender" defaultValue="BOTH" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="BOTH" >Both</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Description</label>
          <textarea name="description" rows={5} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4 border-t border-border pt-8">
        <a href="/jobs" className="rounded-lg border border-border bg-primary px-5 py-2.5 text-sm font-medium text-light hover:border-accent hover:text-accent transition-all duration-200">
          Cancel
        </a>
        <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary hover:bg-accent-hover hover:scale-[1.02] transition-all duration-200 shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)]">
          Create Job
        </button>
      </div>
    </form>
  )
}
