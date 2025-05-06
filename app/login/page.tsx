"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { AuthForm } from "@/components/auth/auth-form"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DebugButton } from "@/components/auth/debug-button"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get("redirectedFrom") || "/dashboard"
  const [authChecked, setAuthChecked] = useState(false)

  // Use a single effect with no dependencies to run only once on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Login page: Checking authentication")
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error checking session:", error)
          setIsLoading(false)
          setAuthChecked(true)
          return
        }

        if (data.session) {
          console.log("Login page: User is authenticated, redirecting to dashboard")
          setIsAuthenticated(true)

          // Use a timeout to ensure state updates complete before navigation
          setTimeout(() => {
            // Force a hard navigation to break out of any potential loops
            window.location.href = redirectPath
          }, 100)
        } else {
          console.log("Login page: No active session found")
          setIsLoading(false)
          setAuthChecked(true)
        }
      } catch (error) {
        console.error("Unexpected error checking auth:", error)
        setIsLoading(false)
        setAuthChecked(true)
      }
    }

    // Only check auth once
    if (!authChecked) {
      checkAuth()
    }
  }, []) // Empty dependency array - run only once on mount

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4">
          {isAuthenticated
            ? "You are already logged in. Redirecting to dashboard..."
            : "Checking authentication status..."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">SmartPRO</h1>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Sign in to your account
          </h2>
        </div>
        <AuthForm redirectPath={redirectPath} />
      </div>

      {process.env.NODE_ENV === "development" && <DebugButton />}
    </div>
  )
}
