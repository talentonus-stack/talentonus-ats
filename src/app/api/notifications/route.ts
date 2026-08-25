import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if ((session.user as any).role !== "RECRUITER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const userId = (session.user as any).id

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        isDismissed: false
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(notifications)
  } catch (error: any) {
    console.error("Fetch Notifications Error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
