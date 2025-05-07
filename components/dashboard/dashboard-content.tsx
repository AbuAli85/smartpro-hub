"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { DollarSign, Users, FileText, MessageSquare, Calendar, AlertCircle, ArrowRight } from "lucide-react"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [profileError, setProfileError] = useState<any>(null)
  const [bookingsCount, setBookingsCount] = useState(0)
  const [contractsCount, setContractsCount] = useState(0)
  const [messagesCount, setMessagesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)

  const supabase = getSupabaseClient()

  useEffect(() => {
    async function loadData() {
      try {
        // Get the user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error("Error fetching user:", userError)

          // Check if the error is related to Supabase configuration
          if (
            userError.message.includes("not configured") ||
            userError.message.includes("Invalid URL") ||
            userError.message.includes("anon key")
          ) {
            setSupabaseConfigured(false)

            // Set demo data
            setUser({ email: "demo@example.com" })
            setProfile({
              full_name: "Demo User",
              role: "client",
              phone: "555-123-4567",
            })
            setUserRole("client")
            setBookingsCount(3)
            setContractsCount(2)
            setMessagesCount(5)
          }

          setLoading(false)
          return
        }

        if (!user) {
          window.location.href = "/auth/login?redirectedFrom=/dashboard"
          return
        }

        setUser(user)

        // Get user profile
        try {
          const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          if (error) {
            console.error("Error fetching profile:", error)
            setProfileError(error)
          } else {
            setProfile(data)
            setUserRole(data?.role || user.user_metadata?.role || null)
          }
        } catch (err) {
          console.error("Exception fetching profile:", err)
          setProfileError(err instanceof Error ? err : new Error(String(err)))
        }

        // Get counts
        try {
          // Get bookings count
          const { count: bookings, error: bookingsError } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("client_id", user.id)

          if (!bookingsError && bookings !== null) {
            setBookingsCount(bookings)
          }

          // Get contracts count
          const { count: contracts, error: contractsError } = await supabase
            .from("contracts")
            .select("*", { count: "exact", head: true })
            .eq("client_id", user.id)

          if (!contractsError && contracts !== null) {
            setContractsCount(contracts)
          }

          // Get unread messages count
          const { count: messages, error: messagesError } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", user.id)
            .eq("read", false)

          if (!messagesError && messages !== null) {
            setMessagesCount(messages)
          }
        } catch (err) {
          console.error("Error fetching counts:", err)
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {!supabaseConfigured && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Supabase Not Configured</AlertTitle>
          <AlertDescription>
            The Supabase integration is not properly configured. Please set up your environment variables. You are
            currently viewing demo data.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/debug/supabase">Debug Supabase</Link>
          </Button>
          <SignOutButton />
        </div>
      </div>

      {profileError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading profile</AlertTitle>
          <AlertDescription>
            {profileError.message || "There was a problem loading your profile data."}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <CardTitle>Welcome, {profile?.full_name || user.email}</CardTitle>
                <CardDescription className="text-white text-opacity-90">
                  {userRole ? `You are logged in as a ${userRole}` : "You don't have a role assigned yet"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 pb-2">
                {userRole ? (
                  <div className="space-y-4">
                    <p>
                      You have been assigned the role of <strong className="text-purple-600">{userRole}</strong>. You
                      can access your role-specific dashboard using the button below.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-yellow-700 bg-yellow-50 p-4 rounded-md">
                      You don't have a role assigned yet. Please complete your profile setup to get started.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 pb-6">
                {userRole ? (
                  <Button asChild className="w-full">
                    <Link href={`/${userRole}/dashboard`}>
                      Go to {userRole} Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/profile-setup">Complete Profile Setup</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium">{userRole || "Not set"}</p>
                    </div>
                    {profile && (
                      <>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{profile.full_name || "Not set"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{profile.phone || "Not set"}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/profile">
                    <Users className="mr-2 h-4 w-4" />
                    Update Profile
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used features</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/bookings">
                      <Calendar className="mr-2 h-4 w-4" />
                      Manage Bookings
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/contracts">
                      <FileText className="mr-2 h-4 w-4" />
                      View Contracts
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/messages">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href={`/${userRole}/dashboard`}>
                      <Users className="mr-2 h-4 w-4" />
                      {userRole} Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookingsCount}</div>
                <p className="text-xs text-muted-foreground">
                  {bookingsCount === 0
                    ? "No bookings yet"
                    : `${bookingsCount} booking${bookingsCount !== 1 ? "s" : ""}`}
                </p>
              </CardContent>
              <CardFooter className="pt-0 px-4 pb-4">
                {bookingsCount > 0 && (
                  <Button asChild variant="link" className="h-auto p-0">
                    <Link href="/dashboard/bookings">View all bookings</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contractsCount}</div>
                <p className="text-xs text-muted-foreground">
                  {contractsCount === 0
                    ? "No active contracts"
                    : `${contractsCount} contract${contractsCount !== 1 ? "s" : ""}`}
                </p>
              </CardContent>
              <CardFooter className="pt-0 px-4 pb-4">
                {contractsCount > 0 && (
                  <Button asChild variant="link" className="h-auto p-0">
                    <Link href="/dashboard/contracts">View all contracts</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{messagesCount}</div>
                <p className="text-xs text-muted-foreground">
                  {messagesCount === 0
                    ? "No unread messages"
                    : `${messagesCount} unread message${messagesCount !== 1 ? "s" : ""}`}
                </p>
              </CardContent>
              <CardFooter className="pt-0 px-4 pb-4">
                {messagesCount > 0 && (
                  <Button asChild variant="link" className="h-auto p-0">
                    <Link href="/dashboard/messages">View messages</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.00</div>
                <p className="text-xs text-muted-foreground">No transactions yet</p>
              </CardContent>
              <CardFooter className="pt-0 px-4 pb-4">
                <Button asChild variant="link" className="h-auto p-0">
                  <Link href="/dashboard/billing">View billing</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>View and manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Personal Information</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p>{profile?.full_name || "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{profile?.phone || "Not set"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Account Status</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p>{userRole || "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p>
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : new Date(user.created_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/dashboard/profile">Edit Profile</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Bookings</CardTitle>
                <CardDescription>View and manage your appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <p>You have {bookingsCount} active bookings.</p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/dashboard/bookings">Go to Bookings</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>View Contracts</CardTitle>
                <CardDescription>Manage your service agreements</CardDescription>
              </CardHeader>
              <CardContent>
                <p>You have {contractsCount} active contracts.</p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/dashboard/contracts">Go to Contracts</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Check your communications</CardDescription>
              </CardHeader>
              <CardContent>
                <p>You have {messagesCount} unread messages.</p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/dashboard/messages">Go to Messages</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
