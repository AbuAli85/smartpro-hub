import { supabase } from "@/lib/supabase/client"

export async function debugAuth() {
  try {
    console.group("Auth Debug Info")

    // Check session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    console.log("Session:", sessionData)
    if (sessionError) {
      console.error("Session Error:", sessionError)
    }

    // Check user
    const { data: userData, error: userError } = await supabase.auth.getUser()
    console.log("User:", userData)
    if (userError) {
      console.error("User Error:", userError)
    }

    // If we have a user, check their profile
    if (userData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single()

      console.log("Profile:", profileData)
      if (profileError) {
        console.error("Profile Error:", profileError)
      }
    }

    console.groupEnd()
    return { session: sessionData, user: userData.user }
  } catch (error) {
    console.error("Debug Auth Error:", error)
    console.groupEnd()
    return { error }
  }
}
