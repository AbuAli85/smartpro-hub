"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

export function RecentBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentBookings() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) return

        const providerId = session.session.user.id

        const { data, error } = await supabase
          .from("bookings")
          .select(`
            id, 
            booking_date, 
            start_time, 
            end_time, 
            status, 
            service_name,
            client:client_id(id, full_name, avatar_url)
          `)
          .eq("provider_id", providerId)
          .order("booking_date", { ascending: true })
          .limit(5)

        if (error) throw error

        setBookings(data || [])
      } catch (error) {
        console.error("Error fetching recent bookings:", error)
        // Set empty array if error
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecentBookings()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[160px]" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-center text-muted-foreground">No bookings found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={booking.client?.avatar_url || ""} alt={booking.client?.full_name || ""} />
            <AvatarFallback>{booking.client?.full_name?.[0] || "C"}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{booking.client?.full_name || "Unknown Client"}</p>
            <p className="text-sm text-muted-foreground">{booking.service_name}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-medium">{formatDate(booking.booking_date)}</p>
            <p className="text-sm text-muted-foreground">
              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
