import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (!RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY secret");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  temporaryPassword: string;
  institutionName: string;
  role: string;
  tenantId?: string;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, firstName, lastName, temporaryPassword, institutionName, role, tenantId, userId }: InviteEmailRequest = await req.json();

    console.log(`Sending invite email to ${email} for ${institutionName}`);

    const roleDisplayName = role === 'super_admin' 
      ? 'CampusVoice Super Admin' 
      : role === 'admin' 
        ? 'University Admin'
        : role === 'approver' || role === 'user_approver'
          ? 'University User + Approver'
          : 'University User';

    const logoUrl = "https://yeuwpuzbccqnqdlnjhfm.supabase.co/storage/v1/object/public/brand-assets/campusvoice-email-logo.png";

    const htmlContent = `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif"><div style="background:#1a2036;padding:28px;text-align:center;border-radius:8px 8px 0 0"><table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td style="background:#fff;padding:12px 16px;border-radius:8px"><img src="${logoUrl}" alt="CampusVoice.AI" style="height:40px"/></td></tr></table><h1 style="margin:18px 0 0;color:#fff;font-size:22px">Welcome to CampusVoice.AI</h1><p style="margin:6px 0 0;color:#94a3b8;font-size:13px">AI-Powered Communication Platform</p></div><div style="background:#fff;padding:28px;border:1px solid #e2e8f0;border-top:none"><h2 style="margin:0 0 12px;color:#1e293b;font-size:20px">Welcome, ${firstName}!</h2><p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.5">You've been invited to join <strong>${institutionName}</strong> as a <strong>${roleDisplayName}</strong>.</p><div style="background:#f1f5f9;border-radius:8px;padding:18px;margin:18px 0"><p style="margin:0 0 12px;color:#1e293b;font-size:13px;font-weight:600;text-transform:uppercase">Your Login Credentials</p><p style="margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase">Email</p><p style="margin:0 0 10px;color:#1e293b;font-size:14px;font-family:monospace;background:#fff;padding:8px;border-radius:4px;border:1px solid #e2e8f0">${email}</p><p style="margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase">Temporary Password</p><p style="margin:0;color:#1e293b;font-size:14px;font-family:monospace;background:#fff;padding:8px;border-radius:4px;border:1px solid #e2e8f0">${temporaryPassword}</p></div><div style="text-align:center;margin:24px 0"><a href="https://www.campusvoice.ai/login" style="display:inline-block;background:#1e293b;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">Login to CampusVoice.AI</a></div><div style="background:#fef3c7;border-left:3px solid #f59e0b;padding:12px;border-radius:0 6px 6px 0"><p style="margin:0;color:#92400e;font-size:13px;line-height:1.4"><strong>Important:</strong> You'll be prompted to change your password on first login.</p></div></div><div style="background:#f8fafc;padding:18px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;text-align:center"><p style="margin:0 0 4px;color:#64748b;font-size:13px">Welcome to the team!</p><p style="margin:0;color:#94a3b8;font-size:11px">— The CampusVoice.AI Team</p></div></div>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CampusVoice.AI <noreply@campusvoice.ai>",
        to: [email],
        subject: `Welcome to CampusVoice.AI - ${institutionName}`,
        html: htmlContent,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Invite email sent successfully:", responseData);

    if (tenantId && userId) {
      const { error: nudgeError } = await supabase.from("email_nudges").insert({
        tenant_id: tenantId,
        user_id: userId,
        nudge_type: "admin_invite",
        email_count: 1,
        recipient_email: email,
        recipient_name: `${firstName} ${lastName}`,
        subject: `Welcome to CampusVoice.AI - ${institutionName}`,
        email_type: "invite",
        status: "sent",
        provider: "resend",
        provider_message_id: responseData?.id || null,
        delivery_status: "sent",
        metadata: { role, institution: institutionName },
      });
      if (nudgeError) {
        console.error("Failed to log email nudge:", nudgeError);
      }
    }

    return new Response(JSON.stringify({ success: true, ...responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
