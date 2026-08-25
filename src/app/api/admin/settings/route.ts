import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, mobile, currentPassword, newPassword } = await request.json()
    const userId = (session.user as any).id

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check email uniqueness if email is changed
    if (email !== user.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } })
      if (existingEmail) {
        return NextResponse.json({ error: "Email is already in use by another account" }, { status: 400 })
      }
    }

    const updateData: any = {
      email: email,
    }

    // Only update name and mobile if they are explicitly provided in the payload
    if (name !== undefined) {
      updateData.name = name;
    }

    if (mobile !== undefined) {
      // Check mobile uniqueness if mobile is changed and provided
      if (mobile && mobile !== user.mobile) {
        const existingMobile = await prisma.user.findUnique({ where: { mobile } })
        if (existingMobile) {
          return NextResponse.json({ error: "Mobile number is already in use by another account" }, { status: 400 })
        }
      }
      updateData.mobile = mobile || null;
    }

    // If changing password, must provide and verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to change password" }, { status: 400 })
      }

      if (!user.password) {
        return NextResponse.json({ error: "Account has no password set (OAuth). Password change not supported." }, { status: 400 })
      }

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 401 })
      }

      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    // Do not return hashed password to client
    const { password, ...safeUser } = updatedUser
    return NextResponse.json(safeUser)
  } catch (error: any) {
    console.error("Settings Update Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
