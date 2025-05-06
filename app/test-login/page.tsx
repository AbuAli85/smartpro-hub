"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Import the profile debug functions
import { checkProfileExists } from "@/lib/auth/profile-debug"

export default function TestLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("Test login with:", email)

      // Clear any existing sessions first
      await supabase.auth.signOut()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Test login error:", error)
        setError(error.message)
        return
      }

      console.log("Test login successful:", data)
      setResult(data)

      // Check if profile exists
      if (data.user) {
        const profileExists = await checkProfileExists(data.user.id)
        console.log("Profile exists:", profileExists)

        if (!profileExists) {
          setError(
            "Warning: User authenticated but profile does not exist. This may cause issues with role-based access.",
          )
        }
      }

      // Check if session was created
      const { data: sessionData } = await supabase.auth.getSession()
      console.log("Session after login:", sessionData)
    } catch (error) {
      console.error("Unexpected error during test login:", error)
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Test Login</h1>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Login</CardTitle>
            <CardDescription>Test the login functionality directly</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Testing Login..." : "Test Login"}
              </Button>

              {result && (
                <div className="w-full">
                  <h3 className="font-medium mb-2">Result:</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs max-h-60">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
