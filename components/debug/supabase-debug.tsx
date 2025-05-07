"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase/client"

export function SupabaseDebug() {
  const [isChecking, setIsChecking] = useState(false)
  const [configStatus, setConfigStatus] = useState<"unchecked" | "configured" | "not-configured">("unchecked")
  const [connectionStatus, setConnectionStatus] = useState<"unchecked" | "connected" | "failed">("unchecked")
  const [authStatus, setAuthStatus] = useState<"unchecked" | "working" | "failed">("unchecked")
  const [dbStatus, setDbStatus] = useState<"unchecked" | "working" | "failed">("unchecked")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const checkSupabase = async () => {
    setIsChecking(true)
    setErrorMessage(null)

    // Step 1: Check configuration
    const isConfigured = isSupabaseConfigured()
    setConfigStatus(isConfigured ? "configured" : "not-configured")

    if (!isConfigured) {
      setConnectionStatus("failed")
      setAuthStatus("failed")
      setDbStatus("failed")
      setIsChecking(false)
      return
    }

    try {
      // Step 2: Check connection
      const supabase = getSupabaseClient()

      // Simple ping to check connection
      const { error: pingError } = await supabase.from("profiles").select("count", { count: "exact", head: true })

      if (pingError && !pingError.message.includes("permission denied")) {
        // If error is not about permissions, it's a connection issue
        setConnectionStatus("failed")
        setErrorMessage(`Connection error: ${pingError.message}`)
        setAuthStatus("failed")
        setDbStatus("failed")
        setIsChecking(false)
        return
      }

      setConnectionStatus("connected")

      // Step 3: Check auth
      try {
        const { error: authError } = await supabase.auth.getSession()
        setAuthStatus(authError ? "failed" : "working")
        if (authError) {
          setErrorMessage(`Auth error: ${authError.message}`)
        }
      } catch (error) {
        setAuthStatus("failed")
        setErrorMessage(`Auth error: ${error instanceof Error ? error.message : String(error)}`)
      }

      // Step 4: Check database
      try {
        // Try to query a table that should exist
        const { error: dbError } = await supabase.from("profiles").select("count", { count: "exact", head: true })

        // Permission denied is expected for unauthenticated users, but means DB is working
        const isPermissionError = dbError?.message.includes("permission denied")
        setDbStatus(dbError && !isPermissionError ? "failed" : "working")

        if (dbError && !isPermissionError) {
          setErrorMessage(`Database error: ${dbError.message}`)
        }
      } catch (error) {
        setDbStatus("failed")
        setErrorMessage(`Database error: ${error instanceof Error ? error.message : String(error)}`)
      }
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Supabase Connection Test</CardTitle>
          <CardDescription>Test your Supabase connection and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center mb-4">
            <Button onClick={checkSupabase} disabled={isChecking} size="lg">
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Test Supabase Connection"
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex items-center justify-between">
                  <span>Environment Variables</span>
                  {configStatus === "unchecked" ? (
                    <Badge variant="outline">Unchecked</Badge>
                  ) : configStatus === "configured" ? (
                    <Badge className="bg-green-500">Configured</Badge>
                  ) : (
                    <Badge variant="destructive">Missing</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Connection</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex items-center justify-between">
                  <span>API Reachable</span>
                  {connectionStatus === "unchecked" ? (
                    <Badge variant="outline">Unchecked</Badge>
                  ) : connectionStatus === "connected" ? (
                    <Badge className="bg-green-500">Connected</Badge>
                  ) : (
                    <Badge variant="destructive">Failed</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Authentication</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex items-center justify-between">
                  <span>Auth Service</span>
                  {authStatus === "unchecked" ? (
                    <Badge variant="outline">Unchecked</Badge>
                  ) : authStatus === "working" ? (
                    <Badge className="bg-green-500">Working</Badge>
                  ) : (
                    <Badge variant="destructive">Failed</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Database</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex items-center justify-between">
                  <span>Database Access</span>
                  {dbStatus === "unchecked" ? (
                    <Badge variant="outline">Unchecked</Badge>
                  ) : dbStatus === "working" ? (
                    <Badge className="bg-green-500">Working</Badge>
                  ) : (
                    <Badge variant="destructive">Failed</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {configStatus === "configured" &&
            connectionStatus === "connected" &&
            authStatus === "working" &&
            dbStatus === "working" && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your Supabase connection is working correctly! All systems are operational.
                </AlertDescription>
              </Alert>
            )}

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Environment Variables</h3>
            <p className="text-sm text-muted-foreground">
              Make sure these environment variables are set in your Vercel project:
            </p>
            <div className="bg-muted p-4 rounded-md font-mono text-sm">
              <div className="mb-2">NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <a href="/setup/deploy">Deployment Guide</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/setup/database">Database Setup</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
