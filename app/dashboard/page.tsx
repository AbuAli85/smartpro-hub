"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useIntl } from "react-intl"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const intl = useIntl()
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.email) {
      fetchUserProfile(session.user.email)
    }
  }, [status, session, router])

  const fetchUserProfile = async (email: string) => {
    const { data, error } = await supabase.from("user_profiles").select("*").eq("email", email).single()

    if (error) {
      console.error("Error fetching user profile:", error)
    } else {
      setUserProfile(data)
    }
  }

  if (status === "loading" || !userProfile) {
    return <div>{intl.formatMessage({ id: "loading" })}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {intl.formatMessage({ id: "welcome" }, { name: userProfile.company_name || userProfile.name })}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{intl.formatMessage({ id: "profile" })}</CardTitle>
            <CardDescription>{intl.formatMessage({ id: "profileDescription" })}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/profile")}>{intl.formatMessage({ id: "viewProfile" })}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{intl.formatMessage({ id: "services" })}</CardTitle>
            <CardDescription>{intl.formatMessage({ id: "servicesDescription" })}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/services")}>{intl.formatMessage({ id: "manageServices" })}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{intl.formatMessage({ id: "appointments" })}</CardTitle>
            <CardDescription>{intl.formatMessage({ id: "appointmentsDescription" })}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/appointments")}>
              {intl.formatMessage({ id: "viewAppointments" })}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

