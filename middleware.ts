import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Update the middleware function to better handle protected routes
export async function middleware(req: NextRequest) {
  // Get the current URL and path
  const url = req.nextUrl
  const path = url.pathname

  // Skip middleware for static assets, API routes, and debug pages
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/api/") ||
    path.startsWith("/favicon.ico") ||
    path.includes(".") || // Skip files with extensions
    path === "/auth/debug" || // Skip the debug page
    url.searchParams.has("debug") // Skip if debug parameter is present
  ) {
    return NextResponse.next()
  }

  // Create a response to modify
  const res = NextResponse.next()

  // Create Supabase client
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Get the user session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    // Handle session error gracefully
    if (error) {
      console.error("Middleware session error:", error.message)

      // If it's just a missing session and trying to access a protected route, redirect to login
      if (error.message.includes("Auth session missing") && isProtectedRoute(path)) {
        return NextResponse.redirect(new URL(`/auth/login?redirectedFrom=${encodeURIComponent(path)}`, req.url))
      }

      // For other errors, just continue
      return res
    }

    // If user is not logged in and tries to access a protected route, redirect to login
    if (!session && isProtectedRoute(path)) {
      return NextResponse.redirect(new URL(`/auth/login?redirectedFrom=${encodeURIComponent(path)}`, req.url))
    }

    // If user is logged in and tries to access auth routes, redirect to dashboard
    if (session && isAuthRoute(path)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // If user is logged in and accessing the root path, redirect to dashboard
    if (session && path === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (e) {
    console.error("Middleware error:", e)

    // If there's an error and the user is trying to access a protected route, redirect to login
    if (isProtectedRoute(path)) {
      return NextResponse.redirect(new URL(`/auth/login?redirectedFrom=${encodeURIComponent(path)}`, req.url))
    }

    return res
  }
}

// Helper function to check if a route is protected
function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/provider") ||
    pathname.startsWith("/client") ||
    pathname === "/profile-setup"
  )
}

// Helper function to check if a route is an auth route
function isAuthRoute(pathname: string): boolean {
  return pathname === "/auth/login" || pathname === "/auth/register" || pathname === "/auth/reset-password"
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/"],
}
