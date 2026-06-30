"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Users, Briefcase, UserCheck, LayoutDashboard, LogOut, FileText, UserPlus, Building2, IndianRupee, Wallet, KeyRound } from "lucide-react"
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
  { name: "Password Reset", href: "/password-resets", icon: KeyRound },
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
    <div className="flex h-screen w-64 flex-col border-r border-border bg-primary text-light relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-accent opacity-5 blur-[80px] pointer-events-none"></div>

      <div className="flex h-36 items-center justify-center border-b border-border px-4 py-4 relative z-10">
        <div className="flex flex-col items-center justify-center w-full h-full">
          <Image
            src="/logo.png"
            alt="Talentonus Logo"
            width={288}
            height={144}
            className="object-contain w-full max-w-[216px] h-auto brightness-0 invert opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            priority
          />
          <span className="text-[10px] font-medium text-accent -mt-5 uppercase tracking-[0.2em] shadow-accent">
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
                isActive
                  ? "bg-accent text-primary shadow-[0_0_15px_rgba(170,255,0,0.3)] scale-[1.02]"
                  : "text-muted hover:bg-primary-lighter hover:text-light"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted group-hover:text-light"
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
