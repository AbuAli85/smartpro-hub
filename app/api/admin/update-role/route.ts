import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Not authenticated" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can update roles" }, { status: 403 })
    }

    // Get request body
    const { userId, newRole } = await request.json()

    if (!userId || !newRole) {
      return NextResponse.json({ error: "Bad Request: Missing userId or newRole" }, { status: 400 })
    }

    // Get the current role for audit log
    const { data: currentUser } = await supabase.from("profiles").select("role").eq("id", userId).single()

    // Update the user's role
    const { data, error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId).select()

    if (error) {
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    // Log the action in audit_logs
    await supabase.from("audit_logs").insert({
      user_id: session.user.id,
      action: "update_role",
      target_table: "profiles",
      target_id: userId,
      details: {
        old_role: currentUser?.role,
        new_role: newRole,
      },
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 })
  }
}
