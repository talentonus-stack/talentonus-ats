"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RecruiterLoginPage() {
  const router = useRouter()
  const [emailOrMobile, setEmailOrMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrMobile })
      })

      if (res.ok) {
        setStep(2)
        setMessage("OTP sent successfully. Check your email or phone.")
      } else {
        const data = await res.json()
        setError(data.error || "Failed to request OTP")
      }
    } catch (err) {
      setError("An error occurred")
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await signIn("credentials", {
      email: emailOrMobile,
      otp,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid or expired OTP")
    } else {
      router.push("/recruiter")
      router.refresh()
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Recruiter Portal</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Login with Email or Mobile</p>

        {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
        {message && <p className="mb-4 text-center text-sm text-green-500">{message}</p>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email or Mobile Number</label>
              <input
                type="text"
                required
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                placeholder="john@example.com or +1234567890"
              />
            </div>
            <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Request OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                placeholder="123456"
              />
            </div>
            <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Verify & Login
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full mt-2 text-sm text-blue-600 hover:text-blue-500">
              Back
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="text-gray-500 hover:text-gray-900">Admin Login</Link>
        </div>
      </div>
    </div>
  )
}
