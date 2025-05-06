import { supabase } from "@/lib/supabase/client"

export async function checkProfileExists(userId: string) {
  try {
    console.group("Profile Check")
    console.log("Checking profile for user ID:", userId)

    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error checking profile:", error)
      console.log("Profile does not exist or could not be retrieved")
      console.groupEnd()
      return false
    }

    console.log("Profile found:", data)
    console.groupEnd()
    return true
  } catch (e) {
    console.error("Profile check error:", e)
    console.groupEnd()
    return false
  }
}

export async function createProfileIfMissing(user: any) {
  if (!user || !user.id) {
    console.error("No user provided to createProfileIfMissing")
    return false
  }

  try {
    // First check if profile exists
    const { data, error } = await supabase.from("profiles").select("id").eq("id", user.id).single()

    if (error || !data) {
      console.log("Profile not found, creating one for user:", user.id)

      // Extract user metadata
      const firstName = user.user_metadata?.first_name || ""
      const lastName = user.user_metadata?.last_name || ""
      const role = user.user_metadata?.role || "client"

      // Create profile
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        role: role,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating profile:", insertError)
        return false
      }

      console.log("Profile created successfully")
      return true
    }

    console.log("Profile already exists for user:", user.id)
    return true
  } catch (e) {
    console.error("Error in createProfileIfMissing:", e)
    return false
  }
}
