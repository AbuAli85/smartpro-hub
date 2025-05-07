import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Store the client instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// Check if Supabase environment variables are configured
export function isSupabaseConfigured(): boolean {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Check if the variables exist and are not empty
    const isConfigured =
      typeof supabaseUrl === "string" &&
      typeof supabaseAnonKey === "string" &&
      supabaseUrl.length > 0 &&
      supabaseAnonKey.length > 0

    // Log configuration status for debugging
    if (!isConfigured) {
      console.warn("Supabase is not properly configured:", {
        urlExists: typeof supabaseUrl === "string",
        keyExists: typeof supabaseAnonKey === "string",
        urlNotEmpty: typeof supabaseUrl === "string" && supabaseUrl.length > 0,
        keyNotEmpty: typeof supabaseAnonKey === "string" && supabaseAnonKey.length > 0,
      })
    }

    return isConfigured
  } catch (error) {
    console.error("Error checking Supabase configuration:", error)
    return false
  }
}

// Get or create the Supabase client
export function getSupabaseClient() {
  try {
    // Create the client if it doesn't exist
    if (!supabaseInstance) {
      if (!isSupabaseConfigured()) {
        console.warn(
          "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
        )
        return createDummyClient()
      }

      supabaseInstance = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: "smartpro_supabase_auth",
            storage: {
              getItem: (key) => {
                try {
                  return localStorage.getItem(key)
                } catch (error) {
                  console.error("Error getting auth item from storage:", error)
                  return null
                }
              },
              setItem: (key, value) => {
                try {
                  localStorage.setItem(key, value)
                } catch (error) {
                  console.error("Error setting auth item in storage:", error)
                }
              },
              removeItem: (key) => {
                try {
                  localStorage.removeItem(key)
                } catch (error) {
                  console.error("Error removing auth item from storage:", error)
                }
              },
            },
          },
          global: {
            headers: {
              "Content-Type": "application/json",
            },
          },
        },
      )
    }

    return supabaseInstance
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    return createDummyClient()
  }
}

// Create a dummy client for fallback
function createDummyClient() {
  console.warn("Using dummy Supabase client - this is for demo purposes only")

  // Demo user data
  const demoUser = {
    id: "demo-user-id",
    email: "demo@example.com",
    user_metadata: { role: "client" },
    created_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
  }

  // Demo profile data
  const demoProfile = {
    id: "demo-user-id",
    full_name: "Demo User",
    role: "client",
    phone: "555-123-4567",
  }

  return {
    auth: {
      getSession: async () => ({
        data: {
          session: {
            user: demoUser,
          },
        },
        error: null,
      }),
      getUser: async () => ({
        data: { user: demoUser },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback) => {
        // Simulate an auth state change
        setTimeout(() => {
          callback("SIGNED_IN", { user: demoUser })
        }, 100)
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
          error: null,
        }
      },
      refreshSession: async () => ({
        data: {
          session: {
            user: demoUser,
          },
        },
        error: null,
      }),
    },
    from: (table) => {
      return {
        select: (columns) => ({
          eq: (column, value) => ({
            single: async () => {
              if (table === "profiles" && value === "demo-user-id") {
                return { data: demoProfile, error: null }
              }
              return { data: null, error: null }
            },
            count: (countOption) => {
              // Return demo counts for different tables
              if (table === "bookings") return { count: 3, error: null }
              if (table === "contracts") return { count: 2, error: null }
              if (table === "messages") return { count: 5, error: null }
              return { count: 0, error: null }
            },
          }),
        }),
      }
    },
  } as unknown as ReturnType<typeof createClient<Database>>
}

// For backward compatibility - create a client if possible
export const supabase = typeof window !== "undefined" ? getSupabaseClient() : createDummyClient()

// Add a global unhandled rejection handler for debugging
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason?.message?.includes("Auth session missing")) {
      console.log("Auth session missing - this is expected for unauthenticated users")
    } else {
      console.error("Unhandled Promise Rejection in Supabase client:", event.reason || {})
    }
    // Prevent the error from propagating
    event.preventDefault()
  })
}
