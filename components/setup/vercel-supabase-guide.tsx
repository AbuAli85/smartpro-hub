"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export function VercelSupabaseGuide() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Deploy SmartPRO with Vercel and Supabase</CardTitle>
          <CardDescription>
            Follow this guide to set up your SmartPRO application with Vercel and Supabase integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">New Project</TabsTrigger>
              <TabsTrigger value="existing">Existing Project</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Step 1: Create a Supabase Project</h3>
              <ol className="ml-6 list-decimal space-y-2">
                <li>
                  Go to{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Supabase.com
                  </a>{" "}
                  and sign in or create an account
                </li>
                <li>Click "New Project" and follow the setup wizard</li>
                <li>Give your project a name (e.g., "smartpro-production")</li>
                <li>Set a secure database password (save this for later)</li>
                <li>Choose a region closest to your users</li>
                <li>Click "Create new project"</li>
              </ol>

              <h3 className="text-lg font-medium mt-6">Step 2: Get Your Supabase Credentials</h3>
              <ol className="ml-6 list-decimal space-y-2">
                <li>In your Supabase project dashboard, go to Project Settings (gear icon)</li>
                <li>Click on "API" in the sidebar</li>
                <li>Under "Project URL", copy your project URL</li>
                <li>Under "Project API keys", copy the "anon public" key</li>
              </ol>

              <div className="bg-muted p-4 rounded-md mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("https://your-project-id.supabase.co", "url")}
                  >
                    {copied === "url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard("your-anon-key", "anon")}>
                    {copied === "anon" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-medium mt-6">Step 3: Deploy to Vercel</h3>
              <ol className="ml-6 list-decimal space-y-2">
                <li>
                  Go to{" "}
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Vercel.com
                  </a>{" "}
                  and sign in or create an account
                </li>
                <li>Click "Add New..." and select "Project"</li>
                <li>Import your repository from GitHub, GitLab, or Bitbucket</li>
                <li>
                  In the "Configure Project" step, add your environment variables:
                  <ul className="list-disc ml-6 mt-2">
                    <li>
                      <code>NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project URL
                    </li>
                    <li>
                      <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase anon key
                    </li>
                  </ul>
                </li>
                <li>Click "Deploy"</li>
              </ol>

              <h3 className="text-lg font-medium mt-6">Step 4: Set Up Your Database Schema</h3>
              <p className="mb-2">After deployment, you need to set up your database schema:</p>
              <ol className="ml-6 list-decimal space-y-2">
                <li>Go to your deployed application URL</li>
                <li>
                  Navigate to <code>/setup/database</code> to run the database setup
                </li>
                <li>Follow the on-screen instructions to initialize your database</li>
              </ol>
            </TabsContent>
            <TabsContent value="existing" className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Step 1: Add Supabase Integration to Vercel</h3>
              <ol className="ml-6 list-decimal space-y-2">
                <li>
                  Go to your project on{" "}
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Vercel.com
                  </a>
                </li>
                <li>Navigate to "Settings" → "Integrations"</li>
                <li>Search for "Supabase" and click "Add Integration"</li>
                <li>Follow the prompts to connect your Supabase account</li>
                <li>Select your existing Supabase project or create a new one</li>
                <li>Complete the integration setup</li>
              </ol>

              <Alert className="mt-4">
                <AlertTitle>Automatic Environment Variables</AlertTitle>
                <AlertDescription>
                  The Vercel-Supabase integration will automatically add the required environment variables to your
                  project.
                </AlertDescription>
              </Alert>

              <h3 className="text-lg font-medium mt-6">Step 2: Redeploy Your Application</h3>
              <ol className="ml-6 list-decimal space-y-2">
                <li>Go to the "Deployments" tab in your Vercel project</li>
                <li>Click "Redeploy" on your latest deployment</li>
                <li>This will rebuild your application with the new environment variables</li>
              </ol>

              <h3 className="text-lg font-medium mt-6">Step 3: Set Up Your Database Schema</h3>
              <p className="mb-2">After redeployment, you need to set up your database schema:</p>
              <ol className="ml-6 list-decimal space-y-2">
                <li>Go to your deployed application URL</li>
                <li>
                  Navigate to <code>/setup/database</code> to run the database setup
                </li>
                <li>Follow the on-screen instructions to initialize your database</li>
              </ol>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Verifying Your Setup</h3>
            <p>After deployment, verify that everything is working correctly:</p>
            <ol className="ml-6 list-decimal space-y-2">
              <li>Visit your deployed application</li>
              <li>
                Navigate to <code>/debug/supabase</code> to check your Supabase connection
              </li>
              <li>Try to register a new user account</li>
              <li>Verify that you can log in and access the dashboard</li>
            </ol>
          </div>

          <Alert>
            <AlertTitle>Need to update environment variables?</AlertTitle>
            <AlertDescription>
              If you need to update your environment variables later, go to your Vercel project settings, navigate to
              "Environment Variables", and update the values there.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer">
              Supabase Docs
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://vercel.com/docs" target="_blank" rel="noopener noreferrer">
              Vercel Docs
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
