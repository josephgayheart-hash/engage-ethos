import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DemoRequestBody {
  name: string;
  email: string;
  institution: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[send-demo-request] Received request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error("[send-demo-request] Missing RESEND_API_KEY");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { name, email, institution, message }: DemoRequestBody = await req.json();

    console.log(`[send-demo-request] Demo request from: ${name} (${email}) at ${institution}`);

    // Validate required fields
    if (!name || !email || !institution) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client to fetch super admin emails
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get all super admin user IDs
    const { data: superAdminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "super_admin");

    if (rolesError) {
      console.error("[send-demo-request] Error fetching super admin roles:", rolesError);
      throw rolesError;
    }

    if (!superAdminRoles || superAdminRoles.length === 0) {
      console.log("[send-demo-request] No super admins found");
      return new Response(
        JSON.stringify({ success: true, message: "Request logged but no admins to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get super admin email addresses from profiles
    const superAdminIds = superAdminRoles.map((r) => r.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("email, first_name")
      .in("id", superAdminIds)
      .eq("status", "active");

    if (profilesError) {
      console.error("[send-demo-request] Error fetching profiles:", profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      console.log("[send-demo-request] No active super admin profiles found");
      return new Response(
        JSON.stringify({ success: true, message: "Request logged but no active admins to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Always include sales@campusvoice.ai as primary recipient
    const adminEmails = [...new Set(["sales@campusvoice.ai", ...profiles.map((p) => p.email)])];
    console.log(`[send-demo-request] Notifying ${adminEmails.length} recipient(s)`);

    // Format the email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Demo Request</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1F2A44; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📬 New Demo Request</h1>
        </div>
        
        <div style="background: white; padding: 32px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 16px 16px;">
          <p style="margin-top: 0;">Someone is interested in learning more about CampusVoice.AI!</p>
          
          <div style="background: #F9FAFB; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6B7280; width: 120px;">Name:</td>
                <td style="padding: 8px 0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6B7280;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #7C3AED;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6B7280;">Institution:</td>
                <td style="padding: 8px 0;">${institution}</td>
              </tr>
              ${message ? `
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6B7280; vertical-align: top;">Message:</td>
                <td style="padding: 8px 0;">${message}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 24px;">
            <a href="mailto:${email}?subject=CampusVoice.AI%20Demo%20Request%20Follow-up&body=Hi%20${encodeURIComponent(name)}%2C%0A%0AThank%20you%20for%20your%20interest%20in%20CampusVoice.AI!%20I'd%20love%20to%20schedule%20a%20demo%20with%20you.%0A%0A" 
               style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Reply to ${name}
            </a>
          </div>
          
          <p style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF; text-align: center;">
            This notification was sent from CampusVoice.AI Demo Request Form
          </p>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CampusVoice.AI <noreply@campusvoice.ai>",
        to: adminEmails,
        subject: `🎯 Demo Request: ${name} from ${institution}`,
        html: emailHtml,
        reply_to: email,
      }),
    });

    const emailResult = await response.json();

    if (!response.ok) {
      console.error("[send-demo-request] Email send failed:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("[send-demo-request] Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, message: "Demo request sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("[send-demo-request] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
