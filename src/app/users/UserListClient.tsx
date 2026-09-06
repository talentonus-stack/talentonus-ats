"use client"

import { useState } from "react"
import { toggleUserStatus } from "./actions"
import { formatLastLogin, formatCreatedDate } from "@/lib/dateUtils"
import { Power, PowerOff, Eye } from "lucide-react"
import Link from "next/link"

type User = {
  id: string
  name: string | null
  email: string
  role: "ADMIN" | "RECRUITER"
  status: "ACTIVE" | "INACTIVE"
  lastLogin: Date | null
  createdAt: Date
}

export default function UserListClient({ initialUsers, currentUserId }: { initialUsers: User[], currentUserId: string }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUserId) {
      alert("You cannot disable your own account.")
      return
    }

    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    setIsProcessing(user.id)

    try {
      const res = await toggleUserStatus(user.id, newStatus)
      if (res.success) {
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
      } else {
        alert(res.error || "Failed to update status")
      }
    } catch (e: any) {
      alert(e.message || "Failed to update status")
    } finally {
      setIsProcessing(null)
    }
  }

  return (
    <div className="w-full">
      {/* Mobile Card View (<768px) */}
      <div className="block md:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-5 flex flex-col gap-4 relative">
            <div className="flex justify-between items-start">
              <div className="pr-4 overflow-hidden">
                <h3 className="text-sm font-bold text-light truncate" title={user.name || "N/A"}>{user.name || "N/A"}</h3>
                <p className="text-xs font-semibold text-muted mt-1 truncate" title={user.email}>{user.email}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border shrink-0 ${user.status === 'ACTIVE' ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                {user.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-y border-border/50 py-3">
               <div>
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Role</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border ${user.role === 'ADMIN' ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-blue-900/20 text-blue-400 border-blue-800/30'}`}>
                    {user.role}
                  </span>
               </div>
               <div>
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Last Login</span>
                  {(() => {
                    const formatted = formatLastLogin(user.lastLogin)
                    if (formatted === "Never") {
                      return <span className="text-light text-xs block">Never</span>
                    }
                    const parts = formatted.split(", ")
                    if (parts.length >= 2) {
                      return (
                        <>
                          <div className="text-light text-xs">{parts[0]}</div>
                          <div className="text-muted text-[10px] mt-0.5">{parts.slice(1).join(", ")}</div>
                        </>
                      )
                    }
                    return <span className="text-light text-xs block" title={formatted}>{formatted}</span>
                  })()}
               </div>
               <div>
                  <span className="block text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Created</span>
                  <span className="text-light text-xs truncate block">{formatCreatedDate(user.createdAt)}</span>
               </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleToggleStatus(user)}
                disabled={isProcessing === user.id || user.id === currentUserId}
                className={`px-3 py-1.5 border text-xs font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 ${user.status === 'ACTIVE' ? 'bg-red-900/10 border-red-900/30 text-red-500 hover:bg-red-900/20' : 'bg-green-900/10 border-green-900/30 text-green-500 hover:bg-green-900/20'}`}
              >
                {user.status === 'ACTIVE' ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                {isProcessing === user.id ? 'Updating...' : user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="bg-primary-lighter rounded-2xl border border-border p-8 text-center text-sm text-muted">
            No users found.
          </div>
        )}
      </div>

      {/* Responsive Table View (≥768px) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="w-full">
          <table className="w-full table-fixed divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="w-[35%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">User Details</th>
                <th className="w-[12%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Role</th>
                <th className="w-[12%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="hidden lg:table-cell w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Last Login</th>
                <th className="hidden lg:table-cell w-[13%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Created</th>
                <th className="w-[13%] px-4 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-primary/50 transition-colors group">
                  <td className="px-4 py-4 overflow-hidden">
                    <div className="text-sm font-bold text-light truncate" title={user.name || "N/A"}>{user.name || "N/A"}</div>
                    <div className="text-xs text-muted mt-1 truncate" title={user.email}>{user.email}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${user.role === 'ADMIN' ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-blue-900/20 text-blue-400 border-blue-800/30'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${user.status === 'ACTIVE' ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-4 py-4">
                    {(() => {
                      const formatted = formatLastLogin(user.lastLogin)
                      if (formatted === "Never") {
                        return <span className="text-sm text-light">Never</span>
                      }
                      const parts = formatted.split(", ")
                      if (parts.length >= 2) {
                        return (
                          <>
                            <div className="text-sm text-light">{parts[0]}</div>
                            <div className="text-xs text-muted mt-1">{parts.slice(1).join(", ")}</div>
                          </>
                        )
                      }
                      return <span className="text-sm text-light">{formatted}</span>
                    })()}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-4 text-sm text-light truncate">
                    {formatCreatedDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={isProcessing === user.id || user.id === currentUserId}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold rounded-lg transition-colors disabled:opacity-50 ${user.status === 'ACTIVE' ? 'bg-red-900/10 border-red-900/30 text-red-500 hover:bg-red-900/20' : 'bg-green-900/10 border-green-900/30 text-green-500 hover:bg-green-900/20'}`}
                        title={user.id === currentUserId ? "Cannot disable own account" : ""}
                      >
                        {user.status === 'ACTIVE' ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                        {isProcessing === user.id ? 'Updating...' : user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-sm text-muted text-center">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
