"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"

export default function AvailabilityPage() {
  const { role } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Redirect non-providers
    if (mounted && role !== "provider") {
      router.push("/dashboard")
    }
  }, [role, router, mounted])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  // Only providers should access this page
  if (role !== "provider") {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Availability Management</h1>
        <Button>Set Availability</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for availability */}
        <Card>
          <CardHeader>
            <CardTitle>No Availability Set</CardTitle>
            <CardDescription>Set your availability to start receiving bookings</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>No available time slots</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Set your working hours and availability</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
