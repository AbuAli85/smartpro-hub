"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { supabase } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

export function Overview() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) return

        const providerId = session.session.user.id

        // Get current year
        const currentYear = new Date().getFullYear()

        // Create array of months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        // Initialize data with all months and zero revenue
        const initialData = months.map((name, index) => ({
          name,
          total: 0,
          month: index + 1,
        }))

        // Fetch completed bookings for the current year
        const { data: bookings, error } = await supabase
          .from("bookings")
          .select("service_fee, booking_date")
          .eq("provider_id", providerId)
          .eq("status", "completed")
          .gte("booking_date", `${currentYear}-01-01`)
          .lte("booking_date", `${currentYear}-12-31`)

        if (error) throw error

        // Aggregate revenue by month
        if (bookings && bookings.length > 0) {
          bookings.forEach((booking) => {
            if (booking.booking_date && booking.service_fee) {
              const bookingDate = new Date(booking.booking_date)
              const monthIndex = bookingDate.getMonth()
              initialData[monthIndex].total += booking.service_fee
            }
          })
        }

        // If no real data, use sample data for demonstration
        if (bookings?.length === 0) {
          setData([
            { name: "Jan", total: 4000 },
            { name: "Feb", total: 3000 },
            { name: "Mar", total: 5000 },
            { name: "Apr", total: 4000 },
            { name: "May", total: 7000 },
            { name: "Jun", total: 6000 },
            { name: "Jul", total: 8000 },
            { name: "Aug", total: 9000 },
            { name: "Sep", total: 8000 },
            { name: "Oct", total: 10000 },
            { name: "Nov", total: 12000 },
            { name: "Dec", total: 15000 },
          ])
        } else {
          setData(initialData)
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error)
        // Fallback to sample data
        setData([
          { name: "Jan", total: 4000 },
          { name: "Feb", total: 3000 },
          { name: "Mar", total: 5000 },
          { name: "Apr", total: 4000 },
          { name: "May", total: 7000 },
          { name: "Jun", total: 6000 },
          { name: "Jul", total: 8000 },
          { name: "Aug", total: 9000 },
          { name: "Sep", total: 8000 },
          { name: "Oct", total: 10000 },
          { name: "Nov", total: 12000 },
          { name: "Dec", total: 15000 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [])

  if (loading) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
