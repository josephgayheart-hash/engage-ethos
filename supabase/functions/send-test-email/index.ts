import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore - Deno npm import
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const testEmails = [
      "sales@campusvoice.ai",
      "tyler@campusvoice.ai", 
      "support@campusvoice.ai"
    ];

    const results = [];
    
    // Helper to delay between sends to avoid rate limiting
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < testEmails.length; i++) {
      const email = testEmails[i];
      
      // Wait 600ms between emails to respect Resend's 2/second rate limit
      if (i > 0) {
        await delay(600);
      }
      
      console.log(`Sending test email to ${email}...`);
      
      const emailResponse = await resend.emails.send({
        from: "CampusVoice <noreply@campusvoice.ai>",
        to: [email],
        subject: "✅ CampusVoice Email Test - Success!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Email Test Successful!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="margin-top: 0;">This is a test email to confirm that <strong>${email}</strong> is properly configured and receiving emails from CampusVoice.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #4F46E5;">📬 Email Details</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>To:</strong> ${email}</li>
                  <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>From:</strong> noreply@campusvoice.ai</li>
                  <li style="padding: 8px 0;"><strong>Sent:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</li>
                </ul>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">If you received this email, your iCloud email forwarding is working correctly! 🚀</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p>CampusVoice • AI-Powered Higher Education Communications</p>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`Email sent to ${email}:`, emailResponse);
      results.push({ email, status: 'sent', response: emailResponse });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Test emails sent to ${testEmails.length} addresses`,
        results 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending test emails:", error);
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
