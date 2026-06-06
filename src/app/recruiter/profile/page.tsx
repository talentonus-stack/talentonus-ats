import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { timeAgo } from "@/lib/dateUtils"
import ProfileClientView from "./ProfileClientView"

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

  // Fetch applications tied to candidates submitted by this recruiter
  const applications = await prisma.application.findMany({
    where: {
      candidate: {
        recruiterId: recruiterId
      }
    },
    include: {
      job: true,
      candidate: true
    },
    orderBy: { updatedAt: 'desc' }
  })

  // Placement Statistics
  const totalSubmitted = applications.length
  const interviewed = applications.filter(a => ['INTERVIEW_SCHEDULED', 'L1_CLEARED', 'L2_CLEARED', 'SELECTED', 'JOINED'].includes(a.status)).length
  const selected = applications.filter(a => a.status === "SELECTED" || a.status === "JOINED").length
  const joined = applications.filter(a => a.status === "JOINED").length

  const selectionRatio = totalSubmitted > 0 ? Math.round((selected / totalSubmitted) * 100) : 0
  const joiningRatio = selected > 0 ? Math.round((joined / selected) * 100) : 0

  // Placement Earnings Data (Mock logic based on joined candidates)
  // Assuming average placement fee commission is ₹50,000 per joined candidate
  const commissionPerJoin = 50000;
  const totalPlacements = joined;
  const totalRevenue = totalPlacements * (commissionPerJoin * 5); // Example: total client billing
  const totalCommissionEarned = totalPlacements * commissionPerJoin;
  const commissionReceived = Math.floor(totalCommissionEarned * 0.8); // 80% received
  const commissionPending = totalCommissionEarned - commissionReceived;

  // Placement Commission History
  const commissionHistory = applications
    .filter(a => a.status === 'JOINED' || a.status === 'SELECTED')
    .map(app => {
      const isPaid = app.status === 'JOINED' && Math.random() > 0.3; // mock payment status
      return {
        id: app.id,
        candidateName: `${app.candidate?.firstName} ${app.candidate?.lastName || ''}`,
        company: 'Confidential Client', // recruiter view
        position: app.job?.title || 'Unknown Position',
        placementDate: app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : 'N/A',
        amount: commissionPerJoin,
        status: isPaid ? 'PAID' : 'PENDING'
      }
    })

  const stats = {
    totalSubmitted,
    interviewed,
    selected,
    joined,
    selectionRatio,
    joiningRatio,
    totalPlacements,
    totalRevenue,
    totalCommissionEarned,
    commissionReceived,
    commissionPending,
    commissionHistory
  }

  return (
    <ProfileClientView recruiter={recruiter} stats={stats} />
  )
}
