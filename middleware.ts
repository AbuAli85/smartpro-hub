import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase"

// Export a config to specify that this middleware should use the Node.js runtime
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/"],
  runtime: "nodejs", // Explicitly use Node.js runtime instead of Edge
}

// Update the middleware function to include a check for redirect loops
export async function middleware(req: NextRequest) {
  // Create a response object that we can modify
  const res = NextResponse.next()

  // Check if we're already in a redirect loop
  const redirectCount = Number.parseInt(req.headers.get("x-redirect-count") || "0")

  // If we've redirected too many times, just proceed without redirecting
  if (redirectCount > 3) {
    console.error("Redirect loop detected! Path:", req.nextUrl.pathname)
    console.error("Breaking the loop and proceeding without redirect")
    return NextResponse.next()
  }

  const supabase = createMiddlewareClient<Database>({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role === "admin") {
    return NextResponse.redirect(new URL("/dashboard/admin", req.url));
  } else if (profile?.role === "provider") {
    return NextResponse.redirect(new URL("/dashboard/provider", req.url));
  } else {
    return NextResponse.redirect(new URL("/dashboard/client", req.url));
  }



  // Create a Supabase client specifically for the middleware
  const supabase = createMiddlewareClient<Database>({ req, res })

  try {
    // Get the session - this will also refresh the session if needed
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log("Middleware - Path:", req.nextUrl.pathname)
    console.log("Middleware - Session:", session ? `Exists (User: ${session.user.email})` : "None")

    // If no session and trying to access protected routes
    if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
      console.log("Middleware - Redirecting to login (no session)")

      // Check if we're already on the login page to prevent loops
      if (req.nextUrl.pathname === "/login") {
        console.log("Already on login page, not redirecting")
        return res
      }

      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)

      // Add redirect count header to detect loops
      const redirectRes = NextResponse.redirect(redirectUrl)
      redirectRes.headers.set("x-redirect-count", (redirectCount + 1).toString())
      return redirectRes
    }

    // Check for role-based access
    if (session && req.nextUrl.pathname.startsWith("/dashboard/admin")) {
      try {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
        console.log("Middleware - User role:", profile?.role)

        if (profile?.role !== "admin") {
          console.log("Middleware - Redirecting to dashboard (not admin)")
          const redirectUrl = new URL("/dashboard", req.url)
          return NextResponse.redirect(redirectUrl)
        }
      } catch (error) {
        console.error("Error fetching profile in middleware:", error)
      }
    }

    // If already logged in and trying to access login/register pages
    if (session && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
      console.log("Middleware - Redirecting to dashboard (already logged in)")
      const redirectUrl = new URL("/dashboard", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return res
  }
}
