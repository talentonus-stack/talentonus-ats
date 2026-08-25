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
  if ((session.user as any).role !== "RECRUITER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await context.params;
  const userId = (session.user as any).id;

  try {
    // First ensure the notification exists and belongs to this user
    const notification = await prisma.notification.findUnique({
      where: { id }
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (notification.userId !== userId) {
      return NextResponse.json({ error: "Forbidden - Not your notification" }, { status: 403 })
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isDismissed: true }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Dismiss Notification Error:", error)
    return NextResponse.json({ error: "Failed to dismiss notification" }, { status: 500 })
  }
}
