"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { UserRole } from "@/types/supabase"
import type { Tables } from "@/lib/supabase/client"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Tables<"profiles">[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { role, session } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (role !== "admin") {
      router.push("/dashboard")
      return
    }

    async function fetchUsers() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, role, created_at")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        })
        return
      }

      setUsers(data as Tables<"profiles">[])
      setIsLoading(false)
    }

    if (mounted && role === "admin") {
      fetchUsers()
    }
  }, [role, router, mounted])

  async function handleRoleChange(userId: string, newRole: UserRole) {
    try {
      if (!session) {
        throw new Error("Not authenticated")
      }

      console.log("Updating role for user:", userId, "to", newRole)

      // Call the Edge Function
      const response = await fetch("https://kpkvgkjlencbkchtssaf.supabase.co/functions/v1/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId, newRole }),
      })

      const data = await response.json()
      console.log("Edge function response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role")
      }

      // Update the local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      })
    } catch (error) {
      console.error("Error updating role:", error)
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (role !== "admin") {
    return null
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Management</h1>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle>{user.first_name ? `${user.first_name} ${user.last_name}` : "User"}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">ID: {user.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Role:</span>
                    <Select
                      defaultValue={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="provider">Provider</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
