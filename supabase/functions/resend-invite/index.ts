import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a secure random password
function generatePassword(length = 12): string {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const numbers = "23456789";
  const all = uppercase + lowercase + numbers;
  
  let password = "";
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle the password
  return password.split("").sort(() => Math.random() - 0.5).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Resending invite for user: ${userId}`);

    // Get user profile
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("*, tenants(institution_name)")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's primary role
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .limit(1)
      .single();

    const role = roleData?.role || "user";

    // Generate new password
    const newPassword = generatePassword();

    // Update auth password
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Password update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to reset password" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update profile - reset the created_at to now for fresh 72-hour window
    await adminClient
      .from("profiles")
      .update({ 
        password_reset_required: true,
        status: "invited",
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    // Get institution name
    const institutionName = (profile.tenants as any)?.institution_name || "Your Institution";

    // Send new invite email
    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-invite-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        temporaryPassword: newPassword,
        institutionName,
        role,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error(`Failed to send invite email: ${errorText}`);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`New invite email sent to ${profile.email}`);

    // Audit log
    await adminClient.from("audit_log").insert({
      tenant_id: profile.tenant_id,
      actor_user_id: userId,
      action: "invite_resent_expired",
      target_type: "user",
      target_id: userId,
      metadata: { reason: "invite_expired" },
    });

    return new Response(
      JSON.stringify({ success: true, email: profile.email }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in resend-invite function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
