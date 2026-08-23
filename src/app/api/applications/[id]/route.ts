import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await context.params;

  try {
    let { status, offeredCTC, expectedJoiningDate, statusChangeReason, interviewData } = await request.json()

    // Validate statusChangeReason logic
    if (status === 'REJECTED' || status === 'BACKED_OUT') {
      if (!statusChangeReason || statusChangeReason.trim() === '') {
        return NextResponse.json({ error: `A reason is required when changing status to ${status.replace('_', ' ')}` }, { status: 400 })
      }
      statusChangeReason = statusChangeReason.trim();
    } else {
      statusChangeReason = null;
    }

    // --- NOTIFICATION PRE-CHECK ---
    const previousApplication = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: true,
        placement: true
      }
    })

    if (!previousApplication) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const isMeaningfulStatusChange = previousApplication.status !== status;
    const recruiterId = previousApplication.candidate.recruiterId;
    let computedRecruiterShare: number | null = null;
    let isShareAmountChanged = false;
    let newShareAmount: number | null = null;
    // ------------------------------

    // If changing to SELECTED, handle Placement creation logic
    if (status === 'SELECTED') {
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          job: { include: { company: true } },
          candidate: { include: { recruiter: true } }
        }
      })

      if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 })
      }

      // Need CTC to calculate placement values
      if (!offeredCTC && !application.offeredCTC) {
        return NextResponse.json({ error: "Offered CTC is required for Selected candidates" }, { status: 400 })
      }

      if (!expectedJoiningDate) {
        return NextResponse.json({ error: "Expected Joining Date is required for Selected candidates" }, { status: 400 })
      }

      const finalCTC = offeredCTC || application.offeredCTC

      // Commercial calculation variables
      const companyId = application.job.companyId;

      if (!companyId) {
        return NextResponse.json({ error: "Cannot create placement: Job is not associated with a company." }, { status: 400 })
      }

      const companyFeePct = application.job.company?.recruitmentFeePercentage || 0
      const recruiterCommPct = application.candidate.recruiter?.commissionPercentage || 0

      const placementValue = finalCTC * (companyFeePct / 100)
      const recruiterShare = placementValue * (recruiterCommPct / 100)
      const talentonusShare = placementValue - recruiterShare

      computedRecruiterShare = recruiterShare;

      // Check if share amount actually changed during this update
      if (previousApplication.placement && previousApplication.placement.recruiterShare !== recruiterShare) {
        isShareAmountChanged = true;
        newShareAmount = recruiterShare;
      }

      // Perform transaction: Update app status, CTC, and create/update Placement
      const updatedApplication = await prisma.$transaction(async (tx) => {
        const updated = await tx.application.update({
          where: { id },
          data: {
            status,
            statusChangeReason: null,
            offeredCTC: finalCTC
          },
        })

        await tx.placement.upsert({
          where: { applicationId: id },
          update: {
            offeredCTC: finalCTC,
            placementValue,
            recruiterCommissionPercentage: recruiterCommPct,
            recruiterShare,
            talentonusShare,
            status: 'SELECTED',
            expectedJoiningDate: new Date(expectedJoiningDate)
          },
          create: {
            applicationId: id,
            candidateId: application.candidateId,
            companyId: companyId,
            jobId: application.jobId,
            recruiterId: application.candidate.recruiterId,
            offeredCTC: finalCTC,
            placementValue,
            recruiterCommissionPercentage: recruiterCommPct,
            recruiterShare,
            talentonusShare,
            status: 'SELECTED',
            expectedJoiningDate: new Date(expectedJoiningDate)
          }
        })

        return updated
      })

      return NextResponse.json(updatedApplication)
    }

    let finalUpdatedApplication: any = null;

    // If scheduling an interview, handle atomic update + creation
    if (['L1_SCHEDULED', 'L2_SCHEDULED', 'FINAL_ROUND_SCHEDULED'].includes(status) && interviewData) {
      if (!interviewData.interviewDate || !interviewData.mode || !interviewData.round) {
        return NextResponse.json({ error: "Missing required interview data." }, { status: 400 });
      }

      finalUpdatedApplication = await prisma.$transaction(async (tx) => {
        // Create the new Interview record
        await tx.interview.create({
          data: {
            applicationId: id,
            candidateId: previousApplication.candidateId,
            jobId: previousApplication.jobId,
            recruiterId: previousApplication.candidate.recruiterId,
            round: interviewData.round,
            mode: interviewData.mode,
            interviewDate: new Date(interviewData.interviewDate),
            meetingLink: interviewData.meetingLink || null,
            location: interviewData.location || null,
            status: "SCHEDULED"
          }
        });

        // Update application status
        const updated = await tx.application.update({
          where: { id },
          data: {
            status,
            statusChangeReason: null
          },
        });

        // Cancel any pending SCHEDULED interviews since we are creating a new one or moving backwards
        await tx.interview.updateMany({
          where: {
            applicationId: id,
            status: 'SCHEDULED'
          },
          data: {
            status: 'CANCELLED'
          }
        });

        // Remove placement if moving backwards
        await tx.placement.deleteMany({
          where: { applicationId: id }
        });

        return updated;
      });

      // Jump to Notification logic (handled automatically below since status was changed)
    }
    // If changing to JOINED, update application and placement status to JOINED
    else if (status === 'JOINED') {
      finalUpdatedApplication = await prisma.$transaction(async (tx) => {
        const updated = await tx.application.update({
          where: { id },
          data: {
            status,
            statusChangeReason: null
          },
        })

        await tx.placement.updateMany({
          where: { applicationId: id },
          data: {
            status: 'JOINED',
            joiningDate: new Date()
          }
        })

        return updated
      })

      return NextResponse.json(finalUpdatedApplication)
    } else {
      // Default status update (not SELECTED, JOINED, or NEW_INTERVIEW)
      finalUpdatedApplication = await prisma.$transaction(async (tx) => {
        const updated = await tx.application.update({
          where: { id },
          data: {
            status,
            statusChangeReason
          },
        })

        // If moving completely OUT of interview stages (e.g. BACKED_OUT, REJECTED, SCREENING),
        // cancel any pending scheduled interviews. Do not delete them.
        if (!['L1_SCHEDULED', 'L2_SCHEDULED', 'FINAL_ROUND_SCHEDULED'].includes(status)) {
          await tx.interview.updateMany({
            where: {
              applicationId: id,
              status: 'SCHEDULED'
            },
            data: {
              status: 'CANCELLED'
            }
          });
        }

        // If moving FROM Selected TO any other status (e.g., BACKED_OUT, REJECTED), remove placement
        await tx.placement.deleteMany({
          where: { applicationId: id }
        })

        return updated
      })
    }

    // --- NOTIFICATION CREATION ---
    if (recruiterId) {
      const candidateName = `${previousApplication.candidate.firstName} ${previousApplication.candidate.lastName || ''}`.trim()

      // 1. Share Amount Change Notification
      if (isShareAmountChanged && newShareAmount !== null && !isMeaningfulStatusChange) {
        try {
          await prisma.notification.create({
            data: {
              userId: recruiterId,
              message: `Recruiter share for Candidate ${candidateName} has been updated to ₹${(newShareAmount as number).toLocaleString('en-IN')}.`,
              type: "SUCCESS",
            }
          })
        } catch (notifError) {
          console.error("Failed to create share update notification:", notifError)
        }
      }

      // 2. Status Change Notification
      if (isMeaningfulStatusChange) {
        let formattedStatus = status.replace(/_/g, ' ')
        if (status === 'L1_SCHEDULED') formattedStatus = 'L1 Schedule'
        else if (status === 'L2_SCHEDULED') formattedStatus = 'L2 Schedule'
        else if (status === 'FINAL_ROUND_SCHEDULED') formattedStatus = 'Final Round Schedule'
        else if (status === 'L1_CLEARED') formattedStatus = 'cleared L1'
        else if (status === 'L2_CLEARED') formattedStatus = 'cleared L2'
        else if (status === 'SCREENING') formattedStatus = 'the Screening stage'
        else if (status === 'SUBMITTED') formattedStatus = 'Submitted'
        else if (status === 'REJECTED') formattedStatus = 'Rejected'
        else if (status === 'BACKED_OUT') formattedStatus = 'Backed Out'

        let type: "SUCCESS" | "ERROR" | "NEUTRAL" = "SUCCESS"
        let message = ""

        if (status === 'BACKED_OUT') {
          type = "ERROR"
          message = `Candidate ${candidateName} has backed out.${statusChangeReason ? `\nReason: ${statusChangeReason.trim()}` : ''}`
        } else if (status === 'REJECTED') {
          type = "ERROR"
          message = `Candidate ${candidateName} has been rejected.${statusChangeReason ? `\nReason: ${statusChangeReason.trim()}` : ''}`
        } else if (status === 'SELECTED') {
          if (computedRecruiterShare !== null) {
            message = `Candidate ${candidateName} has been selected. ₹${(computedRecruiterShare as number).toLocaleString('en-IN')} recruiter share has been generated.`
          } else {
            message = `Candidate ${candidateName} has been selected.`
          }
        } else if (status === 'JOINED') {
          message = `Candidate ${candidateName} has joined.`
        } else if (status === 'SCREENING') {
          message = `Candidate ${candidateName} is now in the Screening stage.`
        } else if (status === 'L1_SCHEDULED') {
          message = `Candidate ${candidateName} is now in L1 Schedule.`
        } else if (status === 'L2_SCHEDULED') {
          message = `Candidate ${candidateName} is now in L2 Schedule.`
        } else if (status === 'FINAL_ROUND_SCHEDULED') {
          message = `Candidate ${candidateName} is now in Final Round Schedule.`
        } else if (status === 'L1_CLEARED') {
          message = `Candidate ${candidateName} has cleared L1.`
        } else if (status === 'L2_CLEARED') {
          message = `Candidate ${candidateName} has cleared L2.`
        } else {
          message = `Candidate ${candidateName} has been moved to ${formattedStatus}.`
        }

        try {
          await prisma.notification.create({
            data: {
              userId: recruiterId,
              message,
              type,
            }
          })
        } catch (notifError) {
          console.error("Failed to create status notification:", notifError)
        }
      }
    }
    // -----------------------------

    return NextResponse.json(finalUpdatedApplication)
  } catch (error: any) {

    console.error("Application Update Error:", error)
    console.error("Error Name:", error.name)
    console.error("Error Message:", error.message)
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 })
  }
}
