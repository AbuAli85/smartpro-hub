import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { userId, newRole } = await req.json()

    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    })

    // Get the user who called the function
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    // Check if the user is an admin
    const { data: adminCheck } = await supabaseClient.from("profiles").select("role").eq("id", user?.id).single()

    if (adminCheck?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized: Only admins can update roles" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      })
    }

    // Update the user's role
    const { data, error } = await supabaseClient.from("profiles").update({ role: newRole }).eq("id", userId).select()

    if (error) throw error

    // Log the action
    await supabaseClient.from("audit_logs").insert({
      user_id: user?.id,
      action: "update_role",
      target_table: "profiles",
      target_id: userId,
      details: {
        old_role: data[0].role,
        new_role: newRole,
      },
    })

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
