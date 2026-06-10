"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function deleteCompany(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  // Check for related jobs
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      _count: {
        select: { jobs: true }
      }
    }
  })

  if (!company) {
    throw new Error("Company not found")
  }

  // If there are related jobs, we cannot hard delete
  if (company._count.jobs > 0) {
    // Soft delete / mark inactive
    await prisma.company.update({
      where: { id },
      data: { status: "INACTIVE" }
    })
    revalidatePath("/companies")
    return { success: true, message: "Company has associated records. Status changed to INACTIVE." }
  }

  // No related records, hard delete
  await prisma.company.delete({
    where: { id }
  })
  revalidatePath("/companies")
  return { success: true, message: "Company deleted successfully." }
}
