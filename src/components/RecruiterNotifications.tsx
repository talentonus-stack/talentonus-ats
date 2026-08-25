"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, AlertCircle, CheckCircle, Info } from "lucide-react"

type NotificationType = "NEUTRAL" | "SUCCESS" | "ERROR"

interface Notification {
  id: string
  message: string
  type: NotificationType
  isDismissed: boolean
  createdAt: string
}

export default function RecruiterNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const dismissNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent dropdown from closing or other clicks
    try {
      // Optimistic update
      setNotifications(prev => prev.filter(n => n.id !== id))

      const res = await fetch(`/api/notifications/${id}/dismiss`, {
        method: "PATCH",
      })

      if (!res.ok) {
        // Revert on failure (simple reload for now)
        fetchNotifications()
      }
    } catch (error) {
      console.error("Failed to dismiss notification:", error)
      fetchNotifications()
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-primary border border-border hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary group"
      >
        <Bell className="w-5 h-5 text-muted group-hover:text-light transition-colors" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-primary bg-accent rounded-full -translate-y-1/4 translate-x-1/4">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-primary-lighter border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-border flex items-center justify-between bg-primary/50">
            <h3 className="font-semibold text-light flex items-center gap-2">
              Notifications
              <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold">
                {notifications.length} New
              </span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isError = notif.type === "ERROR"
                const isSuccess = notif.type === "SUCCESS"

                return (
                  <div
                    key={notif.id}
                    className={`relative p-4 pr-10 rounded-lg border group animate-fade-in ${
                      isError
                        ? 'bg-red-900/10 border-red-900/30 hover:border-red-500/50'
                        : isSuccess
                          ? 'bg-accent/5 border-accent/20 hover:border-accent/50'
                          : 'bg-primary border-border hover:border-accent/50'
                    } transition-colors`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {isError ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : isSuccess ? (
                          <CheckCircle className="w-4 h-4 text-accent" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm ${isError ? 'text-red-100' : 'text-light'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted mt-1 opacity-70">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Dismiss Button */}
                    <button
                      onClick={(e) => dismissNotification(e, notif.id)}
                      className="absolute top-3 right-3 p-1 rounded-md text-muted hover:text-light hover:bg-primary/50 transition-colors focus:outline-none"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
