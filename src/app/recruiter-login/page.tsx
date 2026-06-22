"use client"

import { signIn } from "next-auth/react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { X, Mail, CheckCircle, AlertTriangle } from "lucide-react"

export default function RecruiterLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotStatus, setForgotStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [forgotMessage, setForgotMessage] = useState("")

  const formRef = useRef<HTMLFormElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (email && password) {
        formRef.current?.requestSubmit();
      }
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) return

    setForgotStatus("loading")
    setForgotMessage("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      })

      const data = await res.json()

      if (!res.ok) {
        setForgotStatus("error")
        setForgotMessage(data.error || "Something went wrong.")
      } else {
        setForgotStatus("success")
        setForgotMessage(data.message)
      }
    } catch (err) {
      setForgotStatus("error")
      setForgotMessage("Failed to process request.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
    } else {
      router.push("/recruiter")
      router.refresh()
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-primary relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent opacity-10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600 opacity-5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-fade-in z-10">
        <div className="glass rounded-2xl p-10 shadow-2xl">
          <div className="flex justify-center mb-6">
             <Image
                src="/logo.png"
                alt="Talentonus Logo"
                width={200}
                height={80}
                className="brightness-0 invert opacity-90"
             />
          </div>
          <p className="mb-8 text-center text-sm font-medium tracking-widest uppercase text-accent">Recruiter Portal</p>

          {error && <div className="mb-6 p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm text-center">{error}</div>}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="block w-full rounded-lg bg-primary-lighter border border-border px-4 py-3 text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200"
                placeholder="recruiter@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="block w-full rounded-lg bg-primary-lighter border border-border px-4 py-3 text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-xs text-muted hover:text-accent transition-colors" onClick={(e) => { e.preventDefault(); setIsForgotModalOpen(true); }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-accent px-4 py-3 text-primary font-bold hover:bg-accent-hover hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)] transition-all duration-200"
            >
              Sign In to Portal
            </button>
          </form>


        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-primary border border-border rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>

            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-light transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <h2 className="text-xl font-bold text-light flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-accent" /> Forgot Password
              </h2>
              <p className="text-sm text-muted mb-6">Enter your registered email address and we will send you a link to reset your password.</p>

              {forgotStatus === "success" ? (
                <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-400">Email Sent</p>
                    <p className="text-xs text-green-300/80 mt-1">{forgotMessage}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {forgotStatus === "error" && (
                    <div className="bg-red-900/20 border border-red-800 rounded-xl p-3 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-400">{forgotMessage}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="block w-full rounded-lg bg-primary-lighter border border-border px-4 py-3 text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotStatus === "loading"}
                    className="w-full rounded-lg bg-accent px-4 py-3 text-primary font-bold hover:bg-accent-hover transition-all duration-200 disabled:opacity-50"
                  >
                    {forgotStatus === "loading" ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
