import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, temporaryPassword, institutionName, role }: ApprovalEmailRequest = await req.json();

    console.log(`Sending approval email to ${email} for ${institutionName}`);

    // Map role to display name
    const roleDisplayName = role === 'super_admin' 
      ? 'UPlaybook Super Admin' 
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
          u + .body { background-color: #f0fdf4 !important; }
          @media (prefers-color-scheme: dark) {
            .body-wrapper { background-color: #f0fdf4 !important; }
            .main-card { background-color: #ffffff !important; }
            .logo-area { background-color: #ffffff !important; }
            .logo-tile { background-color: #ffffff !important; }
            .logo-img { background-color: #ffffff !important; -webkit-filter: invert(0) contrast(1.22) saturate(1.22) !important; filter: invert(0) contrast(1.22) saturate(1.22) !important; opacity: 1 !important; mix-blend-mode: normal !important; }
            .credentials-box { background-color: #ecfdf5 !important; }
            .credentials-field { background-color: #ffffff !important; color: #065f46 !important; }
            .content-area { background-color: #ffffff !important; }
            .whats-next-box { background-color: #f8fafc !important; }
            .security-box { background-color: #fef3c7 !important; }
            .footer-area { background-color: #f8fafc !important; }
            body, table, td, div, p, a, span, h1, h2, h3, li, ul { 
              -webkit-text-fill-color: inherit !important;
            }
            .dark-text { color: #1e293b !important; -webkit-text-fill-color: #1e293b !important; }
            .green-text { color: #065f46 !important; -webkit-text-fill-color: #065f46 !important; }
            .muted-text { color: #475569 !important; -webkit-text-fill-color: #475569 !important; }
            .white-text { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
          }
        </style>
      </head>
      <body class="body" style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0fdf4 !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
        <div style="display: none; max-height: 0; overflow: hidden;">Your UPlaybook.AI account has been approved - login credentials inside</div>
        <table class="body-wrapper" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4 !important; padding: 40px 20px;" bgcolor="#f0fdf4">
          <tr>
            <td align="center">
              <table class="main-card" width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff !important; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden;" bgcolor="#ffffff">
                <!-- Logo Header with solid white background -->
                <tr>
                  <td class="logo-area" style="background-color: #ffffff !important; padding: 32px 40px 16px 40px; text-align: center; -webkit-background-color: #ffffff !important;" bgcolor="#ffffff">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; background-color: #ffffff !important;" bgcolor="#ffffff">
                      <tr>
                        <td class="logo-tile" style="background-color: #ffffff !important; padding: 20px 24px; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 10px 24px rgba(15, 23, 42, 0.10);" bgcolor="#ffffff">
                          <img class="logo-img" src="https://uplaybook.ai/uplaybook-logo.png" alt="UPlaybook.AI" style="height: 60px; width: auto; display: block; background-color: #ffffff !important; -webkit-filter: invert(0) contrast(1.08) saturate(1.08) !important; filter: invert(0) contrast(1.08) saturate(1.08) !important;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Success Banner -->
                <tr>
                  <td style="background-color: #059669 !important; padding: 32px 40px; text-align: center;" bgcolor="#059669">
                    <div style="font-size: 48px; margin-bottom: 12px; background-color: #059669 !important;" bgcolor="#059669">🎉</div>
                    <h1 style="margin: 0; color: #ffffff !important; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; background-color: #059669 !important; -webkit-text-fill-color: #ffffff !important;" bgcolor="#059669">You're In!</h1>
                    <p style="margin: 8px 0 0 0; color: #d1fae5 !important; font-size: 16px; font-weight: 700; background-color: #059669 !important; -webkit-text-fill-color: #d1fae5 !important;" bgcolor="#059669">Welcome to the UPlaybook.AI community</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px; background-color: #ffffff !important;" bgcolor="#ffffff">
                    <h2 style="margin: 0 0 16px 0; color: #1e293b !important; font-size: 24px; font-weight: 600; background-color: #ffffff !important;" bgcolor="#ffffff">Great news, ${firstName}!</h2>
                    <p style="margin: 0 0 24px 0; color: #475569 !important; font-size: 16px; line-height: 1.7; background-color: #ffffff !important;" bgcolor="#ffffff">
                      Your request to join <strong style="color: #059669 !important;">${institutionName}</strong> on UPlaybook.AI has been <strong style="color: #059669 !important;">approved</strong>! 
                      We're thrilled to have you as part of our growing community of communication professionals.
                    </p>
                    
                    <p style="margin: 0 0 24px 0; color: #475569 !important; font-size: 16px; line-height: 1.7; background-color: #ffffff !important;" bgcolor="#ffffff">
                      You've been set up as a <strong style="color: #1e293b !important;">${roleDisplayName}</strong>. Below are your login credentials to get started right away.
                    </p>
                    
                    <!-- Credentials Box -->
                    <div style="background-color: #ecfdf5 !important; border-radius: 12px; padding: 28px; margin: 28px 0; border: 1px solid #a7f3d0;" bgcolor="#ecfdf5">
                      <h3 style="margin: 0 0 20px 0; color: #065f46 !important; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; background-color: #ecfdf5 !important;" bgcolor="#ecfdf5">
                        🔐 Your Login Credentials
                      </h3>
                      
                      <div style="margin-bottom: 16px;">
                        <p style="margin: 0 0 6px 0; color: #047857 !important; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background-color: #ecfdf5 !important;" bgcolor="#ecfdf5">Email Address</p>
                        <p style="margin: 0; color: #065f46 !important; font-size: 16px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; background-color: #ffffff !important; padding: 12px 14px; border-radius: 8px; border: 2px solid #10b981;" bgcolor="#ffffff">${email}</p>
                      </div>
                      
                      <div>
                        <p style="margin: 0 0 6px 0; color: #047857 !important; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background-color: #ecfdf5 !important;" bgcolor="#ecfdf5">Temporary Password</p>
                        <p style="margin: 0; color: #065f46 !important; font-size: 16px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; background-color: #ffffff !important; padding: 12px 14px; border-radius: 8px; border: 2px solid #10b981;" bgcolor="#ffffff">${temporaryPassword}</p>
                      </div>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 36px 0; background-color: #ffffff !important;" bgcolor="#ffffff">
                      <a href="https://uplaybook.ai/login" style="display: inline-block; background-color: #059669 !important; color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.4);" bgcolor="#059669">
                        🚀 Start Using UPlaybook.AI
                      </a>
                    </div>
                    
                    <!-- What's Next Section -->
                    <div style="background-color: #f8fafc !important; border-radius: 12px; padding: 24px; margin-top: 28px;" bgcolor="#f8fafc">
                      <h3 style="margin: 0 0 16px 0; color: #1e293b !important; font-size: 16px; font-weight: 600; background-color: #f8fafc !important;" bgcolor="#f8fafc">✨ What's next?</h3>
                      <ul style="margin: 0; padding-left: 20px; color: #475569 !important; font-size: 14px; line-height: 1.8; background-color: #f8fafc !important;" bgcolor="#f8fafc">
                        <li style="color: #475569 !important;">Log in with your credentials above</li>
                        <li style="color: #475569 !important;">Set your permanent password when prompted</li>
                        <li style="color: #475569 !important;">Explore the AI-powered message builder and evaluator</li>
                        <li style="color: #475569 !important;">Create your first communication campaign!</li>
                      </ul>
                    </div>
                    
                    <!-- Security Notice -->
                    <div style="background-color: #fef3c7 !important; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-top: 24px;" bgcolor="#fef3c7">
                      <p style="margin: 0; color: #92400e !important; font-size: 14px; line-height: 1.5; background-color: #fef3c7 !important;" bgcolor="#fef3c7">
                        <strong style="color: #92400e !important;">🔒 Security tip:</strong> You'll be prompted to change your password on first login. Please keep your credentials secure and don't share them with anyone.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc !important; padding: 28px 40px; border-top: 1px solid #e2e8f0;" bgcolor="#f8fafc">
                    <p style="margin: 0 0 12px 0; color: #475569 !important; font-size: 15px; text-align: center; font-weight: 500; background-color: #f8fafc !important;" bgcolor="#f8fafc">
                      🌟 We're excited to have you on board!
                    </p>
                    <p style="margin: 0; color: #94a3b8 !important; font-size: 12px; text-align: center; background-color: #f8fafc !important;" bgcolor="#f8fafc">
                      — The UPlaybook.AI Team 💙
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Sub-footer -->
              <p style="margin: 24px 0 0 0; color: #64748b !important; font-size: 12px; text-align: center; background-color: #f0fdf4 !important;" bgcolor="#f0fdf4">
                This is an automated message from UPlaybook.AI confirming your account approval.
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
        from: "UPlaybook.AI <noreply@uplaybook.ai>",
        to: [email],
        subject: `🎉 You're In! Welcome to UPlaybook.AI - ${institutionName}`,
        html: htmlContent,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Approval email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, ...responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
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
