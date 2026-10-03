import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import SettingsClient from "./SettingsClient"
import PageHeader from "@/components/PageHeader"
import { Settings } from "lucide-react"

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
      <div className="mb-8 border-b border-border pb-2">
        <PageHeader
          title="Account Settings"
          description="Manage your personal information and security preferences."
          icon={Settings}
        />
      </div>

      <SettingsClient user={user} />
    </div>
  )
}
