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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, firstName, lastName, temporaryPassword, institutionName, role, tenantId, userId }: InviteEmailRequest = await req.json();

    console.log(`Sending invite email to ${email} for ${institutionName}`);

    // Map role to display name
    const roleDisplayName = role === 'super_admin' 
      ? 'CampusVoice Super Admin' 
      : role === 'admin' 
        ? 'University Admin'
        : role === 'approver' || role === 'user_approver'
          ? 'University User + Approver'
          : 'University User';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <style>
          :root { color-scheme: light dark; }
          * { -webkit-text-fill-color: inherit !important; }
          .logo-img { -webkit-filter: invert(0) contrast(1.08) saturate(1.08) !important; filter: invert(0) contrast(1.08) saturate(1.08) !important; }
          u + .body { background-color: #f8fafc !important; }
          @media (prefers-color-scheme: dark) {
            .body-wrapper { background-color: #f8fafc !important; }
            .main-card { background-color: #ffffff !important; }
            .logo-area { background-color: #ffffff !important; }
            .logo-tile { background-color: #ffffff !important; }
            .logo-img { background-color: #ffffff !important; -webkit-filter: invert(0) contrast(1.22) saturate(1.22) !important; filter: invert(0) contrast(1.22) saturate(1.22) !important; opacity: 1 !important; mix-blend-mode: normal !important; }
            .credentials-box { background-color: #f1f5f9 !important; }
            .credentials-field { background-color: #ffffff !important; color: #1e293b !important; }
            .content-area { background-color: #ffffff !important; }
            .notice-box { background-color: #fef3c7 !important; }
            .footer-area { background-color: #f8fafc !important; }
            body, table, td, div, p, a, span, h1, h2, h3 { 
              -webkit-text-fill-color: inherit !important;
            }
            .dark-text { color: #1e293b !important; -webkit-text-fill-color: #1e293b !important; }
            .muted-text { color: #475569 !important; -webkit-text-fill-color: #475569 !important; }
            .white-text { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
          }
        </style>
      </head>
      <body class="body" style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
        <div style="display: none; max-height: 0; overflow: hidden;">Welcome to CampusVoice.AI - Your login credentials inside</div>
        <table class="body-wrapper" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc !important; padding: 40px 20px;" bgcolor="#f8fafc">
          <tr>
            <td align="center">
              <table class="main-card" width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff !important; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;" bgcolor="#ffffff">
                <!-- Navy Header Banner with Logo -->
                <tr>
                  <td class="logo-area" style="background-color: #1a2036 !important; padding: 40px 40px 32px 40px; text-align: center;" bgcolor="#1a2036">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;" bgcolor="#1a2036">
                      <tr>
                        <td style="background-color: #ffffff !important; padding: 16px 20px; border-radius: 10px;" bgcolor="#ffffff">
                          <img class="logo-img" src="https://yeuwpuzbccqnqdlnjhfm.supabase.co/storage/v1/object/public/brand-assets/CampusVoice.AI_logo.png" alt="CampusVoice.AI" style="height: 50px; width: auto; display: block; background-color: #ffffff !important;" />
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin: 24px 0 0 0; color: #ffffff !important; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; background-color: #1a2036 !important; -webkit-text-fill-color: #ffffff !important;" bgcolor="#1a2036">Welcome to CampusVoice.AI</h1>
                    <p style="margin: 8px 0 0 0; color: #94a3b8 !important; font-size: 14px; font-weight: 600; background-color: #1a2036 !important; -webkit-text-fill-color: #94a3b8 !important;" bgcolor="#1a2036">AI-Powered Communication Platform</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px; background-color: #ffffff !important;" bgcolor="#ffffff">
                    <h2 style="margin: 0 0 16px 0; color: #1e293b !important; font-size: 24px; font-weight: 600; background-color: #ffffff !important;" bgcolor="#ffffff">Welcome, ${firstName}!</h2>
                    <p style="margin: 0 0 24px 0; color: #475569 !important; font-size: 16px; line-height: 1.6; background-color: #ffffff !important;" bgcolor="#ffffff">
                      You've been invited to join <strong style="color: #1e293b !important;">CampusVoice.AI</strong> as a <strong style="color: #1e293b !important;">${roleDisplayName}</strong> for <strong style="color: #1e293b !important;">${institutionName}</strong>.
                    </p>
                    
                    <!-- Credentials Box -->
                    <div style="background-color: #f1f5f9 !important; border-radius: 8px; padding: 24px; margin: 24px 0;" bgcolor="#f1f5f9">
                      <h3 style="margin: 0 0 16px 0; color: #1e293b !important; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background-color: #f1f5f9 !important;" bgcolor="#f1f5f9">Your Login Credentials</h3>
                      
                      <div style="margin-bottom: 12px;">
                        <p style="margin: 0 0 4px 0; color: #64748b !important; font-size: 12px; font-weight: 500; text-transform: uppercase; background-color: #f1f5f9 !important;" bgcolor="#f1f5f9">Email</p>
                        <p style="margin: 0; color: #1e293b !important; font-size: 16px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; background-color: #ffffff !important; padding: 10px 12px; border-radius: 6px; border: 1px solid #e2e8f0;" bgcolor="#ffffff">${email}</p>
                      </div>
                      
                      <div>
                        <p style="margin: 0 0 4px 0; color: #64748b !important; font-size: 12px; font-weight: 500; text-transform: uppercase; background-color: #f1f5f9 !important;" bgcolor="#f1f5f9">Temporary Password</p>
                        <p style="margin: 0; color: #1e293b !important; font-size: 16px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; background-color: #ffffff !important; padding: 10px 12px; border-radius: 6px; border: 1px solid #e2e8f0;" bgcolor="#ffffff">${temporaryPassword}</p>
                      </div>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 32px 0; background-color: #ffffff !important;" bgcolor="#ffffff">
                      <a href="https://campusvoice.ai/login" style="display: inline-block; background-color: #1e293b !important; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" bgcolor="#1e293b">
                        Login to CampusVoice.AI →
                      </a>
                    </div>
                    
                    <!-- Notice -->
                    <div style="background-color: #fef3c7 !important; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin-top: 24px;" bgcolor="#fef3c7">
                      <p style="margin: 0; color: #92400e !important; font-size: 14px; line-height: 1.5; background-color: #fef3c7 !important;" bgcolor="#fef3c7">
                        <strong style="color: #92400e !important;">Important:</strong> You'll be prompted to change your password when you first log in. Please keep your credentials secure and do not share them.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc !important; padding: 24px 40px; border-top: 1px solid #e2e8f0;" bgcolor="#f8fafc">
                    <p style="margin: 0 0 8px 0; color: #64748b !important; font-size: 14px; text-align: center; background-color: #f8fafc !important;" bgcolor="#f8fafc">
                      Welcome to the team!
                    </p>
                    <p style="margin: 0; color: #94a3b8 !important; font-size: 12px; text-align: center; background-color: #f8fafc !important;" bgcolor="#f8fafc">
                      — The CampusVoice.AI Team
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Sub-footer -->
              <p style="margin: 24px 0 0 0; color: #94a3b8 !important; font-size: 12px; text-align: center; background-color: #f8fafc !important;" bgcolor="#f8fafc">
                This email was sent by CampusVoice.AI. If you didn't expect this invitation, please contact your administrator.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send email via Resend API directly
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

    // Log to email_nudges (server-side with service role)
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
      } else {
        console.log("Email nudge logged successfully");
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
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
