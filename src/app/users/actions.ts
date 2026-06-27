"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function toggleUserStatus(userId: string, newStatus: "ACTIVE" | "INACTIVE") {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Unauthorized" }
  }

  // Prevent disabling self
  if (userId === (session.user as any).id) {
    return { success: false, error: "You cannot disable your own account." }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus }
    })
    revalidatePath("/users")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to toggle user status:", error)
    return { success: false, error: "Failed to update user status." }
  }
}
