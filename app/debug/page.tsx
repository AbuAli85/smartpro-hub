"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [cookiesData, setCookiesData] = useState<any>(null)
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Get session
        const { data: sessionData } = await supabase.auth.getSession()
        setSessionData(sessionData)

        // Get cookies
        const cookies: Record<string, string> = {}
        document.cookie.split(";").forEach((cookie) => {
          const [name, value] = cookie.trim().split("=")
          cookies[name] = value
        })
        setCookiesData(cookies)

        // Get localStorage
        const storage: Record<string, string> = {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key) {
            storage[key] = localStorage.getItem(key) || ""
          }
        }
        setLocalStorageData(storage)
      } catch (error) {
        console.error("Error fetching debug data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const clearSession = async () => {
    try {
      await supabase.auth.signOut()

      // Clear localStorage
      localStorage.removeItem("supabase.auth.token")
      localStorage.removeItem("smartpro-auth")

      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
      })

      window.location.reload()
    } catch (error) {
      console.error("Error clearing session:", error)
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading debug information...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Session Data</CardTitle>
            <CardDescription>Current Supabase session information</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-60">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={clearSession}>
              Clear Session
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
            <CardDescription>Current browser cookies</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-60">
              {JSON.stringify(cookiesData, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Local Storage</CardTitle>
            <CardDescription>Current browser local storage</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-60">
              {JSON.stringify(localStorageData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
