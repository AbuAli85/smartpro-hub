"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, User, ArrowLeft, FileText } from "lucide-react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    async function fetchBookingDetails() {
      try {
        if (!params.id) return

        const { data: session } = await supabase.auth.getSession()
        if (!session.session) {
          router.push("/auth/login")
          return
        }

        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            provider:provider_id(id, full_name, email, phone)
          `)
          .eq("id", params.id)
          .single()

        if (error) throw error

        // Verify this booking belongs to the current user
        if (data.client_id !== session.session.user.id) {
          toast({
            title: "Access denied",
            description: "You don't have permission to view this booking",
            variant: "destructive",
          })
          router.push("/client/bookings")
          return
        }

        setBooking(data)
      } catch (error: any) {
        console.error("Error fetching booking details:", error)
        toast({
          title: "Error",
          description: "Failed to load booking details",
          variant: "destructive",
        })
        router.push("/client/bookings")
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [params.id, router])

  const handleCancelBooking = async () => {
    if (!booking) return

    setCancelling(true)
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", booking.id)

      if (error) throw error

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      })

      // Update local state
      setBooking({ ...booking, status: "cancelled" })
    } catch (error: any) {
      console.error("Error cancelling booking:", error)
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      })
    } finally {
      setCancelling(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">Booking not found</h1>
          <p className="mb-4 text-muted-foreground">
            The booking you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/client/bookings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center">
        <Button variant="outline" size="sm" className="mr-4" asChild>
          <Link href="/client/bookings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Booking Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{booking.service_name}</CardTitle>
                <CardDescription>Booking #{booking.id.substring(0, 8)}</CardDescription>
              </div>
              {getStatusBadge(booking.status)}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Date:</span>
                    <span>{formatDate(booking.booking_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Time:</span>
                    <span>
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </span>
                  </div>
                  {booking.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                      <span>{booking.location}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Provider:</span>
                    <span>{booking.provider?.full_name || "Unknown Provider"}</span>
                  </div>
                  {booking.price && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Price:</span>
                      <span>${booking.price.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {booking.notes && (
                <div>
                  <h3 className="mb-2 font-medium">Notes</h3>
                  <p className="text-muted-foreground">{booking.notes}</p>
                </div>
              )}

              {booking.status === "cancelled" && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-950">
                  <p className="text-red-800 dark:text-red-300">
                    This booking has been cancelled. If you need to reschedule, please create a new booking.
                  </p>
                </div>
              )}

              {booking.status === "completed" && (
                <div className="rounded-md bg-green-50 p-4 dark:bg-green-950">
                  <p className="text-green-800 dark:text-green-300">
                    This booking has been completed. Thank you for using our services!
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/client/messages?provider=${booking.provider_id}`}>Contact Provider</Link>
              </Button>
              {booking.status === "confirmed" && (
                <Button variant="destructive" onClick={handleCancelBooking} disabled={cancelling}>
                  {cancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...
                    </>
                  ) : (
                    "Cancel Booking"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Provider Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {booking.provider?.full_name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-medium">{booking.provider?.full_name || "Unknown Provider"}</p>
                  <p className="text-sm text-muted-foreground">{booking.provider?.email || ""}</p>
                </div>
              </div>
              {booking.provider?.phone && (
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-muted-foreground">{booking.provider.phone}</p>
                </div>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/client/providers/${booking.provider_id}`}>View Provider Profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Related</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/client/bookings/new">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Another Service
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/client/contracts">
                  <FileText className="mr-2 h-4 w-4" />
                  View Contracts
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
