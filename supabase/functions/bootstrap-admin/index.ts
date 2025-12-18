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

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json();
    const { action, email, password, firstName, lastName, tenantId, setupKey, userId, newEmail, institutionName, role } = body;

    // Simple security check - require a setup key
    if (setupKey !== "UPLAYBOOK_SETUP_2024") {
      return new Response(
        JSON.stringify({ error: "Invalid setup key" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: bootstrap_instance - Create tenant + super admin in one step (for fresh instances)
    if (action === "bootstrap_instance") {
      if (!institutionName || !email || !password) {
        return new Response(
          JSON.stringify({ error: "institutionName, email, and password are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if any tenants exist (fresh instance check)
      const { data: existingTenants, error: checkError } = await adminClient
        .from("tenants")
        .select("id")
        .limit(1);

      if (checkError) {
        console.error("Check tenants error:", checkError);
      }

      // Create the tenant
      const { data: newTenant, error: tenantError } = await adminClient
        .from("tenants")
        .insert({
          institution_name: institutionName,
          status: "active",
        })
        .select()
        .single();

      if (tenantError) {
        console.error("Tenant creation error:", tenantError);
        return new Response(
          JSON.stringify({ error: `Failed to create tenant: ${tenantError.message}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create auth user
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        console.error("Auth creation error:", authError);
        // Rollback tenant creation
        await adminClient.from("tenants").delete().eq("id", newTenant.id);
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
          tenant_id: newTenant.id,
          email,
          first_name: firstName || "Super",
          last_name: lastName || "Admin",
          status: "active",
          password_reset_required: false,
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        await adminClient.auth.admin.deleteUser(authData.user.id);
        await adminClient.from("tenants").delete().eq("id", newTenant.id);
        return new Response(
          JSON.stringify({ error: profileError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create super_admin role
      const { error: roleError } = await adminClient
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          tenant_id: newTenant.id,
          role: "super_admin",
        });

      if (roleError) {
        console.error("Role creation error:", roleError);
      }

      // Also add admin role for tenant-level access
      await adminClient
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          tenant_id: newTenant.id,
          role: "admin",
        });

      // Create institutional config
      await adminClient.from("institutional_config").insert({
        tenant_id: newTenant.id,
        config: {
          institutionName: institutionName,
        }
      });

      // Create audit log
      await adminClient.from("audit_log").insert({
        tenant_id: newTenant.id,
        actor_user_id: authData.user.id,
        action: "bootstrap_instance",
        target_type: "tenant",
        target_id: newTenant.id,
        metadata: { email, institution: institutionName },
      });

      console.log(`Instance bootstrapped: ${institutionName} with super admin ${email}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          userId: authData.user.id,
          tenantId: newTenant.id,
          email,
          institution: institutionName,
          message: "Instance bootstrapped successfully. You can now log in as super admin."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: add_admin - Add admin without checking for existing admins
    if (action === "add_admin") {
      // Verify tenant exists
      const { data: tenant, error: tenantError } = await adminClient
        .from("tenants")
        .select("id, institution_name")
        .eq("id", tenantId)
        .single();

      if (tenantError || !tenant) {
        return new Response(
          JSON.stringify({ error: "Tenant not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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
          tenant_id: tenantId,
          email,
          first_name: firstName || "Admin",
          last_name: lastName || "User",
          status: "active",
          password_reset_required: true,
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        await adminClient.auth.admin.deleteUser(authData.user.id);
        return new Response(
          JSON.stringify({ error: profileError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create admin role
      const { error: roleError } = await adminClient
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          tenant_id: tenantId,
          role: "admin",
        });

      if (roleError) {
        console.error("Role creation error:", roleError);
      }

      console.log(`Admin added: ${email} for ${tenant.institution_name}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          userId: authData.user.id,
          email,
          institution: tenant.institution_name,
          message: "Admin account created successfully."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: update_email - Update an existing user's email
    if (action === "update_email") {
      if (!userId || !newEmail) {
        return new Response(
          JSON.stringify({ error: "userId and newEmail are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update auth user email
      const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
        email: newEmail,
        email_confirm: true
      });

      if (authError) {
        console.error("Auth update error:", authError);
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update profile email
      const { error: profileError } = await adminClient
        .from("profiles")
        .update({ email: newEmail })
        .eq("id", userId);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      console.log(`Email updated for user ${userId} to ${newEmail}`);

      return new Response(
        JSON.stringify({ success: true, message: "Email updated successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default action: create first admin (original behavior)
    // Verify tenant exists
    const { data: tenant, error: tenantError } = await adminClient
      .from("tenants")
      .select("id, institution_name")
      .eq("id", tenantId)
      .single();

    if (tenantError || !tenant) {
      return new Response(
        JSON.stringify({ error: "Tenant not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if admin already exists for this tenant
    const { data: existingAdmin } = await adminClient
      .from("user_roles")
      .select("user_id")
      .eq("tenant_id", tenantId)
      .eq("role", "admin")
      .limit(1);

    if (existingAdmin && existingAdmin.length > 0) {
      return new Response(
        JSON.stringify({ error: "Admin already exists for this tenant" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
        tenant_id: tenantId,
        email,
        first_name: firstName,
        last_name: lastName,
        status: "active",
        password_reset_required: false,
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin role
    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        tenant_id: tenantId,
        role: "admin",
      });

    if (roleError) {
      console.error("Role creation error:", roleError);
    }

    // Create audit log
    await adminClient.from("audit_log").insert({
      tenant_id: tenantId,
      actor_user_id: authData.user.id,
      action: "bootstrap_admin",
      target_type: "user",
      target_id: authData.user.id,
      metadata: { email, institution: tenant.institution_name },
    });

    console.log(`Bootstrap admin created: ${email} for ${tenant.institution_name}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authData.user.id,
        email,
        institution: tenant.institution_name,
        message: "Admin account created successfully. You can now log in."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Bootstrap admin error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
