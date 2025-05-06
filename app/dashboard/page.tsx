"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { debugAuth } from "@/lib/auth/debug-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DebugButton } from "@/components/auth/debug-button"

export default function DashboardPage() {
  const { user, role, profile, isLoading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Run debug auth on mount
    const runDebug = async () => {
      const info = await debugAuth()
      setDebugInfo(info)
    }

    runDebug()
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {profile?.first_name || user?.email || "User"}</CardTitle>
            <CardDescription>You are logged in as a {role || "user"}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is your dashboard where you can manage your account and services.</p>
            <div className="mt-4 text-xs text-muted-foreground">
              <p>User ID: {user?.id}</p>
              <p>Email: {user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>Manage users and system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p>As an admin, you have access to user management and system settings.</p>
            </CardContent>
          </Card>
        )}

        {role === "provider" && (
          <Card>
            <CardHeader>
              <CardTitle>Provider Actions</CardTitle>
              <CardDescription>Manage your services and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <p>As a provider, you can manage your services and availability.</p>
            </CardContent>
          </Card>
        )}

        {role === "client" && (
          <Card>
            <CardHeader>
              <CardTitle>Client Actions</CardTitle>
              <CardDescription>Book services and manage appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <p>As a client, you can book services and manage your appointments.</p>
            </CardContent>
          </Card>
        )}

        {/* Debug card - only visible in development */}
        {process.env.NODE_ENV === "development" && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>Authentication and session details</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto max-h-60 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {process.env.NODE_ENV === "development" && <DebugButton />}
    </>
  )
}
