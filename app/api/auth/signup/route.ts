import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { hash } from "bcrypt"
import { sendVerificationEmail } from "@/lib/email"
import { sendOTP } from "@/lib/sms"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const auth = supabase.auth
const from = supabase.from
const emailService = sendVerificationEmail
const smsService = sendOTP

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      userType,
      crNumber,
      companyName,
      industry,
      idCardNumber,
      skillset,
      portfolioLink,
      phoneNumber,
    } = await req.json()
    const hashedPassword = await hash(password, 10)

    // Create user in Supabase
    const { data: userData, error: userError } = await auth.signUp({
      email,
      password: hashedPassword,
    })

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    // Store additional user data in a custom table
    const { error: profileError } = await from("user_profiles").insert({
      user_id: userData.user!.id,
      user_type: userType,
      cr_number: crNumber,
      company_name: companyName,
      industry,
      id_card_number: idCardNumber,
      skillset,
      portfolio_link: portfolioLink,
      phone_number: phoneNumber,
      email_verified: false,
      phone_verified: false,
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // Generate and store email verification token
    const emailToken = Math.random().toString(36).substr(2, 8)
    await from("email_verifications").insert({
      user_id: userData.user!.id,
      token: emailToken,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Token expires in 24 hours
    })

    // Send verification email
    await emailService(email, emailToken)

    // Send OTP via SMS
    const otp = await smsService(phoneNumber)

    // Store OTP in Supabase for verification
    await from("otp_verifications").insert({
      user_id: userData.user!.id,
      otp,
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
    })

    return NextResponse.json(
      { message: "User created successfully. Please verify your email and phone number." },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

