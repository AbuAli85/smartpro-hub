"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useIntl } from "react-intl"

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const intl = useIntl()

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")
      if (!token) {
        setError(intl.formatMessage({ id: "invalidToken" }))
        return
      }

      setIsVerifying(true)
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        if (response.ok) {
          setIsVerified(true)
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

    verifyEmail()
  }, [searchParams, intl])

  const handleContinue = () => {
    router.push("/verify-phone")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          {intl.formatMessage({ id: "emailVerification" })}
        </h2>
        {isVerifying && <p>{intl.formatMessage({ id: "verifyingEmail" })}</p>}
        {isVerified && (
          <>
            <p className="text-green-600 dark:text-green-400">{intl.formatMessage({ id: "emailVerified" })}</p>
            <Button onClick={handleContinue}>{intl.formatMessage({ id: "continueToPhoneVerification" })}</Button>
          </>
        )}
        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </div>
  )
}

