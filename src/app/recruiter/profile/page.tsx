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
    where: { id: recruiterId },
    include: {
      placements: {
        include: {
          candidate: true,
          company: true,
          job: true,
          application: true
        }
      }
    }
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
      job: {
        include: { company: true }
      },
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

  // Placement Earnings Data (Dynamically calculated from Placements table using new logic)
  const placements = recruiter.placements || []
  const totalPlacements = placements.length

  let revenueGenerated = 0;
  let commissionEarned = 0;
  let commissionReceived = 0;
  let totalLifetimeEarned = 0;

  placements.forEach(p => {
    const share = p.recruiterShare;

    // REVENUE GENERATED: Selected candidates only (not yet joined)
    if (p.application?.status === 'SELECTED') {
      revenueGenerated += share;
    }

    // COMMISSION EARNED: Joined candidates not yet paid
    if (p.application?.status === 'JOINED' && p.recruiterPaymentStatus === 'PENDING') {
      commissionEarned += share;
    }

    // COMMISSION RECEIVED: Joined candidates already paid
    if (p.application?.status === 'JOINED' && p.recruiterPaymentStatus === 'PAID') {
      commissionReceived += share;
    }

    // TOTAL LIFETIME EARNED: All recruiter payments ever released
    if (p.recruiterPaymentStatus === 'PAID') {
      totalLifetimeEarned += share;
    }
  })

  // Placement Commission History
  const commissionHistory = placements.map(p => {
    return {
      id: p.id,
      candidateName: `${p.candidate?.firstName} ${p.candidate?.lastName || ''}`,
      company: p.company?.isConfidential ? "Confidential Client" : (p.company?.name || "Unknown Company"),
      position: p.job?.title || 'Unknown Position',
      placementDate: new Date(p.createdAt).toLocaleDateString(),
      amount: p.recruiterShare,
      status: p.recruiterPaymentStatus === 'PAID' ? 'PAID' : 'PENDING'
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
    revenueGenerated,
    commissionEarned,
    commissionReceived,
    totalLifetimeEarned,
    commissionHistory
  }

  return (
    <ProfileClientView recruiter={recruiter} stats={stats} />
  )
}
