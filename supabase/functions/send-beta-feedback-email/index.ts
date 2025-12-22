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

const logoUrl = "https://yeuwpuzbccqnqdlnjhfm.supabase.co/storage/v1/object/public/brand-assets/campusvoice-email-logo.png";

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

    if (body.runAutomated) {
      console.log("Running automated beta feedback email check...");

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

      const triggerConfig = template.trigger_config as { delay_hours?: number } || {};
      const delayHours = triggerConfig.delay_hours || 24;

      const targetTime = new Date(Date.now() - delayHours * 60 * 60 * 1000);
      const windowStart = new Date(targetTime.getTime() - 60 * 60 * 1000);
      const windowEnd = new Date(targetTime.getTime() + 60 * 60 * 1000);

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

        const { data: tenant } = await supabase
          .from("tenants")
          .select("institution_name")
          .eq("id", user.tenant_id)
          .single();

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

          await supabase.from("email_sends").insert({
            template_id: template.id,
            user_id: user.id,
            tenant_id: user.tenant_id,
            status: "sent",
            metadata: { automated: true },
          });

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

          await supabase
            .from("email_templates")
            .update({ send_count: (template.send_count || 0) + 1, last_sent_at: new Date().toISOString() })
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

    const { userId, email, firstName, lastName, institutionName } = body;

    if (!email || !firstName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
      : `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif"><div style="background:#1a2036;padding:24px;text-align:center;border-radius:8px 8px 0 0"><table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td style="background:#fff;padding:10px 14px;border-radius:6px"><img src="${logoUrl}" alt="CampusVoice.AI" style="height:36px"/></td></tr></table><h1 style="margin:16px 0 0;color:#fff;font-size:20px">Thank You!</h1></div><div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none"><p style="margin:0 0 14px;color:#1e293b;font-size:16px">Hi ${firstName},</p><p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.5">Thanks for exploring CampusVoice.AI! Your feedback shapes our product.</p><div style="text-align:center;margin:20px 0"><a href="${appUrl}/feedback" style="display:inline-block;background:#1e293b;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">Share Feedback</a></div></div><div style="background:#f8fafc;padding:16px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;text-align:center"><p style="margin:0;color:#94a3b8;font-size:11px">— The CampusVoice.AI Team</p></div></div>`;

    const emailResponse = await resend.emails.send({
      from: "CampusVoice.AI <hello@campusvoice.ai>",
      to: [email],
      subject: template?.subject?.replace(/\{\{first_name\}\}/g, firstName) || `Thank You for Joining CampusVoice.AI Beta!`,
      html: htmlContent,
    });

    console.log("Beta feedback email sent:", emailResponse);

    let tenantId = null;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", userId)
        .maybeSingle();
      tenantId = profile?.tenant_id;
    }

    if (tenantId && userId) {
      await supabase.from("email_nudges").insert({
        tenant_id: tenantId,
        user_id: userId,
        nudge_type: "beta_thank_you",
        email_count: 1,
        recipient_email: email,
        recipient_name: `${firstName} ${lastName || ""}`.trim(),
        subject: template?.subject?.replace(/\{\{first_name\}\}/g, firstName) || `Thank You for Joining CampusVoice.AI Beta!`,
        email_type: "beta_feedback",
        status: "sent",
        provider: "resend",
        provider_message_id: emailResponse?.data?.id || null,
        delivery_status: "sent",
        metadata: { manual: true, template_id: template?.id },
      });

      if (template) {
        await supabase
          .from("email_templates")
          .update({ send_count: (template.send_count || 0) + 1, last_sent_at: new Date().toISOString() })
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
