import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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
  personalMessage?: string;
  adminEmail?: string; // For same_institution, notify the admin
}

const getSameInstitutionAdminHtml = (refereeName: string, refereeEmail: string, referrerName: string, institutionName: string, personalMessage?: string) => `
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
                    <img src="https://uplaybook.ai/uplaybook-logo.png" alt="UPlaybook.AI" style="height: 40px; width: auto;" />
                  </td>
                </tr>
              </table>
              <h1 style="margin: 20px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 600;">New Colleague Referral</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff;">
              <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Hello Admin,</p>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                <strong style="color: #1e293b;">${referrerName}</strong> from your team would like to invite a colleague to UPlaybook.AI.
              </p>
              
              <!-- Referral details box -->
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 16px; font-weight: 600;">Referral Details</h3>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Name:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${refereeName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${refereeEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Referred by:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${referrerName}</td>
                  </tr>
                </table>
                ${personalMessage ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase;">Personal Message:</p>
                  <p style="margin: 0; color: #475569; font-size: 14px; font-style: italic;">"${personalMessage}"</p>
                </div>
                ` : ''}
              </div>
              
              <!-- CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://uplaybook.ai/admin/users" style="display: inline-block; background-color: #1e293b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                  Review & Invite User →
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.5; text-align: center;">
                You can invite this user from your Admin Panel → Users section.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">— The UPlaybook.AI Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getOtherInstitutionHtml = (refereeName: string, referrerName: string, referrerInstitution: string, personalMessage?: string) => `
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
                    <img src="https://uplaybook.ai/uplaybook-logo.png" alt="UPlaybook.AI" style="height: 40px; width: auto;" />
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
                Your colleague <strong style="color: #1e293b;">${referrerName}</strong> from <strong style="color: #1e293b;">${referrerInstitution}</strong> thinks you'd love <strong style="color: #1e293b;">UPlaybook.AI</strong> — an AI-powered platform for higher education communications.
              </p>
              
              ${personalMessage ? `
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0 0 8px 0; color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase;">Message from ${referrerName}:</p>
                <p style="margin: 0; color: #78350f; font-size: 15px; font-style: italic;">"${personalMessage}"</p>
              </div>
              ` : ''}
              
              <!-- What you can do box -->
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid #3b82f6;">
                <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 16px; font-weight: 600;">What is UPlaybook.AI?</h3>
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
                <a href="https://uplaybook.ai/request-access" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                  Request Access for Your Institution →
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.5; text-align: center;">
                Fill out a quick form and our team will get you set up!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">— The UPlaybook.AI Team</p>
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
    const data: ReferralEmailRequest = await req.json();
    console.log("Processing referral email:", data.referralType, "for", data.refereeEmail);

    const emailsToSend = [];

    if (data.referralType === "same_institution") {
      // Send email to admin
      if (data.adminEmail) {
        emailsToSend.push({
          to: [data.adminEmail],
          subject: `Colleague Referral Request: ${data.refereeName}`,
          html: getSameInstitutionAdminHtml(
            data.refereeName,
            data.refereeEmail,
            data.referrerName,
            data.institutionName,
            data.personalMessage
          ),
        });
      }
    } else {
      // Send email to the referee (person being referred)
      emailsToSend.push({
        to: [data.refereeEmail],
        subject: `${data.referrerName} thinks you'd love UPlaybook.AI!`,
        html: getOtherInstitutionHtml(
          data.refereeName,
          data.referrerName,
          data.institutionName,
          data.personalMessage
        ),
      });
    }

    const results = [];
    for (const emailData of emailsToSend) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "UPlaybook.AI <noreply@uplaybook.ai>",
          ...emailData,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Resend API error:", responseData);
        throw new Error(responseData.message || "Failed to send email");
      }

      results.push(responseData);
      console.log("Referral email sent successfully:", responseData);
    }

    return new Response(JSON.stringify({ success: true, results }), {
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
