"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewCandidateClientForm({ activeJobs, jobId, returnUrl = "/recruiter/candidates" }: { activeJobs: any[], jobId?: string, returnUrl?: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const file = formData.get("resumeFile") as File

    if (!file || file.size === 0) {
      alert("Resume attachment is required.");
      return;
    }

    setIsSubmitting(true)
    setError("")

    let filePath = null
    let fileName = null

    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File too large. Maximum size is 5MB.")
        setIsSubmitting(false)
        return
      }

      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
         setError("Invalid file type. Only PDF, DOC, and DOCX are allowed.")
         setIsSubmitting(false)
         return
      }

      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData
        })

        if (!uploadRes.ok) {
           const errData = await uploadRes.json()
           setError(errData.error || "Upload failed.")
           setIsSubmitting(false)
           return
        }

        const data = await uploadRes.json()
        filePath = data.filePath
        fileName = data.fileName
      } catch (err) {
        console.error(err)
        setError("Upload failed.")
        setIsSubmitting(false)
        return
      }
    }

    if (filePath) {
      formData.set("resumeUrl", filePath)
      if (fileName) formData.set("resumeFileName", fileName)
    }

    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        router.push(returnUrl)
        router.refresh()
      } else {
        const errData = await res.json()
        setError(errData.error || "Failed to create candidate.")
      }
    } catch (err) {
       console.error(err)
       setError("Something went wrong.")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="max-w-4xl animate-fade-in mx-auto">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-light">Submit New Candidate</h1>

      {error && <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-primary-lighter p-8 rounded-2xl shadow-xl border border-border">

        <div className="mb-6 border-b pb-6">
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Select Job Applied For</label>
          <select required name="jobId" defaultValue={jobId || ""} className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200">
            <option value="">-- Please select an active job opening --</option>
            {activeJobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title} ({j.location})</option>
            ))}
          </select>
        </div>

        <h2 className="text-xl font-bold text-light mb-6 border-b border-border pb-4">Candidate Details</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">First Name</label>
            <input required type="text" name="firstName" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Last Name</label>
            <input type="text" name="lastName" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Email Address</label>
            <input required type="email" name="email" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Mobile Number</label>
            <input required type="text" name="phone" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Current Location</label>
            <input required type="text" name="currentLocation" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Total Experience</label>
            <input required type="text" name="experience" placeholder="e.g. 5 Years" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Current Salary</label>
            <input type="text" name="currentSalary" placeholder="e.g. ₹10,00,000" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Expected Salary</label>
            <input required type="text" name="expectedSalary" placeholder="e.g. ₹15,00,000" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Notice Period</label>
            <input required type="text" name="noticePeriod" placeholder="e.g. 30 Days" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Portfolio / Profile URL</label>
            <input type="url" name="portfolioUrl" placeholder="https://linkedin.com/in/..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Key Skills</label>
            <input required type="text" name="skills" placeholder="React, Node, SQL..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Resume Upload (PDF, DOC, DOCX - Max 5MB)</label>
            <input type="file" name="resumeFile" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Recruiter Remarks</label>
            <textarea name="remarks" rows={4} placeholder="Any notes on the candidate..." className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t border-border pt-8">
          <a href={returnUrl} className="rounded-lg border border-border bg-primary px-5 py-2.5 text-sm font-medium text-light hover:border-accent hover:text-accent transition-all duration-200">
            Cancel
          </a>
          <button disabled={isSubmitting} type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary hover:bg-accent-hover hover:scale-[1.02] transition-all duration-200 shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)] disabled:opacity-50">
            {isSubmitting ? "Submitting..." : "Submit Candidate"}
          </button>
        </div>
      </form>
    </div>
  )
}
