import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import SettingsClient from "./SettingsClient"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  const userId = (session.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      status: true,
      createdAt: true
    }
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-light">Account Settings</h1>
        <p className="mt-2 text-sm text-muted">Manage your personal information and security preferences.</p>
      </div>

      <SettingsClient user={user} />
    </div>
  )
}
