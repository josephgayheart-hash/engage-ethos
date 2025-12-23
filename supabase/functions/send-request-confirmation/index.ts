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

interface RequestConfirmationEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  institutionName: string;
  requestId?: string;
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
    const { email, firstName, lastName, institutionName, requestId }: RequestConfirmationEmailRequest = await req.json();

    console.log(`Sending request confirmation email to ${email}`);

    const subject = "CampusVoice.AI - Access Request Received";
    const logoUrl = "https://yeuwpuzbccqnqdlnjhfm.supabase.co/storage/v1/object/public/brand-assets/campusvoice-email-logo.png";

    const htmlContent = `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif"><div style="background:#1a2036;padding:28px;text-align:center;border-radius:8px 8px 0 0"><table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td style="background:#fff;padding:12px 16px;border-radius:8px"><img src="${logoUrl}" alt="CampusVoice.AI" style="height:40px"/></td></tr></table><h1 style="margin:18px 0 0;color:#fff;font-size:22px">Request Received</h1><p style="margin:6px 0 0;color:#94a3b8;font-size:13px">We're reviewing your access request</p></div><div style="background:#fff;padding:28px;border:1px solid #e2e8f0;border-top:none"><h2 style="margin:0 0 12px;color:#1e293b;font-size:20px">Hi ${firstName},</h2><p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.5">Thank you for your interest in <strong>CampusVoice.AI</strong>! We've received your access request for <strong>${institutionName}</strong>.</p><div style="background:#f0fdf4;border-left:3px solid #22c55e;padding:14px;border-radius:0 6px 6px 0;margin:18px 0"><p style="margin:0;color:#166534;font-size:14px;line-height:1.4"><strong>What happens next?</strong> An administrator will review your request and you'll receive an email with your login credentials once approved.</p></div><div style="background:#f1f5f9;border-radius:8px;padding:18px;margin:18px 0"><p style="margin:0 0 12px;color:#1e293b;font-size:13px;font-weight:600;text-transform:uppercase">Your Request Details</p><p style="margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase">Name</p><p style="margin:0 0 10px;color:#1e293b;font-size:14px">${firstName} ${lastName}</p><p style="margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase">Email</p><p style="margin:0 0 10px;color:#1e293b;font-size:14px">${email}</p><p style="margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase">Institution</p><p style="margin:0;color:#1e293b;font-size:14px">${institutionName}</p></div><p style="margin:18px 0 0;color:#475569;font-size:13px">If you have any questions, please contact your institution's administrator.</p></div><div style="background:#f8fafc;padding:18px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;text-align:center"><p style="margin:0 0 4px;color:#64748b;font-size:13px">Thank you for your patience!</p><p style="margin:0;color:#94a3b8;font-size:11px">— The CampusVoice.AI Team</p></div></div>`;

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
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Request confirmation email sent successfully:", responseData);

    const systemTenantId = "00000000-0000-0000-0000-000000000000";
    await supabase.from("email_nudges").insert({
      user_id: requestId || "00000000-0000-0000-0000-000000000001",
      tenant_id: systemTenantId,
      nudge_type: "request_confirmation",
      email_type: "request_confirmation",
      email_count: 1,
      subject,
      recipient_name: `${firstName} ${lastName}`,
      recipient_email: email,
      provider: "resend",
      provider_message_id: responseData.id,
      delivery_status: "sent",
      status: "sent",
      metadata: { institution_name: institutionName, request_id: requestId },
    });

    // Send notification to super admins with tracking
    try {
      const { data: superAdminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "super_admin");

      if (superAdminRoles && superAdminRoles.length > 0) {
        const superAdminUserIds = superAdminRoles.map(r => r.user_id);
        const { data: superAdminProfiles } = await supabase
          .from("profiles")
          .select("email, tenant_id")
          .in("id", superAdminUserIds);

        if (superAdminProfiles && superAdminProfiles.length > 0) {
          const superAdminEmails = superAdminProfiles.map(p => p.email);
          const adminSubject = `New Access Request: ${firstName} ${lastName} from ${institutionName}`;
          const adminUrl = "https://www.campusvoice.ai/admin/onboarding";

          // Create admin nudge for tracking
          const { data: adminNudge } = await supabase.from("email_nudges").insert({
            user_id: superAdminUserIds[0],
            tenant_id: superAdminProfiles[0]?.tenant_id || systemTenantId,
            nudge_type: "admin_notification",
            email_type: "admin_notification",
            email_count: 1,
            subject: adminSubject,
            recipient_name: "Super Admins",
            recipient_email: superAdminEmails.join(", "),
            status: "pending",
            delivery_status: "pending",
            metadata: { request_from: email, institution: institutionName },
          }).select("id").single();

          const trackingAdminUrl = adminNudge?.id 
            ? getTrackingUrl(adminNudge.id, adminUrl, "review_requests_button")
            : adminUrl;

          const adminHtml = `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif"><div style="background:#1a2036;padding:24px;text-align:center;border-radius:8px 8px 0 0"><h1 style="margin:0;color:#fff;font-size:18px">New Access Request</h1></div><div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none"><p style="margin:0 0 16px;color:#475569;font-size:15px">A new user has requested access:</p><div style="background:#fef3c7;border-left:3px solid #f59e0b;padding:14px;border-radius:0 6px 6px 0;margin:16px 0"><p style="margin:0 0 6px;color:#1e293b;font-size:14px"><strong>Name:</strong> ${firstName} ${lastName}</p><p style="margin:0 0 6px;color:#1e293b;font-size:14px"><strong>Email:</strong> ${email}</p><p style="margin:0;color:#1e293b;font-size:14px"><strong>Institution:</strong> ${institutionName}</p></div><div style="text-align:center;margin:20px 0"><a href="${trackingAdminUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">Review Requests</a></div><p style="margin:16px 0 0;color:#64748b;font-size:12px;text-align:center">You're receiving this because you're a super admin.</p></div></div>`;

          const adminResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "CampusVoice.AI <noreply@campusvoice.ai>",
              to: superAdminEmails,
              subject: adminSubject,
              html: adminHtml,
            }),
          });

          const adminResponseData = await adminResponse.json();
          if (adminNudge?.id) {
            await supabase.from("email_nudges").update({
              status: adminResponse.ok ? "sent" : "failed",
              provider: "resend",
              provider_message_id: adminResponseData?.id,
              delivery_status: adminResponse.ok ? "sent" : "failed",
            }).eq("id", adminNudge.id);
          }
          console.log(`Admin notification sent to ${superAdminEmails.length} super admins`);
        }
      }
    } catch (adminError) {
      console.error("Error sending admin notification:", adminError);
    }

    return new Response(JSON.stringify({ success: true, ...responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-request-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
