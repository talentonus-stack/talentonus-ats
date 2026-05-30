export const dynamic = "force-dynamic";

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

  const { id } = await context.params;

  try {
    const { status } = await request.json()
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updatedApplication)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 })
  }
}
