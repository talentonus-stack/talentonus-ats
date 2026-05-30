import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export default async function RecruiterProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/recruiter-login")
  }

  const recruiterId = (session.user as any).id

  const recruiter = await prisma.user.findUnique({
    where: { id: recruiterId }
  })

  if (!recruiter) {
    redirect("/recruiter-login")
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-light mb-8">My Profile</h1>

      <div className="bg-primary-lighter p-8 rounded-lg shadow border border-border">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4 border-b pb-6">
            <div>
              <dt className="text-sm font-medium text-muted">Full Name</dt>
              <dd className="mt-1 text-sm text-light">{recruiter.name || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Email Address</dt>
              <dd className="mt-1 text-sm text-light">{recruiter.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Mobile Number</dt>
              <dd className="mt-1 text-sm text-light">{recruiter.mobile || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Location</dt>
              <dd className="mt-1 text-sm text-light">{recruiter.location || "N/A"}</dd>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-light mb-4">Account Status</h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${recruiter.status === 'ACTIVE' ? 'bg-accent/10 text-accent' : 'bg-red-100 text-red-800'}`}>
                {recruiter.status}
              </span>
              <span className="text-sm text-muted">
                (Member since {new Date(recruiter.createdAt).toLocaleDateString()})
              </span>
            </div>
          </div>

          <div className="mt-8 bg-accent/10 p-4 rounded-md border border-accent/20">
            <p className="text-sm text-primary">
              To update your profile information or change your password, please contact the System Administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
