"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Calendar, Clock, DollarSign, AlertCircle, RefreshCw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Service = {
  id: string
  name: string
  description: string
  price: number
  duration: number
  is_active: boolean
  provider_id: string
  created_at: string
  updated_at: string
  provider?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

type TimeSlot = {
  start: string
  end: string
  formatted: string
}

type Booking = {
  id: string
  client_id: string
  provider_id: string
  service_id: string
  booking_date: string
  start_time: string
  end_time: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  notes: string
  created_at: string
  service?: {
    name: string
    price: number
    duration: number
  }
  provider?: {
    full_name: string
    avatar_url?: string
  }
}

// Constants for API request timeouts
const API_TIMEOUT = 15000 // 15 seconds

export default function ServiceBooking() {
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [bookingsError, setBookingsError] = useState<string | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false)
  const [timeSlotsError, setTimeSlotsError] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [bookingNotes, setBookingNotes] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [realtimeSubscribed, setRealtimeSubscribed] = useState(false)
  const { toast } = useToast()

  // Helper function to create a timeout promise
  const createTimeout = (ms: number) => {
    return new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms))
  }

  // Fetch services and bookings on component mount
  useEffect(() => {
    fetchServices()
    fetchBookings()

    // Set up realtime subscription with improved error handling
    setupRealtimeSubscriptions()

    // Cleanup function
    return () => {
      cleanupRealtimeSubscriptions()
    }
  }, [])

  // Setup realtime subscriptions with error handling
  const setupRealtimeSubscriptions = () => {
    if (realtimeSubscribed) return

    try {
      console.log("Setting up realtime subscriptions...")

      const bookingsSubscription = supabase
        .channel("bookings-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
          },
          (payload) => {
            console.log("Realtime bookings update:", payload)
            fetchBookings()
          },
        )
        .subscribe((status) => {
          console.log(`Bookings subscription status: ${status}`)
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to bookings changes")
          } else if (status === "CHANNEL_ERROR") {
            console.error("Error subscribing to bookings changes")
            // Try to reconnect after a delay
            setTimeout(() => {
              if (!realtimeSubscribed) setupRealtimeSubscriptions()
            }, 5000)
          }
        })

      const servicesSubscription = supabase
        .channel("services-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "provider_services", // Correct table name
          },
          (payload) => {
            console.log("Realtime services update:", payload)
            fetchServices()
          },
        )
        .subscribe((status) => {
          console.log(`Services subscription status: ${status}`)
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to services changes")
          } else if (status === "CHANNEL_ERROR") {
            console.error("Error subscribing to services changes")
            // Try to reconnect after a delay
            setTimeout(() => {
              if (!realtimeSubscribed) setupRealtimeSubscriptions()
            }, 5000)
          }
        })

      // Store subscriptions in component state for cleanup
      setRealtimeSubscribed(true)

      // Store subscriptions in window for cleanup
      window.__bookingsSubscription = bookingsSubscription
      window.__servicesSubscription = servicesSubscription
    } catch (error) {
      console.error("Error setting up realtime subscriptions:", error)
      // Try to reconnect after a delay
      setTimeout(() => {
        if (!realtimeSubscribed) setupRealtimeSubscriptions()
      }, 5000)
    }
  }

  // Cleanup realtime subscriptions
  const cleanupRealtimeSubscriptions = () => {
    try {
      if (window.__bookingsSubscription) {
        window.__bookingsSubscription.unsubscribe()
      }
      if (window.__servicesSubscription) {
        window.__servicesSubscription.unsubscribe()
      }
      setRealtimeSubscribed(false)
    } catch (error) {
      console.error("Error cleaning up subscriptions:", error)
    }
  }

  const fetchServices = async () => {
    try {
      setLoading(true)
      setServicesError(null)

      console.log("Fetching services...")

      // Race the fetch against a timeout
      const result = await Promise.race([
        supabase
          .from("provider_services") // Correct table name
          .select(`
            *,
            provider:provider_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq("is_active", true)
          .order("name"),
        createTimeout(API_TIMEOUT),
      ])

      // If we get here, the fetch succeeded
      const { data, error } = result as any

      if (error) {
        console.error("Supabase error fetching services:", error)
        throw error
      }

      console.log(`Fetched ${data?.length || 0} services`)
      setServices(data || [])
    } catch (error: any) {
      console.error("Error fetching services:", error)
      setServicesError(error.message || "Failed to load services")
      toast({
        title: "Error fetching services",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setBookingsError(null)

      console.log("Fetching bookings...")

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`)
      }

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Race the fetch against a timeout
      const result = await Promise.race([
        supabase
          .from("bookings")
          .select(`
            *,
            service:service_id (
              name,
              price,
              duration
            ),
            provider:provider_id (
              full_name,
              avatar_url
            )
          `)
          .eq("client_id", user.id)
          .order("booking_date", { ascending: false })
          .order("start_time", { ascending: true }),
        createTimeout(API_TIMEOUT),
      ])

      // If we get here, the fetch succeeded
      const { data, error } = result as any

      if (error) {
        console.error("Supabase error fetching bookings:", error)
        throw error
      }

      console.log(`Fetched ${data?.length || 0} bookings`)
      setBookings(data || [])
    } catch (error: any) {
      console.error("Error fetching bookings:", error)
      setBookingsError(error.message || "Failed to load bookings")
      toast({
        title: "Error fetching bookings",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateTimeSlots = async (date: Date, serviceId: string) => {
    try {
      setTimeSlotsLoading(true)
      setTimeSlotsError(null)

      if (!date || !serviceId) return []

      console.log(`Generating time slots for date: ${date.toISOString().split("T")[0]} and service: ${serviceId}`)

      // Race the service fetch against a timeout
      const serviceResult = await Promise.race([
        supabase
          .from("provider_services") // Correct table name
          .select("*")
          .eq("id", serviceId)
          .single(),
        createTimeout(API_TIMEOUT),
      ])

      // If we get here, the fetch succeeded
      const { data: serviceData, error: serviceError } = serviceResult as any

      if (serviceError) {
        console.error("Error fetching service details:", serviceError)
        throw serviceError
      }

      const service = serviceData as Service
      const serviceDuration = service.duration

      // Get provider's existing bookings for the selected date
      const formattedDate = format(date, "yyyy-MM-dd")

      // Race the bookings fetch against a timeout
      const bookingsResult = await Promise.race([
        supabase
          .from("bookings")
          .select("start_time, end_time")
          .eq("provider_id", service.provider_id)
          .eq("booking_date", formattedDate)
          .not("status", "eq", "cancelled"),
        createTimeout(API_TIMEOUT),
      ])

      // If we get here, the fetch succeeded
      const { data: existingBookings, error: bookingsError } = bookingsResult as any

      if (bookingsError) {
        console.error("Error fetching existing bookings:", bookingsError)
        throw bookingsError
      }

      // Generate time slots (9 AM to 5 PM)
      const slots: TimeSlot[] = []
      const startHour = 9
      const endHour = 17

      // Convert existing bookings to blocked time ranges
      const blockedTimes =
        existingBookings?.map((booking: any) => ({
          start: booking.start_time,
          end: booking.end_time,
        })) || []

      // Generate 30-minute slots
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

          // Calculate end time based on service duration
          const startMinutes = hour * 60 + minute
          const endMinutes = startMinutes + serviceDuration
          const endHour = Math.floor(endMinutes / 60)
          const endMinute = endMinutes % 60

          // Skip if end time is after business hours
          if (endHour >= endHour && endMinute > 0) continue

          const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`

          // Check if slot overlaps with any existing booking
          const isOverlapping = blockedTimes.some((blocked: any) => {
            return (
              (startTime >= blocked.start && startTime < blocked.end) ||
              (endTime > blocked.start && endTime <= blocked.end) ||
              (startTime <= blocked.start && endTime >= blocked.end)
            )
          })

          if (!isOverlapping) {
            slots.push({
              start: startTime,
              end: endTime,
              formatted: `${formatTime(startTime)} - ${formatTime(endTime)}`,
            })
          }
        }
      }

      console.log(`Generated ${slots.length} available time slots`)
      return slots
    } catch (error: any) {
      console.error("Error generating time slots:", error)
      setTimeSlotsError(error.message || "Failed to load available time slots")
      toast({
        title: "Error",
        description: "Failed to load available time slots",
        variant: "destructive",
      })
      return []
    } finally {
      setTimeSlotsLoading(false)
    }
  }

  const formatTime = (time24: string) => {
    const [hour, minute] = time24.split(":").map(Number)
    const period = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`
  }

  const handleServiceSelect = async (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId) || null
    setSelectedService(service)
    setSelectedTimeSlot(null)

    if (service && selectedDate) {
      const slots = await generateTimeSlots(selectedDate, service.id)
      setAvailableTimeSlots(slots)
    } else {
      setAvailableTimeSlots([])
    }
  }

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTimeSlot(null)

    if (date && selectedService) {
      const slots = await generateTimeSlots(date, selectedService.id)
      setAvailableTimeSlots(slots)
    } else {
      setAvailableTimeSlots([])
    }
  }

  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) {
      toast({
        title: "Incomplete booking",
        description: "Please select a service, date, and time slot",
        variant: "destructive",
      })
      return
    }

    try {
      setBookingLoading(true)

      console.log("Creating booking...")

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`)
      }

      if (!user) {
        throw new Error("User not authenticated")
      }

      const selectedSlot = availableTimeSlots.find((slot) => slot.start === selectedTimeSlot)

      if (!selectedSlot) {
        throw new Error("Selected time slot is no longer available")
      }

      // Create booking
      const { error } = await supabase.from("bookings").insert({
        client_id: user.id,
        provider_id: selectedService.provider_id,
        service_id: selectedService.id,
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        status: "pending",
        notes: bookingNotes,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error creating booking:", error)
        throw error
      }

      console.log("Booking created successfully")

      toast({
        title: "Booking successful",
        description: "Your booking request has been submitted",
        variant: "default",
      })

      // Reset form and close dialog
      setSelectedService(null)
      setSelectedDate(undefined)
      setSelectedTimeSlot(null)
      setBookingNotes("")
      setIsDialogOpen(false)

      // Refresh bookings
      fetchBookings()
    } catch (error: any) {
      console.error("Error creating booking:", error)
      toast({
        title: "Booking failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setBookingLoading(false)
    }
  }

  const cancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return
    }

    try {
      setLoading(true)

      console.log(`Cancelling booking: ${bookingId}`)

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`)
      }

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId)
        .eq("client_id", user.id) // Security check

      if (error) {
        console.error("Error cancelling booking:", error)
        throw error
      }

      console.log("Booking cancelled successfully")

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
        variant: "default",
      })

      // Refresh bookings
      fetchBookings()
    } catch (error: any) {
      console.error("Error cancelling booking:", error)
      toast({
        title: "Error cancelling booking",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Book Services</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Book a Service</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Book a Service</DialogTitle>
              <DialogDescription>Select a service, date, and time to book an appointment.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="service">Select Service</Label>
                <Select onValueChange={handleServiceSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${service.price.toFixed(2)} ({service.duration} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedService && (
                <div className="grid gap-2">
                  <Label>Select Date</Label>
                  <DatePicker
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      // Disable past dates and weekends
                      const now = new Date()
                      now.setHours(0, 0, 0, 0)
                      const day = date.getDay()
                      return date < now || day === 0 || day === 6
                    }}
                  />
                </div>
              )}

              {timeSlotsLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {timeSlotsError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{timeSlotsError}</AlertDescription>
                </Alert>
              )}

              {selectedDate && !timeSlotsLoading && availableTimeSlots.length > 0 && (
                <div className="grid gap-2">
                  <Label>Select Time</Label>
                  <Select onValueChange={setSelectedTimeSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeSlots.map((slot) => (
                        <SelectItem key={slot.start} value={slot.start}>
                          {slot.formatted}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedDate && !timeSlotsLoading && availableTimeSlots.length === 0 && !timeSlotsError && (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">No available time slots for this date</p>
                </div>
              )}

              {selectedTimeSlot && (
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or information for the provider"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleBookingSubmit}
                disabled={!selectedService || !selectedDate || !selectedTimeSlot || bookingLoading}
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  "Book Appointment"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {servicesError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading services</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{servicesError}</span>
            <Button size="sm" variant="outline" onClick={fetchServices} className="ml-2">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-40 bg-muted animate-pulse" />
                <CardHeader>
                  <div className="h-5 w-3/4 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                </CardContent>
                <CardFooter>
                  <div className="h-9 w-full bg-muted animate-pulse rounded" />
                </CardFooter>
              </Card>
            ))
        ) : services.length > 0 ? (
          services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-40 flex items-center justify-center text-white">
                <div className="text-center p-4">
                  <h3 className="text-xl font-bold">{service.name}</h3>
                  <p className="text-sm opacity-90">{service.duration} minutes</p>
                </div>
              </div>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarImage src={service.provider?.avatar_url || ""} />
                  <AvatarFallback>{service.provider?.full_name?.[0] || "P"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">${service.price.toFixed(2)}</CardTitle>
                  <CardDescription>By {service.provider?.full_name}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{service.description}</p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedService(service)
                    setSelectedDate(undefined)
                    setSelectedTimeSlot(null)
                    setBookingNotes("")
                    setAvailableTimeSlots([])
                    setIsDialogOpen(true)
                  }}
                >
                  Book Now
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : !servicesError ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No services available</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              There are currently no active services available for booking. Please check back later.
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-10">
        <h3 className="text-2xl font-bold mb-6">My Bookings</h3>

        {bookingsError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading bookings</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{bookingsError}</span>
              <Button size="sm" variant="outline" onClick={fetchBookings} className="ml-2">
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {renderBookingsList(
              bookings.filter(
                (b) =>
                  (b.status === "pending" || b.status === "confirmed") &&
                  new Date(`${b.booking_date}T${b.end_time}`) >= new Date(),
              ),
              loading,
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {renderBookingsList(
              bookings.filter(
                (b) =>
                  b.status === "completed" ||
                  (b.status !== "cancelled" && new Date(`${b.booking_date}T${b.end_time}`) < new Date()),
              ),
              loading,
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            {renderBookingsList(
              bookings.filter((b) => b.status === "cancelled"),
              loading,
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  function renderBookingsList(bookingsList: Booking[], isLoading: boolean) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (bookingsList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No bookings found</h3>
          <p className="text-sm text-muted-foreground mt-1">You don't have any bookings in this category.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
            Book a service
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {bookingsList.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div
                className={`p-6 md:w-1/3 flex flex-col justify-between ${
                  booking.status === "confirmed"
                    ? "bg-green-50"
                    : booking.status === "pending"
                      ? "bg-yellow-50"
                      : booking.status === "cancelled"
                        ? "bg-red-50"
                        : "bg-gray-50"
                }`}
              >
                <div>
                  <Badge
                    variant={
                      booking.status === "confirmed"
                        ? "default"
                        : booking.status === "pending"
                          ? "secondary"
                          : booking.status === "cancelled"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                  <h3 className="text-lg font-bold mt-2">{booking.service?.name}</h3>
                  <p className="text-sm text-muted-foreground">with {booking.provider?.full_name}</p>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(new Date(booking.booking_date), "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center text-sm mt-1">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm mt-1">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>${booking.service?.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 md:w-2/3">
                <div className="flex items-center mb-4">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={booking.provider?.avatar_url || ""} />
                    <AvatarFallback>{booking.provider?.full_name?.[0] || "P"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{booking.provider?.full_name}</h4>
                    <p className="text-sm text-muted-foreground">Service Provider</p>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mt-2 mb-4">
                    <h5 className="text-sm font-medium mb-1">Your Notes:</h5>
                    <p className="text-sm text-muted-foreground">{booking.notes}</p>
                  </div>
                )}

                {booking.status === "pending" && (
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={() => cancelBooking(booking.id)}>
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }
}

// Add this to the global Window interface
declare global {
  interface Window {
    __bookingsSubscription?: any
    __servicesSubscription?: any
  }
}
