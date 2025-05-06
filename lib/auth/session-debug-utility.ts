import { supabase } from "@/lib/supabase/client"

export async function debugSessionState() {
  console.group("Session Debug")

  try {
    // Check localStorage
    if (typeof window !== "undefined") {
      const localStorageAuth = localStorage.getItem("smartpro-auth")
      console.log("localStorage auth:", localStorageAuth ? "exists" : "none")

      if (localStorageAuth) {
        try {
          const parsed = JSON.parse(localStorageAuth)
          console.log("localStorage auth expiry:", new Date(parsed.expires_at * 1000).toISOString())
        } catch (e) {
          console.log("Could not parse localStorage auth")
        }
      }
    }

    // Check current session
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Session error:", error)
    } else {
      console.log("Current session:", data.session ? "exists" : "none")

      if (data.session) {
        console.log("Session expires at:", new Date(data.session.expires_at * 1000).toISOString())
        console.log("Session user:", data.session.user.email)
      }
    }

    // Check cookies
    if (typeof document !== "undefined") {
      console.log("Cookies:", document.cookie)
    }
  } catch (e) {
    console.error("Debug error:", e)
  }

  console.groupEnd()
}
