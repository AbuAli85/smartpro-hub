import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { SessionDebug } from "@/components/auth/session-debug"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Add a console log to help debug
    console.log("Dashboard layout: No session found, redirecting to login")
    redirect("/login?redirectedFrom=/dashboard")
  }

  console.log("Dashboard layout: Session found, rendering dashboard")

  // Fetch profile data
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", session.user.id)
    .single()

  if (error) {
    console.error("Error fetching profile:", error)
    // Handle the error appropriately
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <DashboardSidebar userRole={profile?.role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader user={session.user} profile={profile} />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
      {process.env.NODE_ENV === "development" && <SessionDebug />}
    </div>
  )
}
