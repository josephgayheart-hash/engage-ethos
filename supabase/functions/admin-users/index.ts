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

    // Verify requesting user is an admin or super_admin
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role, tenant_id")
      .eq("user_id", requestingUser.id)
      .in("role", ["admin", "super_admin"]);

    if (!roles || roles.length === 0) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the first role (prefer super_admin if present)
    const isSuperAdmin = roles.some(r => r.role === "super_admin");

    // Default tenant (even super_admins have a tenant_id on their role)
    const defaultTenantId = roles[0]?.tenant_id ?? null;
    const adminTenantId = isSuperAdmin ? null : defaultTenantId;

    const body = await req.json();
    const { action } = body;

    console.log(`Admin action: ${action} by user ${requestingUser.id}`);

    switch (action) {
      case "create_user": {
        const { email, password, firstName, lastName, phone, department, title, role, roles: rolesList, tenantId: targetTenantId, sendInvite } = body;
        
        // Super admins may optionally target a tenant; if omitted, fall back to their default tenant.
        // This keeps single-tenant setups working without requiring a tenant picker in the UI.
        const effectiveTenantId = isSuperAdmin ? (targetTenantId ?? defaultTenantId) : adminTenantId;
        
        if (!effectiveTenantId) {
          return new Response(
            JSON.stringify({ error: "Tenant not found for this operation" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Create auth user (auto-recover orphan auth records when possible)
        const createAuthUser = async () => {
          return await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
        };

        let authData: any = null;

        const { data: firstAuthData, error: authError } = await createAuthUser();

        if (authError) {
          console.error("Auth creation error:", authError.message, authError);

          const isDuplicateEmail =
            authError.message.includes("already been registered") ||
            authError.message.includes("already exists");

          if (!isDuplicateEmail) {
            return new Response(
              JSON.stringify({ error: authError.message }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // If the email exists, check whether it's a real user (has a profile) or an orphan auth record.
          const normalizedEmail = String(email || "").toLowerCase();
          let existingAuthUser: any = null;

          // Find the auth user by email (paginate to avoid missing users)
          let page = 1;
          const perPage = 1000;
          while (!existingAuthUser) {
            const { data: usersPage, error: listError } = await adminClient.auth.admin.listUsers({
              page,
              perPage,
            });

            if (listError) {
              console.error("Auth list users error:", listError);
              break;
            }

            existingAuthUser =
              usersPage.users.find((u: any) => (u.email || "").toLowerCase() === normalizedEmail) ?? null;

            if (existingAuthUser || usersPage.users.length < perPage) break;
            page += 1;
          }

          if (existingAuthUser) {
            const { data: existingProfile } = await adminClient
              .from("profiles")
              .select("id, tenant_id")
              .eq("id", existingAuthUser.id)
              .maybeSingle();

            if (existingProfile) {
              return new Response(
                JSON.stringify({
                  error: "A user with this email address already exists",
                  existingUserId: existingProfile.id,
                  existingTenantId: existingProfile.tenant_id,
                }),
                { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            // Orphan auth user: delete and retry once.
            console.log(`Orphan auth user detected for ${email}. Deleting and retrying create_user...`);

            await adminClient
              .from("institutional_profiles")
              .update({ created_by_user_id: null })
              .eq("created_by_user_id", existingAuthUser.id);

            const { error: orphanDeleteError } = await adminClient.auth.admin.deleteUser(existingAuthUser.id);

            if (orphanDeleteError) {
              console.error("Error deleting orphan auth user:", orphanDeleteError);
              return new Response(
                JSON.stringify({ error: "Unable to clean up existing auth record. Please try again." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            const { data: retryAuthData, error: retryAuthError } = await createAuthUser();
            if (retryAuthError) {
              console.error("Auth creation error after orphan cleanup:", retryAuthError.message, retryAuthError);
              return new Response(
                JSON.stringify({ error: "Unable to recreate user after orphan cleanup. Please try again." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            authData = retryAuthData;
          }

          if (!authData) {
            return new Response(
              JSON.stringify({ error: "A user with this email address already exists" }),
              { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          authData = firstAuthData;
        }

        // Create profile
        const { error: profileError } = await adminClient
          .from("profiles")
          .insert({
            id: authData.user.id,
            tenant_id: effectiveTenantId,
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

        // Determine roles to create - support both legacy 'role' and new 'roles' array
        let rolesToCreate: string[] = [];
        if (rolesList && Array.isArray(rolesList)) {
          rolesToCreate = rolesList;
        } else if (role) {
          // Legacy support: map old role values
          if (role === 'user_approver') {
            rolesToCreate = ['user', 'approver'];
          } else if (role === 'super_admin') {
            rolesToCreate = ['super_admin', 'admin'];
          } else if (role === 'admin') {
            rolesToCreate = ['user', 'admin'];
          } else {
            rolesToCreate = [role];
          }
        } else {
          rolesToCreate = ['user'];
        }

        // CRITICAL SECURITY CHECK: Only super_admins can create super_admin accounts
        if (rolesToCreate.includes('super_admin') && !isSuperAdmin) {
          console.error(`Security violation: Non-super admin ${requestingUser.id} attempted to create super_admin account`);
          return new Response(
            JSON.stringify({ error: "Only CampusVoice Super Admins can create other Super Admin accounts" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create roles
        for (const r of rolesToCreate) {
          const { error: roleError } = await adminClient
            .from("user_roles")
            .insert({
              user_id: authData.user.id,
              tenant_id: effectiveTenantId,
              role: r,
            });

          if (roleError) {
            console.error(`Role creation error for ${r}:`, roleError);
          }
        }

        // Seed a sample message in the user's personal library
        try {
          await adminClient.from("personal_messages").insert({
            user_id: authData.user.id,
            tenant_id: effectiveTenantId,
            title: "Welcome! Here's a Sample Email",
            content: `Subject: Join Us for Griffin Weekend!\n\nDear [First Name],\n\nWe're excited to invite you to Griffin Weekend, happening [Date] on our beautiful campus!\n\nThis is your chance to:\n• Tour our state-of-the-art facilities\n• Meet current students and faculty\n• Experience campus life firsthand\n• Get your questions answered by admissions counselors\n\nSpace is limited, so register today at [Link].\n\nWe can't wait to meet you!\n\nGo Griffins!\n[Sender Name]\n[Title]\n[Department]`,
            channel: "email",
            audience: "prospective-students",
            domain: "admissions",
            moment: "inquiry-response",
            goal: "drive-action",
            tone: "enthusiastic",
            mode: "generated",
            approved: false,
            notes: "This is a sample message to help you get started. Feel free to edit, duplicate, or delete it!",
            metadata: { 
              isSeedMessage: true,
              source: "onboarding"
            }
          });
          console.log(`Seeded sample message for new user ${authData.user.id}`);
        } catch (seedError) {
          console.error("Failed to seed sample message:", seedError);
          // Don't fail user creation if seeding fails
        }

        // Create audit log
        await adminClient.from("audit_log").insert({
          tenant_id: effectiveTenantId,
          actor_user_id: requestingUser.id,
          action: "create_user",
          target_type: "user",
          target_id: authData.user.id,
          metadata: { email, roles: rolesToCreate },
        });

        // Send invite email if requested
        let emailSent = false;
        if (sendInvite) {
          try {
            // Get tenant name for the email
            const { data: tenantData } = await adminClient
              .from("tenants")
              .select("institution_name")
              .eq("id", effectiveTenantId)
              .single();

            const institutionName = tenantData?.institution_name || "Your Institution";

            // Get inviter's name (the requesting user)
            const { data: inviterProfile } = await adminClient
              .from("profiles")
              .select("first_name, last_name")
              .eq("id", requestingUser.id)
              .single();

            const inviterName = inviterProfile 
              ? `${inviterProfile.first_name} ${inviterProfile.last_name}` 
              : undefined;

            // Call the send-invite-email function
            const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-invite-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                email,
                firstName,
                lastName,
                temporaryPassword: password,
                institutionName,
                role: rolesToCreate[0] || "user",
                inviterName,
              }),
            });

            if (emailResponse.ok) {
              emailSent = true;
              console.log(`Invite email sent successfully to ${email}`);
            } else {
              const errorText = await emailResponse.text();
              console.error(`Failed to send invite email (status ${emailResponse.status}): ${errorText}`);
            }
          } catch (emailError) {
            console.error("Error sending invite email:", emailError);
            // Don't fail the user creation if email fails
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            userId: authData.user.id,
            tempPassword: password,
            emailSent
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update_user_roles": {
        const { userId, roles: newRoles } = body;

        // Verify user belongs to admin's tenant (super admins can manage any user)
        const { data: targetProfile } = await adminClient
          .from("profiles")
          .select("tenant_id")
          .eq("id", userId)
          .single();

        if (!targetProfile || (!isSuperAdmin && targetProfile.tenant_id !== adminTenantId)) {
          return new Response(
            JSON.stringify({ error: "User not found in your organization" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const targetTenantId = targetProfile.tenant_id;

        // CRITICAL SECURITY CHECK: Only super_admins can assign super_admin role
        if (newRoles.includes('super_admin') && !isSuperAdmin) {
          console.error(`Security violation: Non-super admin ${requestingUser.id} attempted to assign super_admin role`);
          return new Response(
            JSON.stringify({ error: "Only CampusVoice Super Admins can assign Super Admin roles" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Delete existing roles for this user
        await adminClient
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("tenant_id", targetTenantId);

        // Insert new roles
        for (const r of newRoles) {
          await adminClient
            .from("user_roles")
            .insert({
              user_id: userId,
              tenant_id: targetTenantId,
              role: r,
            });
        }

        // Audit log
        await adminClient.from("audit_log").insert({
          tenant_id: targetTenantId,
          actor_user_id: requestingUser.id,
          action: "update_user_roles",
          target_type: "user",
          target_id: userId,
          metadata: { roles: newRoles },
        });

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "reset_password": {
        const { userId, newPassword } = body;

        // Verify user belongs to admin's tenant (super admins can manage any user)
        const { data: targetProfile } = await adminClient
          .from("profiles")
          .select("tenant_id")
          .eq("id", userId)
          .single();

        if (!targetProfile || (!isSuperAdmin && targetProfile.tenant_id !== adminTenantId)) {
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
          tenant_id: targetProfile.tenant_id,
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

        if (!targetProfile || (!isSuperAdmin && targetProfile.tenant_id !== adminTenantId)) {
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
          tenant_id: targetProfile.tenant_id,
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

      case "delete_user": {
        const { userId } = body;

        // Verify user exists and get their tenant
        const { data: targetProfile } = await adminClient
          .from("profiles")
          .select("tenant_id, email, first_name, last_name")
          .eq("id", userId)
          .single();

        if (!targetProfile || (!isSuperAdmin && targetProfile.tenant_id !== adminTenantId)) {
          return new Response(
            JSON.stringify({ error: "User not found in your organization" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Prevent self-deletion
        if (userId === requestingUser.id) {
          return new Response(
            JSON.stringify({ error: "You cannot delete your own account" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`Deleting user: ${targetProfile.email} (${userId})`);

        // Delete all user-related data before deleting the auth user
        // Order matters - delete dependent records first

        // Nullify created_by_user_id on institutional_profiles (don't delete the profiles, just orphan them)
        await adminClient
          .from("institutional_profiles")
          .update({ created_by_user_id: null })
          .eq("created_by_user_id", userId);

        // Delete personal messages
        await adminClient
          .from("personal_messages")
          .delete()
          .eq("user_id", userId);

        // Delete playground messages (via conversations)
        const { data: conversations } = await adminClient
          .from("playground_conversations")
          .select("id")
          .eq("user_id", userId);
        
        if (conversations && conversations.length > 0) {
          const conversationIds = conversations.map(c => c.id);
          await adminClient
            .from("playground_messages")
            .delete()
            .in("conversation_id", conversationIds);
        }

        // Delete playground conversations
        await adminClient
          .from("playground_conversations")
          .delete()
          .eq("user_id", userId);

        // Delete content DNA samples
        await adminClient
          .from("content_dna_samples")
          .delete()
          .eq("user_id", userId);

        // Delete BYOC uploads
        await adminClient
          .from("byoc_uploads")
          .delete()
          .eq("user_id", userId);

        // Delete tool usage events
        await adminClient
          .from("tool_usage_events")
          .delete()
          .eq("user_id", userId);

        // Delete beta feedback
        await adminClient
          .from("beta_feedback")
          .delete()
          .eq("user_id", userId);

        // Delete email nudges
        await adminClient
          .from("email_nudges")
          .delete()
          .eq("user_id", userId);

        // Delete referrals
        await adminClient
          .from("referrals")
          .delete()
          .eq("referrer_user_id", userId);

        // Delete user roles
        await adminClient
          .from("user_roles")
          .delete()
          .eq("user_id", userId);

        // Delete profile
        await adminClient
          .from("profiles")
          .delete()
          .eq("id", userId);

        // Delete from auth.users - this is the actual user deletion
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

        if (deleteError) {
          console.error("Error deleting auth user:", deleteError);
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Audit log
        await adminClient.from("audit_log").insert({
          tenant_id: targetProfile.tenant_id,
          actor_user_id: requestingUser.id,
          action: "delete_user",
          target_type: "user",
          target_id: userId,
          metadata: { 
            deleted_email: targetProfile.email,
            deleted_name: `${targetProfile.first_name} ${targetProfile.last_name}`
          },
        });

        console.log(`User ${targetProfile.email} deleted successfully`);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "approve_onboarding": {
        const { requestId, password, tenantId: targetTenantId, createNewTenant: shouldCreateTenant, newTenantName, newTenantType, role: assignedRole } = body;

        let effectiveApprovalTenantId = isSuperAdmin ? targetTenantId : adminTenantId;
        
        // Handle creating a new tenant if requested
        if (shouldCreateTenant && newTenantName) {
          const { data: newTenant, error: tenantError } = await adminClient
            .from("tenants")
            .insert({ institution_name: newTenantName, tenant_type: newTenantType || 'university' })
            .select()
            .single();

          if (tenantError) {
            console.error("Failed to create tenant:", tenantError);
            return new Response(
              JSON.stringify({ error: `Failed to create institution: ${tenantError.message}` }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Create institutional config for the new tenant
          await adminClient
            .from("institutional_config")
            .insert({ tenant_id: newTenant.id });

          effectiveApprovalTenantId = newTenant.id;
          console.log(`Created new tenant: ${newTenantName} with ID ${newTenant.id}`);
        }
        
        if (!effectiveApprovalTenantId) {
          return new Response(
            JSON.stringify({ error: "Tenant ID required for onboarding approval" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

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

        // Create auth user (with orphan recovery like create_user)
        const createOnboardingAuthUser = async () => {
          return await adminClient.auth.admin.createUser({
            email: request.email,
            password,
            email_confirm: true,
          });
        };

        let authData: any = null;
        const { data: firstAuthData, error: authError } = await createOnboardingAuthUser();

        if (authError) {
          console.error("Auth creation error during onboarding approval:", authError.message, authError);
          
          const isDuplicateEmail =
            authError.message.includes("already been registered") ||
            authError.message.includes("already exists");

          if (!isDuplicateEmail) {
            return new Response(
              JSON.stringify({ error: authError.message }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Check if it's an orphan auth user (no profile) and clean up
          const normalizedEmail = String(request.email || "").toLowerCase();
          let existingAuthUser: any = null;

          let page = 1;
          const perPage = 1000;
          while (!existingAuthUser) {
            const { data: usersPage, error: listError } = await adminClient.auth.admin.listUsers({ page, perPage });
            if (listError) { console.error("Auth list users error:", listError); break; }
            existingAuthUser = usersPage.users.find((u: any) => (u.email || "").toLowerCase() === normalizedEmail) ?? null;
            if (existingAuthUser || usersPage.users.length < perPage) break;
            page += 1;
          }

          if (existingAuthUser) {
            const { data: existingProfile } = await adminClient
              .from("profiles")
              .select("id, tenant_id")
              .eq("id", existingAuthUser.id)
              .maybeSingle();

            if (existingProfile) {
              return new Response(
                JSON.stringify({ error: `A user with email "${request.email}" already exists with a profile. They may need to be deleted first or this request should be rejected.` }),
                { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            // Orphan auth user: delete and retry
            console.log(`Orphan auth user detected for ${request.email} during onboarding approval. Cleaning up...`);
            await adminClient.from("institutional_profiles").update({ created_by_user_id: null }).eq("created_by_user_id", existingAuthUser.id);
            const { error: orphanDeleteError } = await adminClient.auth.admin.deleteUser(existingAuthUser.id);
            if (orphanDeleteError) {
              console.error("Error deleting orphan auth user:", orphanDeleteError);
              return new Response(
                JSON.stringify({ error: "Unable to clean up existing auth record. Please try again." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            const { data: retryAuthData, error: retryAuthError } = await createOnboardingAuthUser();
            if (retryAuthError) {
              console.error("Auth creation error after orphan cleanup:", retryAuthError.message);
              return new Response(
                JSON.stringify({ error: "Unable to recreate user after orphan cleanup. Please try again." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
            authData = retryAuthData;
          }

          if (!authData) {
            return new Response(
              JSON.stringify({ error: `A user with email "${request.email}" already exists. They may need to be deleted first or this request should be rejected.` }),
              { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          authData = firstAuthData;
        }

        // Determine tenant for super_admin role - they go to CampusVoice System tenant
        const profileTenantId = assignedRole === 'super_admin' 
          ? '00000000-0000-0000-0000-000000000000' // CampusVoice System tenant
          : effectiveApprovalTenantId;

        // Create profile
        const { error: profileError } = await adminClient
          .from("profiles")
          .insert({
            id: authData.user.id,
            tenant_id: profileTenantId,
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

        // Create role - use the assigned role (default to 'user')
        const userRole = assignedRole || "user";
        
        // CRITICAL SECURITY CHECK: Only super_admins can create super_admin accounts
        if (userRole === 'super_admin' && !isSuperAdmin) {
          console.error(`Security violation: Non-super admin ${requestingUser.id} attempted to create super_admin via onboarding`);
          await adminClient.auth.admin.deleteUser(authData.user.id);
          return new Response(
            JSON.stringify({ error: "Only CampusVoice Super Admins can create other Super Admin accounts" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        await adminClient.from("user_roles").insert({
          user_id: authData.user.id,
          tenant_id: profileTenantId,
          role: userRole,
        });

        // Seed a sample message in the user's personal library
        try {
          await adminClient.from("personal_messages").insert({
            user_id: authData.user.id,
            tenant_id: profileTenantId,
            title: "Welcome! Here's a Sample Email",
            content: `Subject: Join Us for Campus Visit Day!\n\nDear [First Name],\n\nWe're excited to invite you to Campus Visit Day, happening [Date] on our beautiful campus!\n\nThis is your chance to:\n• Tour our state-of-the-art facilities\n• Meet current students and faculty\n• Experience campus life firsthand\n• Get your questions answered by admissions counselors\n\nSpace is limited, so register today at [Link].\n\nWe can't wait to meet you!\n\nBest regards,\n[Sender Name]\n[Title]\n[Department]`,
            channel: "email",
            audience: "prospective-students",
            domain: "admissions",
            moment: "inquiry-response",
            goal: "drive-action",
            tone: "enthusiastic",
            mode: "generated",
            approved: false,
            notes: "This is a sample message to help you get started. Feel free to edit, duplicate, or delete it!",
            metadata: { 
              isSeedMessage: true,
              source: "onboarding"
            }
          });
          console.log(`Seeded sample message for onboarded user ${authData.user.id}`);
        } catch (seedError) {
          console.error("Failed to seed sample message:", seedError);
          // Don't fail approval if seeding fails
        }

        // Update request status
        await adminClient
          .from("onboarding_requests")
          .update({
            request_status: "approved",
            tenant_id: effectiveApprovalTenantId,
            reviewed_by_admin_user_id: requestingUser.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", requestId);

        // Audit log
        await adminClient.from("audit_log").insert({
          tenant_id: profileTenantId,
          actor_user_id: requestingUser.id,
          action: "approve_onboarding",
          target_type: "onboarding_request",
          target_id: requestId,
          metadata: { email: request.email, role: userRole, newTenantCreated: shouldCreateTenant || false },
        });

        // Get institution name for the welcome email
        let institutionName = newTenantName || "CampusVoice.AI";
        if (!shouldCreateTenant && effectiveApprovalTenantId) {
          const { data: tenantData } = await adminClient
            .from("tenants")
            .select("institution_name")
            .eq("id", effectiveApprovalTenantId)
            .single();
          if (tenantData) {
            institutionName = tenantData.institution_name;
          }
        }

        // Send approval email with credentials
        try {
          const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
          const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-approval-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: request.email,
              firstName: request.first_name,
              lastName: request.last_name,
              temporaryPassword: password,
              institutionName: institutionName,
              role: userRole,
            }),
          });

          if (!emailResponse.ok) {
            const emailError = await emailResponse.text();
            console.error("Failed to send approval email:", emailError);
          } else {
            console.log(`Approval email sent successfully to ${request.email}`);
          }
        } catch (emailErr) {
          console.error("Error sending approval email:", emailErr);
          // Don't fail the approval if email fails
        }

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

        // Get the request to determine the tenant for audit log
        const { data: request } = await adminClient
          .from("onboarding_requests")
          .select("tenant_id")
          .eq("id", requestId)
          .single();

        await adminClient
          .from("onboarding_requests")
          .update({
            request_status: "rejected",
            reviewed_by_admin_user_id: requestingUser.id,
            reviewed_at: new Date().toISOString(),
            notes,
          })
          .eq("id", requestId);

        // Use request's tenant_id for audit, or CampusVoice System tenant for super admin
        const auditTenantId = request?.tenant_id || (isSuperAdmin ? '00000000-0000-0000-0000-000000000000' : adminTenantId);

        await adminClient.from("audit_log").insert({
          tenant_id: auditTenantId,
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

      case "change_user_tenant": {
        // Super admin only - move a user to a different tenant
        if (!isSuperAdmin) {
          return new Response(
            JSON.stringify({ error: "Super admin access required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { userId, newTenantId, createNewTenant, newTenantName, newTenantType } = body;

        let targetTenantId = newTenantId;

        // If creating a new tenant for this user
        if (createNewTenant && newTenantName) {
          const { data: newTenant, error: tenantError } = await adminClient
            .from("tenants")
            .insert({ 
              institution_name: newTenantName,
              tenant_type: newTenantType || 'university'
            })
            .select()
            .single();

          if (tenantError) {
            console.error("Error creating new tenant:", tenantError);
            return new Response(
              JSON.stringify({ error: tenantError.message }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          targetTenantId = newTenant.id;

          // Create institutional config for the new tenant
          await adminClient
            .from("institutional_config")
            .insert({ tenant_id: newTenant.id });

          console.log(`Created new tenant: ${newTenantName} (${newTenantType}) with id ${newTenant.id}`);
        }

        if (!targetTenantId) {
          return new Response(
            JSON.stringify({ error: "Target tenant ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get the user's current profile
        const { data: currentProfile, error: profileError } = await adminClient
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError || !currentProfile) {
          return new Response(
            JSON.stringify({ error: "User not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const oldTenantId = currentProfile.tenant_id;

        // Update the user's profile to the new tenant
        const { error: updateError } = await adminClient
          .from("profiles")
          .update({ tenant_id: targetTenantId })
          .eq("id", userId);

        if (updateError) {
          console.error("Error updating user tenant:", updateError);
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update user roles to the new tenant
        await adminClient
          .from("user_roles")
          .update({ tenant_id: targetTenantId })
          .eq("user_id", userId)
          .eq("tenant_id", oldTenantId);

        // Optionally move personal messages (keep them with the user)
        await adminClient
          .from("personal_messages")
          .update({ tenant_id: targetTenantId })
          .eq("user_id", userId);

        // Optionally move drafts
        await adminClient
          .from("user_drafts")
          .update({ tenant_id: targetTenantId })
          .eq("user_id", userId);

        // Audit log
        await adminClient.from("audit_log").insert({
          tenant_id: targetTenantId,
          actor_user_id: requestingUser.id,
          action: "change_user_tenant",
          target_type: "user",
          target_id: userId,
          metadata: { 
            old_tenant_id: oldTenantId, 
            new_tenant_id: targetTenantId,
            created_new_tenant: createNewTenant || false
          },
        });

        console.log(`Moved user ${userId} from tenant ${oldTenantId} to ${targetTenantId}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            newTenantId: targetTenantId,
            createdNewTenant: createNewTenant || false
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cleanup_orphan_auth": {
        // Super admin only - clean up orphan auth users (users in auth.users but not in profiles)
        if (!isSuperAdmin) {
          return new Response(
            JSON.stringify({ error: "Super admin access required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { email } = body;
        
        // Get users from auth
        const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers();
        
        if (listError) {
          return new Response(
            JSON.stringify({ error: listError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Find the auth user by email
        const orphanUser = authUsers.users.find(u => u.email === email);
        
        if (!orphanUser) {
          return new Response(
            JSON.stringify({ error: "Auth user not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if they have a profile
        const { data: profile } = await adminClient
          .from("profiles")
          .select("id")
          .eq("id", orphanUser.id)
          .single();

        if (profile) {
          return new Response(
            JSON.stringify({ error: "User has a profile - use normal delete instead" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Clean up any remaining references
        await adminClient
          .from("institutional_profiles")
          .update({ created_by_user_id: null })
          .eq("created_by_user_id", orphanUser.id);

        // Delete the orphan auth user
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(orphanUser.id);

        if (deleteError) {
          console.error("Error deleting orphan auth user:", deleteError);
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`Cleaned up orphan auth user: ${email}`);

        return new Response(
          JSON.stringify({ success: true, deletedEmail: email }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create_tenant": {
        if (!isSuperAdmin) {
          return new Response(
            JSON.stringify({ error: "Only Super Admins can create organizations" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const {
          institutionName,
          tenantType = "university",
          industryVertical = null,
          // Optional first admin user
          adminEmail,
          adminFirstName,
          adminLastName,
          adminPassword,
          adminRole = "admin",
          sendAdminInvite = false,
        } = body;

        if (!institutionName) {
          return new Response(
            JSON.stringify({ error: "Organization name is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create the tenant
        const { data: newTenant, error: tenantError } = await adminClient
          .from("tenants")
          .insert({
            institution_name: institutionName,
            tenant_type: tenantType,
            industry_vertical: industryVertical,
            status: "active",
          })
          .select()
          .single();

        if (tenantError) {
          console.error("Tenant creation error:", tenantError);
          return new Response(
            JSON.stringify({ error: tenantError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`Created tenant ${newTenant.id} (${institutionName}) with type ${tenantType}`);

        // Audit log
        await adminClient.from("audit_log").insert({
          tenant_id: newTenant.id,
          actor_user_id: requestingUser.id,
          action: "create_tenant",
          target_type: "tenant",
          target_id: newTenant.id,
          metadata: { institutionName, tenantType, industryVertical },
        });

        // Optionally create the first admin user for this tenant
        let adminUser = null;
        let adminEmailSent = false;

        if (adminEmail && adminFirstName && adminLastName && adminPassword) {
          // Create auth user
          const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
          });

          if (authError) {
            console.error("Admin user auth creation error:", authError);
            // Don't fail the whole operation, tenant was still created
            return new Response(
              JSON.stringify({
                success: true,
                tenantId: newTenant.id,
                adminError: authError.message,
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Create profile
          await adminClient.from("profiles").insert({
            id: authData.user.id,
            tenant_id: newTenant.id,
            email: adminEmail,
            first_name: adminFirstName,
            last_name: adminLastName,
            status: "invited",
            password_reset_required: true,
          });

          // Create roles
          const rolesToCreate = adminRole === "admin" ? ["user", "admin"] : [adminRole];
          for (const r of rolesToCreate) {
            await adminClient.from("user_roles").insert({
              user_id: authData.user.id,
              tenant_id: newTenant.id,
              role: r,
            });
          }

          // Send invite email if requested
          if (sendAdminInvite) {
            try {
              const { data: inviterProfile } = await adminClient
                .from("profiles")
                .select("first_name, last_name")
                .eq("id", requestingUser.id)
                .single();

              const inviterName = inviterProfile
                ? `${inviterProfile.first_name} ${inviterProfile.last_name}`
                : undefined;

              const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-invite-email`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({
                  email: adminEmail,
                  firstName: adminFirstName,
                  lastName: adminLastName,
                  temporaryPassword: adminPassword,
                  institutionName,
                  role: adminRole,
                  inviterName,
                }),
              });

              adminEmailSent = emailResponse.ok;
            } catch (emailErr) {
              console.error("Failed to send admin invite email:", emailErr);
            }
          }

          adminUser = {
            userId: authData.user.id,
            email: adminEmail,
            emailSent: adminEmailSent,
          };

          // Audit log for admin user creation
          await adminClient.from("audit_log").insert({
            tenant_id: newTenant.id,
            actor_user_id: requestingUser.id,
            action: "create_user",
            target_type: "user",
            target_id: authData.user.id,
            metadata: { email: adminEmail, roles: rolesToCreate },
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            tenantId: newTenant.id,
            adminUser,
          }),
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