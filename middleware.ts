import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // CSRF Protection
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-csrf-token", crypto.randomUUID())

  // Rate Limiting
  const ip = request.ip ?? "127.0.0.1"
  const rateLimit = request.headers.get("X-RateLimit-Limit")
  const rateLimitRemaining = request.headers.get("X-RateLimit-Remaining")

  if (rateLimit && rateLimitRemaining && Number.parseInt(rateLimitRemaining) <= 0) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Security Headers
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;",
  )

  return response
}

export const config = {
  matcher: "/api/:path*",
}

