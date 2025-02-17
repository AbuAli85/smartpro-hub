import twilio from "twilio"

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function sendOTP(phoneNumber: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  await client.messages.create({
    body: `Your OTP is: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  })

  return otp
}

