"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useIntl } from "react-intl"

export default function VerifyPhonePage() {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const intl = useIntl()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        const data = await response.json()
        setError(data.error || intl.formatMessage({ id: "verificationFailed" }))
      }
    } catch (err) {
      setError(intl.formatMessage({ id: "verificationFailed" }))
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {intl.formatMessage({ id: "phoneVerification" })}
        </h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="otp" className="sr-only">
              {intl.formatMessage({ id: "otpCode" })}
            </label>
            <Input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder={intl.formatMessage({ id: "enterOtp" })}
            />
          </div>
          {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying ? intl.formatMessage({ id: "verifying" }) : intl.formatMessage({ id: "verifyPhone" })}
          </Button>
        </form>
      </div>
    </div>
  )
}

