"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useIntl } from "react-intl"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AppointmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const intl = useIntl()
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.email) {
      fetchAppointments(session.user.email)
    }
  }, [status, session, router])

  const fetchAppointments = async (email: string) => {
    setIsLoading(true)
    const { data, error } = await supabase.from("appointments").select("*").eq("provider_email", email)

    if (error) {
      console.error("Error fetching appointments:", error)
    } else {
      setAppointments(data || [])
    }
    setIsLoading(false)
  }

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    const { error } = await supabase.from("appointments").update({ status: newStatus }).eq("id", appointmentId)

    if (error) {
      console.error("Error updating appointment status:", error)
    } else {
      setAppointments(appointments.map((app) => (app.id === appointmentId ? { ...app, status: newStatus } : app)))
    }
  }

  if (isLoading) {
    return <div>{intl.formatMessage({ id: "loading" })}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{intl.formatMessage({ id: "appointments" })}</h1>
      {appointments.length === 0 ? (
        <p>{intl.formatMessage({ id: "noAppointments" })}</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="border p-4 rounded">
              <h3 className="font-semibold">{appointment.service_name}</h3>
              <p>
                {intl.formatMessage({ id: "client" })}: {appointment.client_name}
              </p>
              <p>
                {intl.formatMessage({ id: "date" })}: {new Date(appointment.date).toLocaleString()}
              </p>
              <p>
                {intl.formatMessage({ id: "status" })}: {appointment.status}
              </p>
              <div className="mt-2 space-x-2">
                <Button onClick={() => handleStatusChange(appointment.id, "confirmed")}>
                  {intl.formatMessage({ id: "confirm" })}
                </Button>
                <Button onClick={() => handleStatusChange(appointment.id, "cancelled")}>
                  {intl.formatMessage({ id: "cancel" })}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

