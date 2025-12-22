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

// Same institution: Direct invite to join the referrer's team
const getSameInstitutionHtml = (
  refereeName: string,
  referrerName: string,
  institutionName: string,
  tenantId: string,
  personalMessage?: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px; background-color: #f8fafc;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a2036; padding: 32px 40px; text-align: center;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ffffff; padding: 12px 16px; border-radius: 8px;">
                    <img src="https://yeuwpuzbccqnqdlnjhfm.supabase.co/storage/v1/object/public/institution-logos/c839f165-e8fe-4de5-b32b-aaa29d298e3b/logo-1766116626433.png" alt="CampusVoice.AI" style="height: 40px; width: auto;" />
                  </td>
                </tr>
              </table>
              <h1 style="margin: 20px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 600;">You're Invited to Join!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff;">
              <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Hi ${refereeName},</p>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Great news! <strong style="color: #1e293b;">${referrerName}</strong> has invited you to join the <strong style="color: #1e293b;">${institutionName}</strong> team on <strong style="color: #1e293b;">CampusVoice.AI</strong>.
              </p>
              
              ${personalMessage ? `
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0 0 8px 0; color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase;">Message from ${referrerName}:</p>
                <p style="margin: 0; color: #78350f; font-size: 15px; font-style: italic;">"${personalMessage}"</p>
              </div>
              ` : ''}
              
              <!-- What you can do box -->
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid #3b82f6;">
                <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 16px; font-weight: 600;">What is CampusVoice.AI?</h3>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0; color: #1e40af; font-size: 15px;">✨ <strong>AI-powered message creation</strong> for emails, texts, and more</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #1e40af; font-size: 15px;">📊 <strong>Content scoring</strong> to improve your communications</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #1e40af; font-size: 15px;">🎓 <strong>Built for higher ed</strong> enrollment & student success teams</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #1e40af; font-size: 15px;">📚 <strong>Shared templates</strong> with your team</td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://campusvoice.ai/request-access?ref=colleague&tenant=${tenantId}&institution=${encodeURIComponent(institutionName)}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                  Complete Your Profile →
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.5; text-align: center;">
                Click above to set up your account and join your team!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">— The CampusVoice.AI Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Other institution: Invite to request access for their own institution
const getOtherInstitutionHtml = (
  refereeName: string,
  referrerName: string,
  referrerInstitution: string,
  refereeInstitution: string,
  personalMessage?: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px; background-color: #f8fafc;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a2036; padding: 32px 40px; text-align: center;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ffffff; padding: 12px 16px; border-radius: 8px;">
                    <img src="https://yeuwpuzbccqnqdlnjhfm.supabase.co/storage/v1/object/public/institution-logos/c839f165-e8fe-4de5-b32b-aaa29d298e3b/logo-1766116626433.png" alt="CampusVoice.AI" style="height: 40px; width: auto;" />
                  </td>
                </tr>
              </table>
              <h1 style="margin: 20px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 600;">You've Been Invited!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff;">
              <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Hi ${refereeName},</p>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Your colleague <strong style="color: #1e293b;">${referrerName}</strong> from <strong style="color: #1e293b;">${referrerInstitution}</strong> thinks you and <strong style="color: #1e293b;">${refereeInstitution}</strong> would love <strong style="color: #1e293b;">CampusVoice.AI</strong>!
              </p>
              
              ${personalMessage ? `
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0 0 8px 0; color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase;">Message from ${referrerName}:</p>
                <p style="margin: 0; color: #78350f; font-size: 15px; font-style: italic;">"${personalMessage}"</p>
              </div>
              ` : ''}
              
              <!-- What you can do box -->
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid #3b82f6;">
                <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 16px; font-weight: 600;">What is CampusVoice.AI?</h3>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0; color: #1e40af; font-size: 15px;">✨ <strong>AI-powered message creation</strong> for emails, texts, and more</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #1e40af; font-size: 15px;">📊 <strong>Content scoring</strong> to improve your communications</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #1e40af; font-size: 15px;">🎓 <strong>Built for higher ed</strong> enrollment & student success teams</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #1e40af; font-size: 15px;">📚 <strong>Institutional templates</strong> for consistent messaging</td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://campusvoice.ai/request-access?ref=colleague&institution=${encodeURIComponent(refereeInstitution)}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                  Request Access for ${refereeInstitution} →
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.5; text-align: center;">
                Complete your profile and we'll get your institution set up!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">— The CampusVoice.AI Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

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
      emailHtml = getSameInstitutionHtml(
        data.refereeName,
        data.referrerName,
        data.institutionName,
        data.tenantId || "",
        data.personalMessage
      );
    } else {
      subject = `${data.referrerName} thinks you'd love CampusVoice.AI!`;
      emailHtml = getOtherInstitutionHtml(
        data.refereeName,
        data.referrerName,
        data.referrerInstitution,
        data.institutionName,
        data.personalMessage
      );
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

    // Log to email_nudges for tracking
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
        metadata: {
          referral_type: data.referralType,
          referrer_name: data.referrerName,
          institution: data.institutionName,
        },
      });

      if (nudgeError) {
        console.error("Error logging email nudge:", nudgeError);
      } else {
        console.log("Email nudge logged successfully");
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
