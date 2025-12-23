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

interface ApprovalEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  temporaryPassword: string;
  institutionName: string;
  role: string;
  userId?: string;
  tenantId?: string;
}

const getTrackingUrl = (nudgeId: string, destination: string, linkName: string) => {
  const baseUrl = `${SUPABASE_URL}/functions/v1/track-email-click`;
  return `${baseUrl}?id=${nudgeId}&url=${encodeURIComponent(destination)}&link=${encodeURIComponent(linkName)}`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { email, firstName, lastName, temporaryPassword, institutionName, role, userId, tenantId }: ApprovalEmailRequest = await req.json();

    console.log(`Sending approval email to ${email} for ${institutionName}`);

    const roleDisplayName = role === 'super_admin' 
      ? 'CampusVoice Super Admin' 
      : role === 'admin' 
        ? 'University Admin'
        : role === 'approver' || role === 'user_approver'
          ? 'University User + Approver'
          : 'University User';

    const subject = `You're In! Welcome to CampusVoice.AI - ${institutionName}`;
    const logoUrl = "https://yeuwpuzbccqnqdlnjhfm.supabase.co/storage/v1/object/public/brand-assets/campusvoice-email-logo.png";
    const loginUrl = "https://www.campusvoice.ai/login";

    // Create nudge record first to get ID for tracking
    let nudgeId: string | null = null;
    if (userId && tenantId) {
      const { data: nudge, error: nudgeError } = await supabase.from("email_nudges").insert({
        user_id: userId,
        tenant_id: tenantId,
        nudge_type: "approval",
        email_type: "approval",
        email_count: 1,
        subject,
        recipient_name: `${firstName} ${lastName}`,
        recipient_email: email,
        status: "pending",
        delivery_status: "pending",
        metadata: { institution_name: institutionName, role },
      }).select("id").single();
      
      if (!nudgeError && nudge) {
        nudgeId = nudge.id;
        console.log(`Created nudge record: ${nudgeId}`);
      }
    }

    // Build tracking URL
    const trackingLoginUrl = nudgeId 
      ? getTrackingUrl(nudgeId, loginUrl, "start_using_button")
      : loginUrl;

    const htmlContent = `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif"><div style="background:#1a2036;padding:28px;text-align:center;border-radius:8px 8px 0 0"><table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td style="background:#fff;padding:12px 16px;border-radius:8px"><img src="${logoUrl}" alt="CampusVoice.AI" style="height:40px"/></td></tr></table></div><div style="background:#059669;padding:24px;text-align:center"><p style="font-size:36px;margin:0 0 8px">🎉</p><h1 style="margin:0;color:#fff;font-size:24px">You're In!</h1><p style="margin:6px 0 0;color:#d1fae5;font-size:14px">Welcome to the CampusVoice.AI community</p></div><div style="background:#fff;padding:28px;border:1px solid #e2e8f0;border-top:none"><h2 style="margin:0 0 12px;color:#1e293b;font-size:20px">Great news, ${firstName}!</h2><p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.5">Your request to join <strong style="color:#059669">${institutionName}</strong> has been <strong style="color:#059669">approved</strong>! You've been set up as a <strong>${roleDisplayName}</strong>.</p><div style="background:#ecfdf5;border-radius:8px;padding:18px;margin:18px 0;border:1px solid #a7f3d0"><p style="margin:0 0 12px;color:#065f46;font-size:13px;font-weight:600;text-transform:uppercase">Your Login Credentials</p><p style="margin:0 0 4px;color:#047857;font-size:11px;text-transform:uppercase">Email</p><p style="margin:0 0 10px;color:#065f46;font-size:14px;font-family:monospace;background:#fff;padding:8px;border-radius:4px;border:2px solid #10b981">${email}</p><p style="margin:0 0 4px;color:#047857;font-size:11px;text-transform:uppercase">Temporary Password</p><p style="margin:0;color:#065f46;font-size:14px;font-family:monospace;background:#fff;padding:8px;border-radius:4px;border:2px solid #10b981">${temporaryPassword}</p></div><div style="text-align:center;margin:24px 0"><a href="${trackingLoginUrl}" style="display:inline-block;background:#059669;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Start Using CampusVoice.AI</a></div><div style="background:#f8fafc;border-radius:8px;padding:16px;margin:18px 0"><p style="margin:0 0 10px;color:#1e293b;font-size:14px;font-weight:600">What's next?</p><p style="margin:0;color:#475569;font-size:13px;line-height:1.6">Log in, set your password, and explore the AI-powered message builder!</p></div><div style="background:#fef3c7;border-left:3px solid #f59e0b;padding:12px;border-radius:0 6px 6px 0"><p style="margin:0;color:#92400e;font-size:13px"><strong>Security tip:</strong> You'll change your password on first login.</p></div></div><div style="background:#f8fafc;padding:18px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;text-align:center"><p style="margin:0 0 6px;color:#475569;font-size:13px">We're excited to have you on board!</p><p style="margin:0;color:#94a3b8;font-size:11px">— The CampusVoice.AI Team</p></div></div>`;

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

    console.log("Approval email sent successfully:", responseData);

    // Update nudge with success status
    if (nudgeId) {
      await supabase.from("email_nudges").update({
        status: "sent",
        provider: "resend",
        provider_message_id: responseData.id,
        delivery_status: "sent",
      }).eq("id", nudgeId);
    }

    return new Response(JSON.stringify({ success: true, ...responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
