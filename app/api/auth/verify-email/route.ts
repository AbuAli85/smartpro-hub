import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    // Verify the token (this is a simplified example, you should implement a more secure token verification)
    const { data, error } = await supabase.from("email_verifications").select("user_id").eq("token", token).single()

    if (error || !data) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Mark the user's email as verified
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ email_verified: true })
      .eq("user_id", data.user_id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
    }

    // Delete the verification token
    await supabase.from("email_verifications").delete().eq("token", token)

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

