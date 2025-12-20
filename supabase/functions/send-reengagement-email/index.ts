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

interface ReengagementEmailRequest {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  institutionName: string;
  lastLoginAt: string | null;
}

const getWhereHaveYouBeenHtml = (firstName: string, institutionName: string, lastLoginAt: string | null) => {
  const now = new Date();
  let daysSince = 0;
  let timeMessage = "";
  
  if (lastLoginAt) {
    const lastLogin = new Date(lastLoginAt);
    daysSince = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    timeMessage = `It's been ${daysSince} days since you last visited UPlaybook.AI.`;
  } else {
    timeMessage = "You were invited to UPlaybook.AI but haven't logged in yet.";
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <style>
    * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px; background-color: #f8fafc;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header with confused emoji theme -->
          <tr>
            <td style="background-color: #1a2036; padding: 32px 40px; text-align: center;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ffffff; padding: 12px 16px; border-radius: 8px;">
                    <img src="https://uplaybook.ai/uplaybook-logo.png" alt="UPlaybook.AI" style="height: 40px; width: auto;" />
                  </td>
                </tr>
              </table>
              <h1 style="margin: 20px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 600;">Where Have You Been? 🤔</h1>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">We miss you!</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff;">
              <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Hi ${firstName},</p>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                ${timeMessage} We wanted to check in and see how you're doing!
              </p>
              
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Your colleagues at <strong style="color: #1e293b;">${institutionName}</strong> have been using UPlaybook.AI to create amazing content, and we'd love to help you do the same.
              </p>
              
              <!-- What's new box with amber/orange theme -->
              <div style="background-color: #fffbeb; border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid #f59e0b;">
                <h3 style="margin: 0 0 16px 0; color: #92400e; font-size: 16px; font-weight: 600;">🤷 Things you might be missing:</h3>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 10px 0; color: #92400e; font-size: 15px;">
                      <strong>✨ New AI improvements</strong><br/>
                      <span style="color: #b45309; font-size: 14px;">Our AI has gotten even better at understanding your voice</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #92400e; font-size: 15px;">
                      <strong>📚 Updated templates</strong><br/>
                      <span style="color: #b45309; font-size: 14px;">Check out what your team has added to the library</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #92400e; font-size: 15px;">
                      <strong>🎯 Brand DNA features</strong><br/>
                      <span style="color: #b45309; font-size: 14px;">Your institution's voice is ready to power your content</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #92400e; font-size: 15px;">
                      <strong>💬 AI Playground</strong><br/>
                      <span style="color: #b45309; font-size: 14px;">Chat with AI about your communication challenges</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://uplaybook.ai/login" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">
                  Come Back & Explore →
                </a>
              </div>
              
              <!-- Friendly note -->
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-top: 24px; text-align: center;">
                <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                  🙋 Need help getting started? Just reply to this email and we'll be happy to help!
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; text-align: center;">
                We're here whenever you're ready!
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                — The UPlaybook.AI Team
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Sub-footer -->
        <p style="margin: 24px 0 0 0; color: #94a3b8; font-size: 12px; text-align: center;">
          This email was sent by UPlaybook.AI because we noticed you haven't visited in a while.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, email, firstName, lastName, institutionName, lastLoginAt }: ReengagementEmailRequest = await req.json();

    console.log(`Sending re-engagement email to ${email} (${firstName} ${lastName})`);

    const htmlContent = getWhereHaveYouBeenHtml(firstName, institutionName || 'your institution', lastLoginAt);
    const subject = `We haven't seen you in a while, ${firstName}! 🤔`;

    // Send email via Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "UPlaybook.AI <noreply@uplaybook.ai>",
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

    console.log("Re-engagement email sent successfully:", responseData);

    // Get user's tenant_id
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
        nudge_type: "where_have_you_been",
        email_count: 1,
        recipient_email: email,
        recipient_name: `${firstName} ${lastName || ""}`.trim(),
        subject,
        email_type: "reengagement",
        status: "sent",
        metadata: { manual: true, institution: institutionName, last_login: lastLoginAt },
      });
      if (nudgeError) {
        console.error("Failed to log email nudge:", nudgeError);
      } else {
        console.log("Email nudge logged successfully");
      }
    }

    return new Response(JSON.stringify({ success: true, ...responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-reengagement-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);