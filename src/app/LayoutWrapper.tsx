"use client"

import Sidebar from "@/components/Sidebar"
import { usePathname } from "next/navigation"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/recruiter-login"

  if (isAuthPage) {
    return <main className="flex-1 overflow-y-auto">{children}</main>
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8"><div className="max-w-[1400px] mx-auto space-y-12">{children}</div></main>
    </>
  )
}
