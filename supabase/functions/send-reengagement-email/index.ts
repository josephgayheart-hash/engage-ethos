import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY secret");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReengagementEmailRequest {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  institutionName: string;
  lastLoginAt: string | null;
}

const logoUrl = "https://yeuwpuzbccqnqdlnjhfm.supabase.co/storage/v1/object/public/brand-assets/campusvoice-email-logo.png";

const getTrackingUrl = (nudgeId: string, destination: string, linkName: string) => {
  const baseUrl = `${SUPABASE_URL}/functions/v1/track-email-click`;
  return `${baseUrl}?id=${nudgeId}&url=${encodeURIComponent(destination)}&link=${encodeURIComponent(linkName)}`;
};

const getWhereHaveYouBeenHtml = (firstName: string, institutionName: string, lastLoginAt: string | null, trackingLoginUrl: string) => {
  const now = new Date();
  let timeMessage = "";
  
  if (lastLoginAt) {
    const lastLogin = new Date(lastLoginAt);
    const daysSince = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    timeMessage = `It's been ${daysSince} days since you last visited CampusVoice.AI.`;
  } else {
    timeMessage = "You were invited to CampusVoice.AI but haven't logged in yet.";
  }

  return `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif"><div style="background:#1a2036;padding:24px;text-align:center;border-radius:8px 8px 0 0"><table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td style="background:#fff;padding:10px 14px;border-radius:6px"><img src="${logoUrl}" alt="CampusVoice.AI" style="height:36px"/></td></tr></table><h1 style="margin:16px 0 0;color:#fff;font-size:20px">Where Have You Been?</h1><p style="margin:6px 0 0;color:#94a3b8;font-size:12px">We miss you!</p></div><div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none"><p style="margin:0 0 14px;color:#1e293b;font-size:16px;font-weight:600">Hi ${firstName},</p><p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.5">${timeMessage} Your colleagues at <strong>${institutionName}</strong> have been using CampusVoice.AI.</p><div style="background:#fffbeb;border-radius:6px;padding:16px;margin:16px 0;border-left:3px solid #f59e0b"><p style="margin:0 0 10px;color:#92400e;font-size:13px;font-weight:600">Things you might be missing:</p><p style="margin:0;color:#92400e;font-size:13px;line-height:1.6">New AI improvements, updated templates, Brand DNA features, and AI Playground.</p></div><div style="text-align:center;margin:20px 0"><a href="${trackingLoginUrl}" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">Come Back & Explore</a></div><div style="background:#f8fafc;border-radius:6px;padding:12px;margin:16px 0;text-align:center"><p style="margin:0;color:#64748b;font-size:12px">Need help? Just reply to this email!</p></div></div><div style="background:#f8fafc;padding:16px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;text-align:center"><p style="margin:0 0 4px;color:#64748b;font-size:12px">We're here whenever you're ready!</p><p style="margin:0;color:#94a3b8;font-size:11px">— The CampusVoice.AI Team</p></div></div>`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { userId, email, firstName, lastName, institutionName, lastLoginAt }: ReengagementEmailRequest = await req.json();

    console.log(`Sending re-engagement email to ${email} (${firstName} ${lastName})`);

    const subject = `We haven't seen you in a while, ${firstName}!`;
    const loginUrl = "https://www.campusvoice.ai/login";

    // Get tenant ID
    let tenantId = null;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", userId)
        .maybeSingle();
      tenantId = profile?.tenant_id;
    }

    // Create nudge record first to get ID for tracking
    let nudgeId: string | null = null;
    if (tenantId && userId) {
      const { data: nudge, error: nudgeError } = await supabase.from("email_nudges").insert({
        tenant_id: tenantId,
        user_id: userId,
        nudge_type: "where_have_you_been",
        email_count: 1,
        recipient_email: email,
        recipient_name: `${firstName} ${lastName || ""}`.trim(),
        subject,
        email_type: "reengagement",
        status: "pending",
        delivery_status: "pending",
        metadata: { manual: true, institution: institutionName, last_login: lastLoginAt },
      }).select("id").single();
      
      if (!nudgeError && nudge) {
        nudgeId = nudge.id;
        console.log(`Created nudge record: ${nudgeId}`);
      }
    }

    // Build tracking URL
    const trackingLoginUrl = nudgeId 
      ? getTrackingUrl(nudgeId, loginUrl, "come_back_button")
      : loginUrl;

    const htmlContent = getWhereHaveYouBeenHtml(firstName, institutionName || 'your institution', lastLoginAt, trackingLoginUrl);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CampusVoice.AI <noreply@campusvoice.ai>",
        to: [email],
        subject,
        html: htmlContent,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", responseData);
      if (nudgeId) {
        await supabase.from("email_nudges").update({ status: "failed", delivery_status: "failed" }).eq("id", nudgeId);
      }
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Re-engagement email sent successfully:", responseData);

    // Update nudge with success status
    if (nudgeId) {
      await supabase.from("email_nudges").update({
        status: "sent",
        provider: "resend",
        provider_message_id: responseData?.id || null,
        delivery_status: "sent",
      }).eq("id", nudgeId);
    }

    return new Response(JSON.stringify({ success: true, ...responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-reengagement-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
