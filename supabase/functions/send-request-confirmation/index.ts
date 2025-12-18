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
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <!-- Logo Header -->
                <tr>
                  <td style="background-color: #ffffff; padding: 32px 40px 16px 40px; text-align: center;">
                    <img src="https://uplaybook.ai/uplaybook-logo.png" alt="UPlaybook.AI" style="height: 60px; width: auto;" />
                  </td>
                </tr>
                
                <!-- Header Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 24px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Request Received</h1>
                    <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">We're reviewing your access request</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 24px; font-weight: 600;">Hi ${firstName},</h2>
                    <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                      Thank you for your interest in <strong>UPlaybook.AI</strong>! We've received your access request for <strong>${institutionName}</strong>.
                    </p>
                    
                    <!-- Status Box -->
                    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                      <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.5;">
                        <strong>What happens next?</strong><br />
                        An administrator will review your request and you'll receive an email with your login credentials once approved.
                      </p>
                    </div>
                    
                    <!-- Request Details -->
                    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 24px; margin: 24px 0;">
                      <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Request Details</h3>
                      
                      <div style="margin-bottom: 12px;">
                        <p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase;">Name</p>
                        <p style="margin: 0; color: #1e293b; font-size: 16px;">${firstName} ${lastName}</p>
                      </div>
                      
                      <div style="margin-bottom: 12px;">
                        <p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase;">Email</p>
                        <p style="margin: 0; color: #1e293b; font-size: 16px;">${email}</p>
                      </div>
                      
                      <div>
                        <p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase;">Institution</p>
                        <p style="margin: 0; color: #1e293b; font-size: 16px;">${institutionName}</p>
                      </div>
                    </div>
                    
                    <p style="margin: 24px 0 0 0; color: #475569; font-size: 14px; line-height: 1.6;">
                      If you have any questions, please contact your institution's administrator.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; text-align: center;">
                      Thank you for your patience!
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                      — The UPlaybook.AI Team
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Sub-footer -->
              <p style="margin: 24px 0 0 0; color: #94a3b8; font-size: 12px; text-align: center;">
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
