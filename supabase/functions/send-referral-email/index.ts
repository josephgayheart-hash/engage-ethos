import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReferralEmailRequest {
  referralType: "same_institution" | "other_institution";
  refereeName: string;
  refereeEmail: string;
  referrerName: string;
  referrerEmail: string;
  institutionName: string;
  referrerInstitution: string;
  tenantId?: string;
  referrerUserId?: string;
  personalMessage?: string;
}

const logoUrl = "https://yeuwpuzbccqnqdlnjhfm.supabase.co/storage/v1/object/public/brand-assets/campusvoice-email-logo.png";

const getSameInstitutionHtml = (refereeName: string, referrerName: string, institutionName: string, tenantId: string, personalMessage?: string) => {
  const messageBlock = personalMessage ? `<div style="background:#fef3c7;border-radius:6px;padding:14px;margin:16px 0;border-left:3px solid #f59e0b"><p style="margin:0 0 4px;color:#92400e;font-size:11px;font-weight:600;text-transform:uppercase">Message from ${referrerName}:</p><p style="margin:0;color:#78350f;font-size:14px;font-style:italic">"${personalMessage}"</p></div>` : '';
  return `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif"><div style="background:#1a2036;padding:24px;text-align:center;border-radius:8px 8px 0 0"><table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td style="background:#fff;padding:10px 14px;border-radius:6px"><img src="${logoUrl}" alt="CampusVoice.AI" style="height:36px"/></td></tr></table><h1 style="margin:16px 0 0;color:#fff;font-size:20px">You're Invited to Join!</h1></div><div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none"><p style="margin:0 0 14px;color:#1e293b;font-size:16px;font-weight:600">Hi ${refereeName},</p><p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.5"><strong>${referrerName}</strong> has invited you to join the <strong>${institutionName}</strong> team on <strong>CampusVoice.AI</strong>.</p>${messageBlock}<div style="background:#eff6ff;border-radius:6px;padding:16px;margin:16px 0;border-left:3px solid #3b82f6"><p style="margin:0 0 10px;color:#1e40af;font-size:13px;font-weight:600">What is CampusVoice.AI?</p><p style="margin:0;color:#1e40af;font-size:13px;line-height:1.5">AI-powered message creation, content scoring, and shared templates for higher ed teams.</p></div><div style="text-align:center;margin:20px 0"><a href="https://campusvoice.ai/request-access?ref=colleague&tenant=${tenantId}&institution=${encodeURIComponent(institutionName)}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">Complete Your Profile</a></div></div><div style="background:#f8fafc;padding:16px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;text-align:center"><p style="margin:0;color:#94a3b8;font-size:11px">— The CampusVoice.AI Team</p></div></div>`;
};

const getOtherInstitutionHtml = (refereeName: string, referrerName: string, referrerInstitution: string, refereeInstitution: string, personalMessage?: string) => {
  const messageBlock = personalMessage ? `<div style="background:#fef3c7;border-radius:6px;padding:14px;margin:16px 0;border-left:3px solid #f59e0b"><p style="margin:0 0 4px;color:#92400e;font-size:11px;font-weight:600;text-transform:uppercase">Message from ${referrerName}:</p><p style="margin:0;color:#78350f;font-size:14px;font-style:italic">"${personalMessage}"</p></div>` : '';
  return `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif"><div style="background:#1a2036;padding:24px;text-align:center;border-radius:8px 8px 0 0"><table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td style="background:#fff;padding:10px 14px;border-radius:6px"><img src="${logoUrl}" alt="CampusVoice.AI" style="height:36px"/></td></tr></table><h1 style="margin:16px 0 0;color:#fff;font-size:20px">You've Been Invited!</h1></div><div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none"><p style="margin:0 0 14px;color:#1e293b;font-size:16px;font-weight:600">Hi ${refereeName},</p><p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.5"><strong>${referrerName}</strong> from <strong>${referrerInstitution}</strong> thinks you and <strong>${refereeInstitution}</strong> would love <strong>CampusVoice.AI</strong>!</p>${messageBlock}<div style="background:#eff6ff;border-radius:6px;padding:16px;margin:16px 0;border-left:3px solid #3b82f6"><p style="margin:0 0 10px;color:#1e40af;font-size:13px;font-weight:600">What is CampusVoice.AI?</p><p style="margin:0;color:#1e40af;font-size:13px;line-height:1.5">AI-powered message creation, content scoring, and institutional templates for higher ed.</p></div><div style="text-align:center;margin:20px 0"><a href="https://campusvoice.ai/request-access?ref=colleague&institution=${encodeURIComponent(refereeInstitution)}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">Request Access for ${refereeInstitution}</a></div></div><div style="background:#f8fafc;padding:16px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;text-align:center"><p style="margin:0;color:#94a3b8;font-size:11px">— The CampusVoice.AI Team</p></div></div>`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const data: ReferralEmailRequest = await req.json();
    console.log("Processing referral email:", data.referralType, "for", data.refereeEmail);

    let emailHtml: string;
    let subject: string;

    if (data.referralType === "same_institution") {
      subject = `${data.referrerName} invited you to join ${data.institutionName} on CampusVoice.AI`;
      emailHtml = getSameInstitutionHtml(data.refereeName, data.referrerName, data.institutionName, data.tenantId || "", data.personalMessage);
    } else {
      subject = `${data.referrerName} thinks you'd love CampusVoice.AI!`;
      emailHtml = getOtherInstitutionHtml(data.refereeName, data.referrerName, data.referrerInstitution, data.institutionName, data.personalMessage);
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CampusVoice.AI <noreply@campusvoice.ai>",
        to: [data.refereeEmail],
        subject,
        html: emailHtml,
      }),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Referral email sent successfully:", responseData);

    if (data.tenantId && data.referrerUserId) {
      const { error: nudgeError } = await supabase.from("email_nudges").insert({
        user_id: data.referrerUserId,
        tenant_id: data.tenantId,
        nudge_type: "referral",
        email_type: "referral",
        email_count: 1,
        subject: subject,
        recipient_name: data.refereeName,
        recipient_email: data.refereeEmail,
        provider: "resend",
        provider_message_id: responseData.id,
        delivery_status: "sent",
        metadata: { referral_type: data.referralType, referrer_name: data.referrerName, institution: data.institutionName },
      });
      if (nudgeError) {
        console.error("Error logging email nudge:", nudgeError);
      }
    }

    return new Response(JSON.stringify({ success: true, result: responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-referral-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
