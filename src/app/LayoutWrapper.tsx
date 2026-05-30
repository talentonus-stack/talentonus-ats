"use client"

import Sidebar from "@/components/Sidebar"
import { usePathname } from "next/navigation"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  if (isLoginPage) {
    return <main className="flex-1 overflow-y-auto">{children}</main>
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </>
  )
}
