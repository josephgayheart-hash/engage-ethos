import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create admin client for user management
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create regular client to verify the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the requesting user
    const { data: { user: requestingUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify requesting user is an admin
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role, tenant_id")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .single();

    if (!roles) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminTenantId = roles.tenant_id;
    const body = await req.json();
    const { action } = body;

    console.log(`Admin action: ${action} by user ${requestingUser.id}`);

    switch (action) {
      case "create_user": {
        const { email, password, firstName, lastName, phone, department, title, role } = body;
        
        // Create auth user
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (authError) {
          console.error("Auth creation error:", authError);
          return new Response(
            JSON.stringify({ error: authError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create profile
        const { error: profileError } = await adminClient
          .from("profiles")
          .insert({
            id: authData.user.id,
            tenant_id: adminTenantId,
            email,
            first_name: firstName,
            last_name: lastName,
            phone,
            department,
            title,
            status: "invited",
            password_reset_required: true,
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Rollback: delete auth user
          await adminClient.auth.admin.deleteUser(authData.user.id);
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create role
        const { error: roleError } = await adminClient
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            tenant_id: adminTenantId,
            role: role || "user",
          });

        if (roleError) {
          console.error("Role creation error:", roleError);
        }

        // Create audit log
        await adminClient.from("audit_log").insert({
          tenant_id: adminTenantId,
          actor_user_id: requestingUser.id,
          action: "create_user",
          target_type: "user",
          target_id: authData.user.id,
          metadata: { email, role: role || "user" },
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            userId: authData.user.id,
            tempPassword: password 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "reset_password": {
        const { userId, newPassword } = body;

        // Verify user belongs to admin's tenant
        const { data: targetProfile } = await adminClient
          .from("profiles")
          .select("tenant_id")
          .eq("id", userId)
          .single();

        if (!targetProfile || targetProfile.tenant_id !== adminTenantId) {
          return new Response(
            JSON.stringify({ error: "User not found in your organization" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: updateError } = await adminClient.auth.admin.updateUserById(
          userId,
          { password: newPassword }
        );

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update profile to require password reset
        await adminClient
          .from("profiles")
          .update({ 
            password_reset_required: true,
            last_password_reset_at: new Date().toISOString()
          })
          .eq("id", userId);

        // Audit log
        await adminClient.from("audit_log").insert({
          tenant_id: adminTenantId,
          actor_user_id: requestingUser.id,
          action: "reset_password",
          target_type: "user",
          target_id: userId,
        });

        return new Response(
          JSON.stringify({ success: true, tempPassword: newPassword }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update_user_status": {
        const { userId, status } = body;

        const { data: targetProfile } = await adminClient
          .from("profiles")
          .select("tenant_id")
          .eq("id", userId)
          .single();

        if (!targetProfile || targetProfile.tenant_id !== adminTenantId) {
          return new Response(
            JSON.stringify({ error: "User not found in your organization" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: updateError } = await adminClient
          .from("profiles")
          .update({ status })
          .eq("id", userId);

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Audit log
        await adminClient.from("audit_log").insert({
          tenant_id: adminTenantId,
          actor_user_id: requestingUser.id,
          action: `update_user_status_${status}`,
          target_type: "user",
          target_id: userId,
          metadata: { status },
        });

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "approve_onboarding": {
        const { requestId, password } = body;

        const { data: request, error: requestError } = await adminClient
          .from("onboarding_requests")
          .select("*")
          .eq("id", requestId)
          .single();

        if (requestError || !request) {
          return new Response(
            JSON.stringify({ error: "Request not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create auth user
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
          email: request.email,
          password,
          email_confirm: true,
        });

        if (authError) {
          return new Response(
            JSON.stringify({ error: authError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create profile
        const { error: profileError } = await adminClient
          .from("profiles")
          .insert({
            id: authData.user.id,
            tenant_id: adminTenantId,
            email: request.email,
            first_name: request.first_name,
            last_name: request.last_name,
            phone: request.phone,
            department: request.department,
            title: request.title,
            status: "invited",
            password_reset_required: true,
          });

        if (profileError) {
          await adminClient.auth.admin.deleteUser(authData.user.id);
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create role
        await adminClient.from("user_roles").insert({
          user_id: authData.user.id,
          tenant_id: adminTenantId,
          role: "user",
        });

        // Update request status
        await adminClient
          .from("onboarding_requests")
          .update({
            request_status: "approved",
            tenant_id: adminTenantId,
            reviewed_by_admin_user_id: requestingUser.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", requestId);

        // Audit log
        await adminClient.from("audit_log").insert({
          tenant_id: adminTenantId,
          actor_user_id: requestingUser.id,
          action: "approve_onboarding",
          target_type: "onboarding_request",
          target_id: requestId,
          metadata: { email: request.email },
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            userId: authData.user.id,
            tempPassword: password 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "reject_onboarding": {
        const { requestId, notes } = body;

        await adminClient
          .from("onboarding_requests")
          .update({
            request_status: "rejected",
            reviewed_by_admin_user_id: requestingUser.id,
            reviewed_at: new Date().toISOString(),
            notes,
          })
          .eq("id", requestId);

        await adminClient.from("audit_log").insert({
          tenant_id: adminTenantId,
          actor_user_id: requestingUser.id,
          action: "reject_onboarding",
          target_type: "onboarding_request",
          target_id: requestId,
        });

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create_tenant": {
        const { institutionName } = body;
        
        // Only platform admins can create tenants (for now, just allow it)
        const { data: tenant, error: tenantError } = await adminClient
          .from("tenants")
          .insert({ institution_name: institutionName })
          .select()
          .single();

        if (tenantError) {
          return new Response(
            JSON.stringify({ error: tenantError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create institutional config for the tenant
        await adminClient
          .from("institutional_config")
          .insert({ tenant_id: tenant.id });

        return new Response(
          JSON.stringify({ success: true, tenant }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    console.error("Admin users error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});