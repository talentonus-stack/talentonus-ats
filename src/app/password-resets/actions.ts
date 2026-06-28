"use server"

import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function processPasswordReset(requestId: string, newPasswordPlain: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "ADMIN") {
      throw new Error("Unauthorized")
    }

    const request = await prisma.passwordResetRequest.findUnique({
      where: { id: requestId }
    })

    if (!request || request.status === "COMPLETED") {
      throw new Error("Invalid or already completed request")
    }

    const hashedPassword = await bcrypt.hash(newPasswordPlain, 10)

    // Update user password
    await prisma.user.update({
      where: { id: request.userId },
      data: { password: hashedPassword }
    })

    // Mark request as completed
    await prisma.passwordResetRequest.update({
      where: { id: requestId },
      data: {
        status: "COMPLETED",

      }
    })

    revalidatePath("/password-resets")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to process password reset:", error)
    return { success: false, error: error.message || "An error occurred" }
  }
}
