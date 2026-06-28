"use server"

import prisma from "@/lib/prisma"

export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { email, role: "RECRUITER" }
    })

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return { success: true }
    }

    // Check if there's already a pending request to prevent spam
    const existing = await prisma.passwordResetRequest.findFirst({
      where: { userId: user.id, status: "PENDING" }
    })

    if (!existing) {
      await prisma.passwordResetRequest.create({
        data: {
          userId: user.id
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to request password reset", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to process request. Please try again later." }
  }
}
