"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Users, Briefcase, UserCheck, LayoutDashboard, LogOut, FileText, UserPlus } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

const adminNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Applications", href: "/applications", icon: FileText },
  { name: "Recruiters", href: "/recruiters", icon: UserPlus },
  { name: "Users", href: "/users", icon: UserCheck },
]

const recruiterNavigation = [
  { name: "Dashboard", href: "/recruiter", icon: LayoutDashboard },
  { name: "Job Openings", href: "/recruiter/jobs", icon: Briefcase },
  { name: "My Candidates", href: "/recruiter/candidates", icon: Users },
  { name: "My Profile", href: "/recruiter/profile", icon: UserCheck },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role

  const navigation = role === "RECRUITER" ? recruiterNavigation : adminNavigation

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white text-gray-800">
      <div className="flex h-20 items-center justify-center border-b px-4 py-2">
        {role === "RECRUITER" ? (
          <div className="flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="Talentonus Logo"
              width={160}
              height={50}
              className="object-contain h-10 w-auto"
            />
            <span className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">Recruiter Portal</span>
          </div>
        ) : (
          <span className="text-xl font-bold tracking-tight text-blue-600">
            ATS Admin
          </span>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && item.href !== "/recruiter" && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
          Logout
        </button>
      </div>
    </div>
  )
}
