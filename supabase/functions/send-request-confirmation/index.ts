import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, institutionName }: RequestConfirmationEmailRequest = await req.json();

    console.log(`Sending request confirmation email to ${email}`);

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
            .status-box { background-color: #f0fdf4 !important; }
            .details-box { background-color: #f1f5f9 !important; }
            .content-area { background-color: #ffffff !important; }
            .footer-area { background-color: #f8fafc !important; }
            body, table, td, div, p, a, span, h1, h2, h3 { 
              -webkit-text-fill-color: inherit !important;
            }
            .dark-text { color: #1e293b !important; -webkit-text-fill-color: #1e293b !important; }
            .muted-text { color: #475569 !important; -webkit-text-fill-color: #475569 !important; }
            .white-text { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
            .green-text { color: #166534 !important; -webkit-text-fill-color: #166534 !important; }
          }
        </style>
      </head>
      <body class="body" style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
        <div style="display: none; max-height: 0; overflow: hidden;">Your UPlaybook.AI access request has been received</div>
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
                          <img class="logo-img" src="https://uplaybook.ai/uplaybook-logo.png" alt="UPlaybook.AI" style="height: 50px; width: auto; display: block; background-color: #ffffff !important;" />
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin: 24px 0 0 0; color: #ffffff !important; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; background-color: #1a2036 !important; -webkit-text-fill-color: #ffffff !important;" bgcolor="#1a2036">Request Received</h1>
                    <p style="margin: 8px 0 0 0; color: #94a3b8 !important; font-size: 14px; font-weight: 600; background-color: #1a2036 !important; -webkit-text-fill-color: #94a3b8 !important;" bgcolor="#1a2036">We're reviewing your access request</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px; background-color: #ffffff !important;" bgcolor="#ffffff">
                    <h2 style="margin: 0 0 16px 0; color: #1e293b !important; font-size: 24px; font-weight: 600; background-color: #ffffff !important;" bgcolor="#ffffff">Hi ${firstName},</h2>
                    <p style="margin: 0 0 24px 0; color: #475569 !important; font-size: 16px; line-height: 1.6; background-color: #ffffff !important;" bgcolor="#ffffff">
                      Thank you for your interest in <strong style="color: #1e293b !important;">UPlaybook.AI</strong>! We've received your access request for <strong style="color: #1e293b !important;">${institutionName}</strong>.
                    </p>
                    
                    <!-- Status Box -->
                    <div style="background-color: #f0fdf4 !important; border-left: 4px solid #22c55e; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0;" bgcolor="#f0fdf4">
                      <p style="margin: 0; color: #166534 !important; font-size: 14px; line-height: 1.5; background-color: #f0fdf4 !important;" bgcolor="#f0fdf4">
                        <strong style="color: #166534 !important;">What happens next?</strong><br />
                        An administrator will review your request and you'll receive an email with your login credentials once approved.
                      </p>
                    </div>
                    
                    <!-- Request Details -->
                    <div style="background-color: #f1f5f9 !important; border-radius: 8px; padding: 24px; margin: 24px 0;" bgcolor="#f1f5f9">
                      <h3 style="margin: 0 0 16px 0; color: #1e293b !important; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background-color: #f1f5f9 !important;" bgcolor="#f1f5f9">Your Request Details</h3>
                      
                      <div style="margin-bottom: 12px;">
                        <p style="margin: 0 0 4px 0; color: #64748b !important; font-size: 12px; font-weight: 500; text-transform: uppercase; background-color: #f1f5f9 !important;" bgcolor="#f1f5f9">Name</p>
                        <p style="margin: 0; color: #1e293b !important; font-size: 16px; background-color: #f1f5f9 !important;" bgcolor="#f1f5f9">${firstName} ${lastName}</p>
                      </div>
                      
                      <div style="margin-bottom: 12px;">
                        <p style="margin: 0 0 4px 0; color: #64748b !important; font-size: 12px; font-weight: 500; text-transform: uppercase; background-color: #f1f5f9 !important;" bgcolor="#f1f5f9">Email</p>
                        <p style="margin: 0; color: #1e293b !important; font-size: 16px; background-color: #f1f5f9 !important;" bgcolor="#f1f5f9">${email}</p>
                      </div>
                      
                      <div>
                        <p style="margin: 0 0 4px 0; color: #64748b !important; font-size: 12px; font-weight: 500; text-transform: uppercase; background-color: #f1f5f9 !important;" bgcolor="#f1f5f9">Institution</p>
                        <p style="margin: 0; color: #1e293b !important; font-size: 16px; background-color: #f1f5f9 !important;" bgcolor="#f1f5f9">${institutionName}</p>
                      </div>
                    </div>
                    
                    <p style="margin: 24px 0 0 0; color: #475569 !important; font-size: 14px; line-height: 1.6; background-color: #ffffff !important;" bgcolor="#ffffff">
                      If you have any questions, please contact your institution's administrator.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc !important; padding: 24px 40px; border-top: 1px solid #e2e8f0;" bgcolor="#f8fafc">
                    <p style="margin: 0 0 8px 0; color: #64748b !important; font-size: 14px; text-align: center; background-color: #f8fafc !important;" bgcolor="#f8fafc">
                      Thank you for your patience!
                    </p>
                    <p style="margin: 0; color: #94a3b8 !important; font-size: 12px; text-align: center; background-color: #f8fafc !important;" bgcolor="#f8fafc">
                      — The UPlaybook.AI Team
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Sub-footer -->
              <p style="margin: 24px 0 0 0; color: #94a3b8 !important; font-size: 12px; text-align: center; background-color: #f8fafc !important;" bgcolor="#f8fafc">
                This email was sent by UPlaybook.AI. If you didn't submit this request, please disregard this message.
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
        subject: "UPlaybook.AI - Access Request Received",
        html: htmlContent,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Request confirmation email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, ...responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-request-confirmation function:", error);
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
