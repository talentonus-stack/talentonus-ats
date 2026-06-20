"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Users, Briefcase, UserCheck, LayoutDashboard, LogOut, FileText, UserPlus, Building2, IndianRupee, Wallet } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

const adminNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Placements", href: "/placements", icon: IndianRupee },
  { name: "Recruiter Payouts", href: "/recruiter-payments", icon: Wallet },
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
    <div className="flex h-screen w-64 flex-col border-r border-[#E3D7C8] bg-[#EFE4D5] text-[#111111] relative overflow-hidden">
      {/* Subtle top glow */}


      <div className="flex h-36 items-center justify-center border-b border-border px-4 py-4 relative z-10">
        <div className="flex flex-col items-center justify-center w-full h-full">
          <Image
            src="/logo.png"
            alt="Talentonus Logo"
            width={240}
            height={120}
            className="object-contain w-full max-w-[180px] h-auto"
            priority
          />
          <span className="text-[10px] font-bold text-[#F4A340] -mt-4 uppercase tracking-[0.2em]">
            {role === "RECRUITER" ? "Recruiter Portal" : "ATS Admin"}
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto relative z-10 custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && item.href !== "/recruiter" && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                isActive ? "bg-[#F4A340] text-white shadow-md scale-[1.02]" : "text-[#444444] hover:bg-white hover:text-[#111111]"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                  isActive ? "text-white" : "text-[#444444] group-hover:text-[#111111]"
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4 relative z-10">
        <button
          onClick={() => signOut({ callbackUrl: role === 'RECRUITER' ? '/recruiter-login' : '/login' })}
          className="group flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-muted hover:bg-primary-lighter hover:text-light transition-all duration-200"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-muted group-hover:text-light transition-colors" />
          Logout
        </button>
      </div>
    </div>
  )
}
