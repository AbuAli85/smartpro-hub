"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DashboardFallbackProps {
  error?: Error & { digest?: string }
}

export function DashboardFallback({ error }: DashboardFallbackProps) {
  const isSupabaseError =
    error?.message?.includes("Supabase") ||
    error?.message?.toLowerCase().includes("database") ||
    error?.message?.toLowerCase().includes("auth")

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Dashboard Unavailable</CardTitle>
          <CardDescription>
            {isSupabaseError
              ? "There was a problem connecting to the database."
              : "There was a problem loading the dashboard."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error?.message || "An unknown error occurred."}</AlertDescription>
          </Alert>

          {isSupabaseError && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This appears to be a Supabase connection issue. Please check your configuration:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Verify your Supabase environment variables are set correctly</li>
                <li>Check that your Supabase project is running</li>
                <li>Ensure your IP is allowed in Supabase Auth settings</li>
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/setup/deploy">Setup Guide</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/debug/supabase">Test Connection</Link>
          </Button>
          <div className="w-full pt-2">
            <Button variant="link" asChild className="w-full">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                Supabase Dashboard
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
