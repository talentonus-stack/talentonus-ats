"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function RecruiterLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                className="block w-full rounded-lg bg-primary-lighter border border-border px-4 py-3 text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-xs text-muted hover:text-accent transition-colors" onClick={(e) => { e.preventDefault(); alert("Forgot password functionality coming soon!"); }}>
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

          <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm">
            <Link href="/login" className="text-muted hover:text-accent transition-colors duration-200 border-b border-transparent hover:border-accent pb-1">
              Return to Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
