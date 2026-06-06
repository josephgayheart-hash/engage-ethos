import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function genPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  for (let i = 0; i < arr.length; i++) out += chars[arr[i] % chars.length];
  return out + "!7";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerErr } = await userClient.auth.getUser();
    if (callerErr || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerRoles } = await admin
      .from("user_roles")
      .select("role,tenant_id")
      .eq("user_id", caller.id);
    const isSuper = (callerRoles ?? []).some((r) => r.role === "super_admin");
    if (!isSuper) {
      return new Response(JSON.stringify({ error: "Super admin required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const tenantId = callerRoles?.[0]?.tenant_id;
    if (!tenantId) {
      return new Response(JSON.stringify({ error: "Caller has no tenant" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    if (!email || !firstName) {
      return new Response(JSON.stringify({ error: "email and firstName required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const temporaryPassword = genPassword();

    // Create auth user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName, tool_only: true },
    });
    if (createErr || !created?.user) {
      return new Response(JSON.stringify({ error: createErr?.message || "Could not create user" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const newUserId = created.user.id;

    // Upsert profile with tool_only flag
    const { error: profErr } = await admin
      .from("profiles")
      .upsert({
        id: newUserId,
        tenant_id: tenantId,
        email,
        first_name: firstName,
        last_name: lastName,
        status: "active",
        tool_only: true,
        password_reset_required: false,
      }, { onConflict: "id" });
    if (profErr) {
      console.error("profile upsert failed:", profErr);
    }

    // Send email if Resend available (best-effort)
    let emailSent = false;
    if (RESEND_API_KEY) {
      try {
        const signInUrl = `${req.headers.get("origin") || "https://campusvoice.ai"}/login`;
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Compass <noreply@campusvoice.ai>",
            to: [email],
            subject: "Your Compass access is ready",
            html: `
              <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
                <h1 style="font-size:22px;margin:0 0 16px">Welcome to Compass${firstName ? `, ${firstName}` : ""}</h1>
                <p style="line-height:1.6">You've been invited to use Compass — a private AI writing copilot trained to your voice.</p>
                <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:20px 0">
                  <div><strong>Email:</strong> ${email}</div>
                  <div style="margin-top:6px"><strong>Temporary password:</strong> <code style="background:#fff;padding:2px 6px;border-radius:4px">${temporaryPassword}</code></div>
                </div>
                <p style="line-height:1.6">Sign in here, then walk through a 2-minute setup to train your voice:</p>
                <p><a href="${signInUrl}" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Sign in to Compass</a></p>
                <p style="font-size:12px;color:#666;margin-top:24px">If you didn't expect this email, you can ignore it.</p>
              </div>
            `,
          }),
        });
        emailSent = emailRes.ok;
        if (!emailRes.ok) console.warn("resend failed:", emailRes.status, await emailRes.text());
      } catch (e) {
        console.warn("email send error:", e);
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      userId: newUserId,
      email,
      temporaryPassword,
      emailSent,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("invite-tool-only-user error:", err);
    const msg = err instanceof Error ? err.message : "invite failed";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
