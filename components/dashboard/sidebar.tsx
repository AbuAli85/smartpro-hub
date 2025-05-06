"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar, FileText, Home, MessageSquare, Settings, Users } from "lucide-react"
import type { UserRole } from "@/types/supabase"

interface DashboardSidebarProps {
  userRole?: UserRole
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="hidden border-r bg-gray-100/40 md:block md:w-64">
        <div className="flex h-full flex-col gap-2 p-4">
          <div className="flex h-14 items-center border-b px-4 font-semibold">
            <Link href="/dashboard">SmartPRO</Link>
          </div>
          <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center">
            {/* Navigation items will be rendered after mounting */}
          </nav>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden border-r bg-gray-100/40 md:block md:w-64">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex h-14 items-center border-b px-4 font-semibold">
          <Link href="/dashboard">SmartPRO</Link>
        </div>
        <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
              pathname === "/dashboard" ? "bg-gray-100 text-gray-900" : "",
            )}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/bookings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
              pathname === "/dashboard/bookings" || pathname.startsWith("/dashboard/bookings/")
                ? "bg-gray-100 text-gray-900"
                : "",
            )}
          >
            <Calendar className="h-4 w-4" />
            <span>Bookings</span>
          </Link>

          {userRole === "provider" && (
            <Link
              href="/dashboard/availability"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                pathname === "/dashboard/availability" ? "bg-gray-100 text-gray-900" : "",
              )}
            >
              <Calendar className="h-4 w-4" />
              <span>Availability</span>
            </Link>
          )}

          <Link
            href="/dashboard/contracts"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
              pathname === "/dashboard/contracts" ? "bg-gray-100 text-gray-900" : "",
            )}
          >
            <FileText className="h-4 w-4" />
            <span>Contracts</span>
          </Link>

          <Link
            href="/dashboard/messages"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
              pathname === "/dashboard/messages" ? "bg-gray-100 text-gray-900" : "",
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </Link>

          {(userRole === "admin" || userRole === "provider") && (
            <Link
              href="/dashboard/users"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                pathname === "/dashboard/users" ? "bg-gray-100 text-gray-900" : "",
              )}
            >
              <Users className="h-4 w-4" />
              <span>{userRole === "admin" ? "User Management" : "Clients"}</span>
            </Link>
          )}

          {userRole === "admin" && (
            <Link
              href="/dashboard/admin/users"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                pathname === "/dashboard/admin/users" ? "bg-gray-100 text-gray-900" : "",
              )}
            >
              <Users className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          )}

          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
              pathname === "/dashboard/settings" ? "bg-gray-100 text-gray-900" : "",
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
