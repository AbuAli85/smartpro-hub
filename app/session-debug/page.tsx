"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SessionDebugPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function checkSession() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error checking session:", error)
      }
      setSessionData(data)
    } catch (error) {
      console.error("Unexpected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  async function clearSession() {
    try {
      await supabase.auth.signOut()

      // Clear localStorage
      localStorage.removeItem("supabase.auth.token")
      localStorage.removeItem("smartpro-auth")

      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
      })

      await checkSession()
    } catch (error) {
      console.error("Error clearing session:", error)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>

      <div className="flex gap-4 mb-4">
        <Button onClick={checkSession} disabled={isLoading}>
          {isLoading ? "Checking..." : "Refresh Session"}
        </Button>
        <Button variant="destructive" onClick={clearSession}>
          Clear Session
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-96 text-xs">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
