"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCreatedDate } from "@/lib/dateUtils"
import { Shield, User, Lock, Mail, Phone, Info } from "lucide-react"

export default function SettingsClient({ user }: { user: any }) {
  const router = useRouter()
  const [name, setName] = useState(user.name || "")
  const [email, setEmail] = useState(user.email || "")
  const [mobile, setMobile] = useState(user.mobile || "")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [personalLoading, setPersonalLoading] = useState(false)
  const [personalMsg, setPersonalMsg] = useState({ type: "", text: "" })

  const [securityLoading, setSecurityLoading] = useState(false)
  const [securityMsg, setSecurityMsg] = useState({ type: "", text: "" })

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPersonalLoading(true)
    setPersonalMsg({ type: "", text: "" })

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile }),
      })

      const data = await res.json()
      if (res.ok) {
        setPersonalMsg({ type: "success", text: "Personal information updated successfully." })
        router.refresh()
      } else {
        setPersonalMsg({ type: "error", text: data.error || "Failed to update information." })
      }
    } catch (err) {
      setPersonalMsg({ type: "error", text: "An error occurred." })
    }
    setPersonalLoading(false)
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSecurityLoading(true)
    setSecurityMsg({ type: "", text: "" })

    if (newPassword !== confirmPassword) {
      setSecurityMsg({ type: "error", text: "New passwords do not match." })
      setSecurityLoading(false)
      return
    }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, currentPassword, newPassword }),
      })

      const data = await res.json()
      if (res.ok) {
        setSecurityMsg({ type: "success", text: "Password updated successfully." })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setSecurityMsg({ type: "error", text: data.error || "Failed to update password." })
      }
    } catch (err) {
      setSecurityMsg({ type: "error", text: "An error occurred." })
    }
    setSecurityLoading(false)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* SECTION 1: Personal Information */}
      <div className="bg-primary-lighter p-8 rounded-2xl shadow-xl border border-border">
        <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
          <div className="p-2 bg-accent/10 rounded-lg">
            <User className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-light">Personal Information</h2>
        </div>

        {personalMsg.text && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${personalMsg.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-800' : 'bg-red-900/20 text-red-400 border border-red-800'}`}>
            {personalMsg.text}
          </div>
        )}

        <form onSubmit={handlePersonalSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-muted" />
                </div>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="block w-full rounded-lg bg-primary border border-border pl-10 px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted" />
                </div>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-lg bg-primary border border-border pl-10 px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Mobile Number <span className="text-muted/50 normal-case">(Optional)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-muted" />
                </div>
                <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} className="block w-full rounded-lg bg-primary border border-border pl-10 px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button disabled={personalLoading} type="submit" className="rounded-lg bg-accent px-6 py-2.5 text-sm font-bold text-primary hover:bg-accent-hover hover:scale-[1.02] transition-all duration-200 shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)] disabled:opacity-50">
              {personalLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Security */}
      <div className="bg-primary-lighter p-8 rounded-2xl shadow-xl border border-border">
        <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-light">Security</h2>
        </div>

        {securityMsg.text && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${securityMsg.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-800' : 'bg-red-900/20 text-red-400 border border-red-800'}`}>
            {securityMsg.text}
          </div>
        )}

        <form onSubmit={handleSecuritySubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Current Password</label>
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted" />
                </div>
                <input required type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="block w-full rounded-lg bg-primary border border-border pl-10 px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
              </div>
              <p className="text-xs text-muted mt-2">Current password is required to make any security changes.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted" />
                </div>
                <input required type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="block w-full rounded-lg bg-primary border border-border pl-10 px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted" />
                </div>
                <input required type="password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="block w-full rounded-lg bg-primary border border-border pl-10 px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button disabled={securityLoading || !currentPassword || !newPassword || !confirmPassword} type="submit" className="rounded-lg bg-red-500/10 border border-red-500/20 px-6 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50">
              {securityLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: Account Information (Read Only) */}
      <div className="bg-primary-lighter p-8 rounded-2xl shadow-xl border border-border">
        <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Info className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-light">Account Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-75">
          <div className="bg-primary p-4 rounded-xl border border-border">
            <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Role</span>
            <span className="font-semibold text-light capitalize">{user.role.toLowerCase()}</span>
          </div>
          <div className="bg-primary p-4 rounded-xl border border-border">
            <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Account Status</span>
            <span className="font-semibold text-green-400 capitalize">{user.status.toLowerCase()}</span>
          </div>
          <div className="bg-primary p-4 rounded-xl border border-border">
            <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Account Created On</span>
            <span className="font-semibold text-light">{formatCreatedDate(user.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
