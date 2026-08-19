"use client"

import Sidebar from "@/components/Sidebar"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import RecruiterNotifications from "@/components/RecruiterNotifications"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAuthPage = pathname === "/login" || pathname === "/recruiter-login"

  const role = (session?.user as any)?.role

  if (isAuthPage) {
    return <main className="flex-1 overflow-y-auto">{children}</main>
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Recruiter Notifications Injection */}
        {role === "RECRUITER" && (
          <div className="absolute top-8 right-8 z-50">
            <RecruiterNotifications />
          </div>
        )}
        {children}
      </main>
    </>
  )
}
