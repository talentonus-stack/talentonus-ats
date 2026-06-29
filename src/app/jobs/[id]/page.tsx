import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { ArrowLeft, Briefcase, MapPin, IndianRupee, Clock, CheckCircle, Tag, Building2, Calendar, FileText, ChevronLeft } from "lucide-react"
import { formatCreatedDate } from "@/lib/dateUtils"

export const dynamic = "force-dynamic"

export default async function ViewJobPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  const { id } = await params

  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: true }
  })

  if (!job) {
    redirect("/jobs")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-900/20 text-red-400 border-red-800/30 shadow-[0_0_10px_rgba(248,113,113,0.2)]'
      case 'MEDIUM': return 'bg-orange-900/20 text-orange-400 border-orange-800/30'
      case 'LOW': return 'bg-accent/10 text-accent border-accent/20'
      default: return 'bg-primary border-border text-muted'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-accent/10 text-accent border-accent/20 shadow-[0_0_10px_rgba(170,255,0,0.2)]'
      case 'ON_HOLD': return 'bg-orange-900/20 text-orange-400 border-orange-800/30'
      case 'CLOSED': return 'bg-red-900/20 text-red-400 border-red-800/30'
      default: return 'bg-primary border-border text-muted'
    }
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-12">
      <div className="mb-6">
        <Link href="/jobs" className="inline-flex items-center text-sm font-medium text-muted hover:text-accent transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Jobs
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-light">{job.title}</h1>
          <div className="mt-3 flex flex-wrap gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${getStatusColor(job.status)}`}>
              {job.status.replace(/_/g, ' ')}
            </span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${getPriorityColor(job.priority)}`}>
              {job.priority} PRIORITY
            </span>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary-lighter border border-border text-light">
              <Building2 className="w-3 h-3 mr-1.5 text-muted" />
              {job.company?.name || 'No Company Linked'}
            </span>
          </div>
        </div>
        <div className="flex shrink-0">
          <Link
            href={`/jobs/${job.id}/edit`}
            className="inline-flex items-center rounded-lg border border-border bg-primary-lighter px-4 py-2.5 text-sm font-semibold text-light hover:border-accent hover:text-accent transition-all duration-200"
          >
            Edit Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Job Description */}
          <div className="bg-primary-lighter rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-primary/30">
              <h2 className="text-lg font-bold text-light flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Job Description
              </h2>
            </div>
            <div className="p-6">
              <div className="text-sm text-light whitespace-pre-wrap leading-relaxed font-medium">
                {job.description || "No description provided."}
              </div>
            </div>
          </div>

          {/* Skills & Requirements */}
          <div className="bg-primary-lighter rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-primary/30">
              <h2 className="text-lg font-bold text-light flex items-center gap-2">
                <Tag className="w-5 h-5 text-accent" />
                Skills & Requirements
              </h2>
            </div>
            <div className="p-6">
              {job.skills ? (
                <div className="flex flex-wrap gap-2">
                  {job.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="inline-flex items-center rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent border border-accent/20 shadow-[0_0_10px_rgba(170,255,0,0.05)]">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No specific skills listed.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-6">

          {/* Basic Information */}
          <div className="bg-primary-lighter rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-primary/30">
              <h2 className="text-lg font-bold text-light flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent" />
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Department</span>
                <p className="text-sm text-light font-medium">{job.department}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Job Location</span>
                <p className="text-sm text-light font-medium">{job.location}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Employment Type</span>
                <p className="text-sm text-light font-medium">{job.jobTiming.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Industry</span>
                <p className="text-sm text-light font-medium">{job.industry || "Not specified"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Vacancies</span>
                  <p className="text-sm text-light font-medium">{job.vacancies}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Gender Pref.</span>
                  <p className="text-sm text-light font-medium">{job.gender}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="bg-primary-lighter rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-primary/30">
              <h2 className="text-lg font-bold text-light flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-accent" />
                Compensation & Experience
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Salary Range</span>
                <p className="text-sm text-light font-medium">{job.salaryRange || "Not disclosed"}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Experience Required</span>
                <p className="text-sm text-light font-medium">{job.experience || "Not specified"}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Education</span>
                <p className="text-sm text-light font-medium">{job.education || "Not specified"}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Working Days</span>
                <p className="text-sm text-light font-medium">{job.workingDays || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-primary-lighter rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-primary/30">
              <h2 className="text-lg font-bold text-light flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                Status Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Posted Date</span>
                <p className="text-sm text-light font-medium">{formatCreatedDate(job.postedDate)}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Last Updated</span>
                <p className="text-sm text-light font-medium">{formatCreatedDate(job.updatedAt)}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
