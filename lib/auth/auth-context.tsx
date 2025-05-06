"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"
import type { UserRole } from "@/types/supabase"
import type { Tables } from "@/lib/supabase/client"

// Import the profile debug functions
import { createProfileIfMissing } from "@/lib/auth/profile-debug"

// Use the Tables type from the client
export type Profile = Tables<"profiles">

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  role: UserRole | null
  profile: Profile | null
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [role, setRole] = useState<UserRole | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mounted, setMounted] = useState(false)

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error refreshing session:", error)
        return
      }

      setSession(data.session)
      setUser(data.session?.user ?? null)

      if (data.session?.user) {
        await fetchProfile(data.session.user.id)
      }
    } catch (error) {
      console.error("Unexpected error refreshing session:", error)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)

        // If the profile doesn't exist, try to create it
        if (profileError.code === "PGRST116") {
          // No rows returned
          console.log("Profile not found, attempting to create one")
          if (user) {
            const created = await createProfileIfMissing(user)
            if (created) {
              // Try fetching the profile again
              const { data: newProfileData, error: newProfileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single()

              if (!newProfileError) {
                console.log("Profile created and fetched successfully:", newProfileData)
                setProfile(newProfileData as Profile)
                setRole((newProfileData?.role as UserRole) || null)
                return
              }
            }
          }
        }
      } else {
        console.log("Profile data loaded:", profileData)
        setProfile(profileData as Profile)
        setRole((profileData?.role as UserRole) || null)
      }
    } catch (error) {
      console.error("Unexpected error fetching profile:", error)
    }
  }

  useEffect(() => {
    setMounted(true)

    async function getSession() {
      setIsLoading(true)
      try {
        console.log("AuthContext: Getting session")
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setIsLoading(false)
          return
        }

        console.log("AuthContext: Session retrieved", session ? "exists" : "none")
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error("Unexpected error getting session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Set up the auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.email)

      // Important: Update the session in localStorage to ensure persistence
      if (newSession && typeof window !== "undefined") {
        localStorage.setItem("smartpro-auth", JSON.stringify(newSession))
      }

      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (newSession?.user) {
        await fetchProfile(newSession.user.id)
      } else {
        setProfile(null)
        setRole(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      setRole(null)

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("supabase.auth.token")
        localStorage.removeItem("smartpro-auth")
      }

      // Force reload to clear any cached state
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    role,
    profile,
    signOut,
    refreshSession,
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
