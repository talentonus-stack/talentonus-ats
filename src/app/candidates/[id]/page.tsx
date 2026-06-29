import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export default async function CandidateDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const formatSalary = (salary: string | null) => {
    if (!salary) return "N/A"
    if (salary.includes("₹")) return salary
    const cleaned = salary.replace(/\$/g, "")
    const num = parseFloat(cleaned.replace(/,/g, ""))
    if (!isNaN(num)) {
       return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 21 }).format(num)
    }
    return `₹${cleaned}`
  }
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      recruiter: true,
      applications: {
        include: { job: true },
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!candidate) {
    redirect("/candidates")
  }

  const latestApp = candidate.applications[0];

  return (
    <div className="max-w-5xl mx-auto text-light">
      <div className="flex justify-between items-end mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-light">{candidate.firstName} {candidate.lastName || ''}</h1>
          <p className="text-sm text-muted mt-1">Candidate Profile Details</p>
        </div>
        <div className="flex space-x-3">
          <a href={`/candidates/${id}/edit`} className="bg-primary-lighter border border-border text-light px-4 py-2 rounded-md hover:bg-primary font-medium text-sm">
            Edit
          </a>
          <a href="/candidates" className="text-sm font-medium text-accent hover:text-accent-hover py-2">
            &larr; Back
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-primary-lighter rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-light mb-4 border-b pb-2">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-muted uppercase">Full Name</span>
              <p className="text-sm font-medium">{candidate.firstName} {candidate.lastName || ''}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted uppercase">Email</span>
              <p className="text-sm font-medium">{candidate.email}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted uppercase">Phone</span>
              <p className="text-sm font-medium">{candidate.phone || 'N/A'}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted uppercase">Current Location</span>
              <p className="text-sm font-medium">{candidate.currentLocation || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-primary-lighter rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-light mb-4 border-b pb-2">Professional Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-semibold text-muted uppercase">Experience</span>
                <p className="text-sm font-medium">{candidate.experience || 'N/A'}</p>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted uppercase">Notice Period</span>
                <p className="text-sm font-medium">{candidate.noticePeriod || 'N/A'}</p>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted uppercase">Current Salary</span>
                <p className="text-sm font-medium">{formatSalary(candidate.currentSalary)}</p>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted uppercase">Expected Salary</span>
                <p className="text-sm font-medium">{formatSalary(candidate.expectedSalary)}</p>
              </div>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted uppercase">Skills</span>
              <div className="mt-1 bg-primary p-3 rounded border text-sm">{candidate.skills || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Application Information */}
        <div className="bg-primary-lighter rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-light mb-4 border-b pb-2">Application Information</h2>
          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-muted uppercase">Applied Job</span>
              <p className="text-sm font-medium">{latestApp ? latestApp.job.title : 'No active applications'}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted uppercase">Application Status</span>
              <p className="text-sm mt-1">
                {latestApp ? (
                  <span className="inline-flex rounded-full bg-accent px-3 py-1 font-semibold leading-5 text-primary">
                    {latestApp.status.replace(/_/g, ' ')}
                  </span>
                ) : 'N/A'}
              </p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted uppercase">Submitted By (Recruiter)</span>
              <p className="text-sm font-medium">{candidate.recruiter ? candidate.recruiter.name : 'System/Admin'}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted uppercase">Submitted Date</span>
              <p className="text-sm font-medium">{new Date(candidate.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-primary-lighter rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-light mb-4 border-b pb-2">Additional Information</h2>
          <div className="space-y-6">
            <div>
              <span className="block text-xs font-semibold text-muted uppercase mb-2">Remarks</span>
              <div className="bg-orange-900/20 p-4 rounded border border-orange-800/30 text-sm text-orange-400 whitespace-pre-wrap">
                {candidate.remarks || 'No remarks provided.'}
              </div>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted uppercase mb-2">Portfolio</span>
              {candidate.portfolioUrl ? (
                <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:text-accent-hover underline break-all">
                  {candidate.portfolioUrl}
                </a>
              ) : (
                <span className="text-sm text-muted">No portfolio link provided</span>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <span className="block text-xs font-semibold text-muted uppercase mb-4">Resume</span>
            {candidate.resumeUrl ? (
              <div className="flex gap-4 items-center">
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium bg-primary border border-border px-4 py-2 rounded text-light hover:text-accent hover:border-accent transition-colors"
                >
                  View Resume
                </a>
                <a
                  href={candidate.resumeUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium bg-primary border border-border px-4 py-2 rounded text-light hover:text-accent hover:border-accent transition-colors"
                >
                  Download Resume
                </a>
                {candidate.resumeFileName && <span className="text-xs text-muted">({candidate.resumeFileName})</span>}
              </div>
            ) : (
              <span className="text-sm text-muted">No resume uploaded</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
