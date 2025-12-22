import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  institutionName?: string;
  runAutomated?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: EmailRequest = await req.json();
    const appUrl = "https://campusvoice.ai";
    const logoUrl = `${supabaseUrl}/storage/v1/object/public/brand-assets/CampusVoice.AI_logo.png`;

    // If runAutomated is true, find eligible users (24hrs since last login, never received this email)
    if (body.runAutomated) {
      console.log("Running automated beta feedback email check...");

      // Get the beta_thank_you template
      const { data: template, error: templateError } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_key", "beta_thank_you")
        .eq("is_active", true)
        .single();

      if (templateError || !template) {
        console.log("Beta thank you template not found or inactive");
        return new Response(JSON.stringify({ message: "Template not found or inactive" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const triggerConfig = template.trigger_config as { delay_hours?: number; once_per_user?: boolean } || {};
      const delayHours = triggerConfig.delay_hours || 24;

      // Find users who logged in exactly 24 hours ago (with 1 hour window)
      const targetTime = new Date(Date.now() - delayHours * 60 * 60 * 1000);
      const windowStart = new Date(targetTime.getTime() - 60 * 60 * 1000);
      const windowEnd = new Date(targetTime.getTime() + 60 * 60 * 1000);

      // Get all users with last_login_at in the window
      const { data: eligibleUsers, error: usersError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, tenant_id, last_login_at")
        .gte("last_login_at", windowStart.toISOString())
        .lte("last_login_at", windowEnd.toISOString())
        .eq("status", "active");

      if (usersError) {
        console.error("Error fetching users:", usersError);
        throw usersError;
      }

      console.log(`Found ${eligibleUsers?.length || 0} users in the 24-hour window`);

      let sentCount = 0;
      for (const user of eligibleUsers || []) {
        // Check if already sent to this user
        const { data: existingSend } = await supabase
          .from("email_sends")
          .select("id")
          .eq("template_id", template.id)
          .eq("user_id", user.id)
          .single();

        if (existingSend) {
          console.log(`Skipping user ${user.email} - already received this email`);
          continue;
        }

        // Get tenant name
        const { data: tenant } = await supabase
          .from("tenants")
          .select("institution_name")
          .eq("id", user.tenant_id)
          .single();

        // Send the email
        const htmlContent = template.html_content
          .replace(/\{\{first_name\}\}/g, user.first_name)
          .replace(/\{\{last_name\}\}/g, user.last_name || "")
          .replace(/\{\{email\}\}/g, user.email)
          .replace(/\{\{institution\}\}/g, tenant?.institution_name || "")
          .replace(/\{\{app_url\}\}/g, appUrl)
          .replace(/\{\{logo_url\}\}/g, logoUrl);

        try {
          await resend.emails.send({
            from: "CampusVoice.AI <hello@campusvoice.ai>",
            to: [user.email],
            subject: template.subject.replace(/\{\{first_name\}\}/g, user.first_name),
            html: htmlContent,
          });

          // Record the send
          await supabase.from("email_sends").insert({
            template_id: template.id,
            user_id: user.id,
            tenant_id: user.tenant_id,
            status: "sent",
            metadata: { automated: true },
          });

          // Log to email_nudges
          await supabase.from("email_nudges").insert({
            tenant_id: user.tenant_id,
            user_id: user.id,
            nudge_type: "beta_thank_you",
            email_count: 1,
            recipient_email: user.email,
            recipient_name: `${user.first_name} ${user.last_name}`,
            subject: template.subject.replace(/\{\{first_name\}\}/g, user.first_name),
            email_type: "beta_feedback",
            status: "sent",
            metadata: { automated: true, template_id: template.id },
          });

          // Update template stats
          await supabase
            .from("email_templates")
            .update({
              send_count: (template.send_count || 0) + 1,
              last_sent_at: new Date().toISOString(),
            })
            .eq("id", template.id);

          sentCount++;
          console.log(`Sent beta feedback email to ${user.email}`);
        } catch (emailError) {
          console.error(`Failed to send to ${user.email}:`, emailError);
        }
      }

      return new Response(JSON.stringify({ message: `Sent ${sentCount} beta feedback emails` }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Manual send to specific user
    const { userId, email, firstName, lastName, institutionName } = body;

    if (!email || !firstName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get template
    const { data: template } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_key", "beta_thank_you")
      .maybeSingle();

    const htmlContent = template
      ? template.html_content
          .replace(/\{\{first_name\}\}/g, firstName)
          .replace(/\{\{last_name\}\}/g, lastName || "")
          .replace(/\{\{email\}\}/g, email)
          .replace(/\{\{institution\}\}/g, institutionName || "")
          .replace(/\{\{app_url\}\}/g, appUrl)
          .replace(/\{\{logo_url\}\}/g, logoUrl)
      : `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">🎉 Thank You for Joining CampusVoice.AI Beta!</h1>
          <p>Hi ${firstName},</p>
          <p>We're thrilled to have you as part of our beta community! Your feedback is incredibly valuable to us.</p>
          <p>Please share your thoughts and help us build the best product possible.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/feedback" style="background: #4F46E5; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Share Your Feedback</a>
          </div>
          <p>Thank you,<br>The CampusVoice.AI Team</p>
        </div>`;

    const emailResponse = await resend.emails.send({
      from: "CampusVoice.AI <hello@campusvoice.ai>",
      to: [email],
      subject: template?.subject?.replace(/\{\{first_name\}\}/g, firstName) || `🎉 Thank You for Joining CampusVoice.AI Beta!`,
      html: htmlContent,
    });

    console.log("Beta feedback email sent:", emailResponse);

    // Get user's tenant_id if userId provided
    let tenantId = null;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", userId)
        .maybeSingle();
      tenantId = profile?.tenant_id;
    }

    // Log to email_nudges (server-side with service role)
    if (tenantId && userId) {
      const { error: nudgeError } = await supabase.from("email_nudges").insert({
        tenant_id: tenantId,
        user_id: userId,
        nudge_type: "beta_thank_you",
        email_count: 1,
        recipient_email: email,
        recipient_name: `${firstName} ${lastName || ""}`.trim(),
        subject: template?.subject?.replace(/\{\{first_name\}\}/g, firstName) || `🎉 Thank You for Joining CampusVoice.AI Beta!`,
        email_type: "beta_feedback",
        status: "sent",
        provider: "resend",
        provider_message_id: emailResponse?.data?.id || null,
        delivery_status: "sent",
        metadata: { manual: true, template_id: template?.id },
      });
      if (nudgeError) {
        console.error("Failed to log email nudge:", nudgeError);
      } else {
        console.log("Email nudge logged successfully");
      }

      // Update template send count
      if (template) {
        await supabase
          .from("email_templates")
          .update({
            send_count: (template.send_count || 0) + 1,
            last_sent_at: new Date().toISOString(),
          })
          .eq("id", template.id);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-beta-feedback-email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
