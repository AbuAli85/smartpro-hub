import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: Request) {
  try {
    const { otp } = await req.json()

    // Verify the OTP (this is a simplified example, you should implement a more secure OTP verification)
    const { data, error } = await supabase.from("otp_verifications").select("user_id").eq("otp", otp).single()

    if (error || !data) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Mark the user's phone number as verified
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ phone_verified: true })
      .eq("user_id", data.user_id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to verify phone number" }, { status: 500 })
    }

    // Delete the OTP
    await supabase.from("otp_verifications").delete().eq("otp", otp)

    return NextResponse.json({ message: "Phone number verified successfully" }, { status: 200 })
  } catch (error) {
    console.error("Phone verification error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

