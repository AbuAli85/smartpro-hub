"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Clock } from "lucide-react"

export default function ContractsPage() {
  const { role } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contracts</h1>
        {role === "provider" && <Button>Create Contract</Button>}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for contracts */}
        <Card>
          <CardHeader>
            <CardTitle>No Contracts Yet</CardTitle>
            <CardDescription>
              {role === "provider" ? "Create a contract to get started" : "You don't have any contracts yet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>No active contracts</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {role === "provider"
                  ? "Create your first contract template"
                  : "Wait for a provider to send you a contract"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
