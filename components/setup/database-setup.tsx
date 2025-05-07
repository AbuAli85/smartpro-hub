"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function DatabaseSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const runSetup = async (setupType: string) => {
    setIsLoading(true)
    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/setup/database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ setupType }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message)
      } else {
        setStatus("error")
        setMessage(data.message || "An error occurred during database setup.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to connect to the server. Please try again.")
      console.error("Error running database setup:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Database Setup</CardTitle>
          <CardDescription>Set up your Supabase database schema for SmartPRO</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Make sure your Supabase environment variables are properly configured before running the database setup.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="full" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="full">Full Setup</TabsTrigger>
              <TabsTrigger value="core">Core Tables</TabsTrigger>
              <TabsTrigger value="demo">Demo Data</TabsTrigger>
            </TabsList>
            <TabsContent value="full" className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Full Database Setup</h3>
              <p>
                This will create all tables, functions, and triggers needed for the SmartPRO application, including:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Authentication and user profiles</li>
                <li>Service provider management</li>
                <li>Booking and scheduling system</li>
                <li>Messaging and notifications</li>
                <li>Contracts and documents</li>
                <li>Role-based access control</li>
              </ul>
              <Button onClick={() => runSetup("full")} disabled={isLoading} className="mt-2">
                {isLoading && status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Run Full Setup"
                )}
              </Button>
            </TabsContent>
            <TabsContent value="core" className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Core Tables Only</h3>
              <p>This will create only the essential tables needed for basic functionality:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Authentication and user profiles</li>
                <li>Basic service provider tables</li>
                <li>Simple booking system</li>
              </ul>
              <Button onClick={() => runSetup("core")} disabled={isLoading} className="mt-2">
                {isLoading && status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Run Core Setup"
                )}
              </Button>
            </TabsContent>
            <TabsContent value="demo" className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Demo Data</h3>
              <p>This will populate your database with sample data for testing:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Sample users (clients, providers, admin)</li>
                <li>Sample services and bookings</li>
                <li>Sample messages and contracts</li>
              </ul>
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Only run this on development or testing environments. Do not use demo data in production.
                </AlertDescription>
              </Alert>
              <Button onClick={() => runSetup("demo")} disabled={isLoading} className="mt-2">
                {isLoading && status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Load Demo Data"
                )}
              </Button>
            </TabsContent>
          </Tabs>

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Manual Setup</h3>
            <p>
              If you prefer to set up your database manually, you can find the SQL scripts in the project repository:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                <code>database-setup.sql</code> - Core tables and schema
              </li>
              <li>
                <code>database-setup-profiles.sql</code> - User profiles
              </li>
              <li>
                <code>database-setup-provider.sql</code> - Service provider tables
              </li>
              <li>
                <code>database-setup-services.sql</code> - Services and bookings
              </li>
              <li>
                <code>database-setup-realtime.sql</code> - Realtime subscriptions
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild className="w-full">
            <a href="/setup/deploy">Back to Deployment Guide</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
