"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md border border-gray-200">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Recruiter Portal</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Sign in to your account</p>

        {error && <p className="mb-4 text-center text-sm font-medium text-red-500 bg-red-50 py-2 rounded">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              placeholder="recruiter@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500" onClick={(e) => { e.preventDefault(); alert("Forgot password functionality coming soon!"); }}>
                Forgot your password?
              </a>
            </div>
          </div>

          <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-medium transition-colors">
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t text-center text-sm">
          <Link href="/login" className="text-gray-500 hover:text-gray-900 font-medium">Return to Admin Login</Link>
        </div>
      </div>
    </div>
  )
}
