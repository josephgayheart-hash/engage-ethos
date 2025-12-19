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
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0fdf4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <!-- Logo Header -->
                <tr>
                  <td style="background-color: #ffffff; padding: 32px 40px 16px 40px; text-align: center;">
                    <img src="https://uplaybook.ai/uplaybook-logo.png" alt="UPlaybook.AI" style="height: 60px; width: auto;" />
                  </td>
                </tr>
                
                <!-- Success Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 40px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">You're Approved!</h1>
                    <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 16px;">Welcome to the UPlaybook.AI community</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 24px; font-weight: 600;">Great news, ${firstName}!</h2>
                    <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.7;">
                      Your request to join <strong style="color: #059669;">${institutionName}</strong> on UPlaybook.AI has been <strong style="color: #059669;">approved</strong>! 
                      We're thrilled to have you as part of our growing community of communication professionals.
                    </p>
                    
                    <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.7;">
                      You've been set up as a <strong>${roleDisplayName}</strong>. Below are your login credentials to get started right away.
                    </p>
                    
                    <!-- Credentials Box -->
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 28px; margin: 28px 0; border: 1px solid #a7f3d0;">
                      <h3 style="margin: 0 0 20px 0; color: #065f46; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center;">
                        <span style="margin-right: 8px;">🔐</span> Your Login Credentials
                      </h3>
                      
                      <div style="margin-bottom: 16px;">
                        <p style="margin: 0 0 6px 0; color: #047857; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</p>
                        <p style="margin: 0; color: #065f46; font-size: 16px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; background-color: #ffffff; padding: 12px 14px; border-radius: 8px; border: 2px solid #10b981;">${email}</p>
                      </div>
                      
                      <div>
                        <p style="margin: 0 0 6px 0; color: #047857; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Temporary Password</p>
                        <p style="margin: 0; color: #065f46; font-size: 16px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; background-color: #ffffff; padding: 12px 14px; border-radius: 8px; border: 2px solid #10b981;">${temporaryPassword}</p>
                      </div>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 36px 0;">
                      <a href="https://uplaybook.ai/login" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.4); transition: all 0.2s;">
                        🚀 Start Using UPlaybook.AI
                      </a>
                    </div>
                    
                    <!-- What's Next Section -->
                    <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-top: 28px;">
                      <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 16px; font-weight: 600;">✨ What's next?</h3>
                      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                        <li>Log in with your credentials above</li>
                        <li>Set your permanent password when prompted</li>
                        <li>Explore the AI-powered message builder and evaluator</li>
                        <li>Create your first communication campaign!</li>
                      </ul>
                    </div>
                    
                    <!-- Security Notice -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-top: 24px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                        <strong>🔒 Security tip:</strong> You'll be prompted to change your password on first login. Please keep your credentials secure and don't share them with anyone.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 28px 40px; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 12px 0; color: #475569; font-size: 15px; text-align: center; font-weight: 500;">
                      🌟 We're excited to have you on board!
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">
                      Questions? Just reply to this email and our team will help you out.
                    </p>
                    <p style="margin: 16px 0 0 0; color: #94a3b8; font-size: 12px; text-align: center;">
                      — The UPlaybook.AI Team 💙
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Sub-footer -->
              <p style="margin: 24px 0 0 0; color: #64748b; font-size: 12px; text-align: center;">
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
        subject: `🎉 You're Approved! Welcome to UPlaybook.AI - ${institutionName}`,
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
