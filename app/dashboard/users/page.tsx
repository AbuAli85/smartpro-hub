"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Tables } from "@/lib/supabase/client"

export default function UsersPage() {
  const { role, profile } = useAuth()
  const [users, setUsers] = useState<Tables<"profiles">[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<Tables<"profiles"> | null>(null)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Only admin and providers should access this page
    if (mounted && role !== "admin" && role !== "provider") {
      router.push("/dashboard")
      return
    }

    async function fetchUsers() {
      setIsLoading(true)

      // If admin, fetch all users
      // If provider, fetch only clients
      const query = supabase.from("profiles").select("*")

      if (role === "provider") {
        query.eq("role", "client")
      }

      const { data, error } = await query.order("created_at", { ascending: false })

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

    if (mounted && (role === "admin" || role === "provider")) {
      fetchUsers()
    }
  }, [role, router, mounted])

  function getInitials(firstName: string | null, lastName: string | null) {
    return `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase() || "U"
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (role !== "admin" && role !== "provider") {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{role === "admin" ? "User Management" : "Clients"}</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || ""} alt={user.email || ""} />
                    <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {user.first_name ? `${user.first_name} ${user.last_name}` : "User"}
                    </CardTitle>
                    <CardDescription className="text-xs">{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Role:</span>
                    <Badge
                      variant={user.role === "admin" ? "destructive" : user.role === "provider" ? "default" : "outline"}
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Joined:</span>
                    <span className="text-sm">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>User Details</DialogTitle>
                          <DialogDescription>{selectedUser?.email}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={selectedUser?.avatar_url || ""} alt={selectedUser?.email || ""} />
                              <AvatarFallback>
                                {selectedUser && getInitials(selectedUser.first_name, selectedUser.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">
                                {selectedUser?.first_name
                                  ? `${selectedUser.first_name} ${selectedUser.last_name}`
                                  : "User"}
                              </h3>
                              <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Role</p>
                              <p className="text-sm text-muted-foreground">{selectedUser?.role}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Joined</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedUser?.created_at && new Date(selectedUser.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">User ID</p>
                            <p className="text-sm text-muted-foreground break-all">{selectedUser?.id}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
