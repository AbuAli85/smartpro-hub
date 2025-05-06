import { supabase } from "@/lib/supabase/client"

export async function clearSession() {
  try {
    // Clear any stored session data
    await supabase.auth.signOut()

    // Clear localStorage
    localStorage.removeItem("supabase.auth.token")
    localStorage.removeItem("smartpro-auth")

    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
    })

    console.log("Session cleared successfully")
    return true
  } catch (error) {
    console.error("Error clearing session:", error)
    return false
  }
}
