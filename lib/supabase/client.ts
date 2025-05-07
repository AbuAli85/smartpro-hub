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

  // Create a more robust dummy client with better method chaining support
  return {
    auth: {
      getSession: async () => ({
        data: {
          session: {
            user: demoUser,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
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
            expires_at: Math.floor(Date.now() / 1000) + 3600,
          },
        },
        error: null,
      }),
    },
    from: (table) => {
      // Create a query builder with proper method chaining
      const queryBuilder = {
        select: (columns) => {
          const filtered = {
            eq: (column, value) => {
              // Support for chaining multiple eq calls
              return {
                ...filtered,
                eq: (nextColumn, nextValue) => {
                  return filtered
                },
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
                limit: (limit) => filtered,
                order: (column, options) => filtered,
                range: (from, to) => filtered,
                then: (callback) => Promise.resolve(callback({ data: [], error: null })),
              }
            },
            neq: () => filtered,
            gt: () => filtered,
            lt: () => filtered,
            gte: () => filtered,
            lte: () => filtered,
            like: () => filtered,
            ilike: () => filtered,
            is: () => filtered,
            in: () => filtered,
            contains: () => filtered,
            containedBy: () => filtered,
            rangeLt: () => filtered,
            rangeGt: () => filtered,
            rangeGte: () => filtered,
            rangeLte: () => filtered,
            rangeAdjacent: () => filtered,
            overlaps: () => filtered,
            textSearch: () => filtered,
            filter: () => filtered,
            not: () => filtered,
            or: () => filtered,
            and: () => filtered,
            limit: () => filtered,
            order: () => filtered,
            range: () => filtered,
            single: async () => ({ data: null, error: null }),
            maybeSingle: async () => ({ data: null, error: null }),
            then: (callback) => Promise.resolve(callback({ data: [], error: null })),
          }
          return filtered
        },
        insert: () => ({
          select: () => ({
            then: (callback) => Promise.resolve(callback({ data: null, error: null })),
          }),
          then: (callback) => Promise.resolve(callback({ data: null, error: null })),
        }),
        update: () => ({
          eq: () => ({
            then: (callback) => Promise.resolve(callback({ data: null, error: null })),
          }),
          then: (callback) => Promise.resolve(callback({ data: null, error: null })),
        }),
        delete: () => ({
          eq: () => ({
            then: (callback) => Promise.resolve(callback({ data: null, error: null })),
          }),
          then: (callback) => Promise.resolve(callback({ data: null, error: null })),
        }),
        rpc: (fn, params) => ({
          then: (callback) => Promise.resolve(callback({ data: null, error: null })),
        }),
      }
      return queryBuilder
    },
    storage: {
      from: (bucket) => ({
        upload: async () => ({ data: { path: "demo-path" }, error: null }),
        download: async () => ({ data: new Blob(), error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "https://example.com/demo-image.jpg" } }),
        list: async () => ({ data: [], error: null }),
        remove: async () => ({ data: null, error: null }),
      }),
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
