"use server"

import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function disableRecruiter(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  await prisma.user.update({
    where: { id },
    data: { status: "INACTIVE" }
  })

  revalidatePath("/recruiters")
}
