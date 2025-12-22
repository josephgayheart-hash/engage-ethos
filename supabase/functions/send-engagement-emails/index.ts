import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY secret");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email templates
const getInviteReminderHtml = (firstName: string, institutionName: string, daysAgo: number) => `
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
                    <img src="https://yeuwpuzbccqnqdlnjhfm.supabase.co/storage/v1/object/public/institution-logos/campusvoice-logo.png" alt="CampusVoice.AI" style="height: 40px; width: auto;" />
                  </td>
                </tr>
              </table>
              <h1 style="margin: 20px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 600;">Your Account is Waiting!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff;">
              <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Hi ${firstName},</p>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Your <strong style="color: #1e293b;">CampusVoice.AI</strong> account was created ${daysAgo === 2 ? '2 days' : '5 days'} ago, but we haven't seen you log in yet! 
                <strong style="color: #1e293b;">${institutionName}</strong> has given you access to powerful AI-powered communication tools.
              </p>
              
              <!-- What you can do box -->
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid #22c55e;">
                <h3 style="margin: 0 0 16px 0; color: #166534; font-size: 16px; font-weight: 600;">Here's what you can do:</h3>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0; color: #166534; font-size: 15px;">✨ <strong>Build AI-powered messages</strong> in seconds</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #166534; font-size: 15px;">📊 <strong>Score your content</strong> for effectiveness</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #166534; font-size: 15px;">📚 <strong>Access your institution's</strong> template library</td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://campusvoice.ai/login" style="display: inline-block; background-color: #1e293b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                  Login Now →
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.5; text-align: center;">
                If you've forgotten your password, you can request a new one on the login page.
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

const getWeMissYouHtml = (firstName: string, institutionName: string, daysSinceLogin: number) => `
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
                    <img src="https://yeuwpuzbccqnqdlnjhfm.supabase.co/storage/v1/object/public/institution-logos/campusvoice-logo.png" alt="CampusVoice.AI" style="height: 40px; width: auto;" />
                  </td>
                </tr>
              </table>
              <h1 style="margin: 20px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 600;">We Miss You! 👋</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff;">
              <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Hi ${firstName},</p>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                It's been ${daysSinceLogin} days since you last visited <strong style="color: #1e293b;">CampusVoice.AI</strong>. 
                We'd love to help you create some great content for <strong style="color: #1e293b;">${institutionName}</strong>!
              </p>
              
              <!-- Ideas box -->
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid #3b82f6;">
                <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 16px; font-weight: 600;">Quick ideas to get you started:</h3>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 10px 0; color: #1e40af; font-size: 15px;">
                      <strong>🎯 Draft a quick message</strong><br/>
                      <span style="color: #3b82f6; font-size: 14px;">Try the Message Builder for your next email</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #1e40af; font-size: 15px;">
                      <strong>📝 Score that draft</strong><br/>
                      <span style="color: #3b82f6; font-size: 14px;">Paste any content into the Evaluator to get instant feedback</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #1e40af; font-size: 15px;">
                      <strong>📚 Browse your library</strong><br/>
                      <span style="color: #3b82f6; font-size: 14px;">Check out saved templates from your team</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #1e40af; font-size: 15px;">
                      <strong>💬 Try the Playground</strong><br/>
                      <span style="color: #3b82f6; font-size: 14px;">Chat with AI about your communication challenges</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://campusvoice.ai/login" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                  Jump Back In →
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.5; text-align: center;">
                We're always adding new features based on your feedback!
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
    console.log("Starting engagement email check...");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const now = new Date();
    const results = { inviteReminders: 0, weMissYou: 0, errors: [] as string[] };

    // 1. Find invited users who haven't logged in (48 hours or 5 days old)
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const { data: invitedUsers, error: invitedError } = await supabase
      .from("profiles")
      .select(`
        id, email, first_name, last_name, status, created_at, last_login_at, tenant_id,
        tenants!inner(institution_name)
      `)
      .eq("status", "invited")
      .is("last_login_at", null)
      .lt("created_at", twoDaysAgo.toISOString());

    if (invitedError) {
      console.error("Error fetching invited users:", invitedError);
    } else if (invitedUsers) {
      console.log(`Found ${invitedUsers.length} invited users to check`);

      for (const user of invitedUsers) {
        const createdAt = new Date(user.created_at);
        const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        let shouldSend = false;
        let reminderNumber = 0;
        
        if (hoursSinceCreated >= 48 && hoursSinceCreated < 120) {
          reminderNumber = 1;
        } else if (hoursSinceCreated >= 120) {
          reminderNumber = 2;
        }

        if (reminderNumber > 0) {
          const { data: existingNudges } = await supabase
            .from("email_nudges")
            .select("email_count")
            .eq("user_id", user.id)
            .eq("nudge_type", "invite_reminder");

          const nudgeCount = existingNudges?.[0]?.email_count || 0;
          shouldSend = nudgeCount < reminderNumber;
        }

        if (shouldSend) {
          const daysAgo = reminderNumber === 1 ? 2 : 5;
          const institutionName = (user.tenants as any)?.institution_name || "your institution";
          const subject = "Your CampusVoice.AI account is waiting!";
          
          try {
            const response = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: "CampusVoice.AI <noreply@campusvoice.ai>",
                to: [user.email],
                subject,
                html: getInviteReminderHtml(user.first_name, institutionName, daysAgo),
              }),
            });

            const responseData = await response.json();

            if (response.ok) {
              const { data: existingNudge } = await supabase
                .from("email_nudges")
                .select("id, email_count")
                .eq("user_id", user.id)
                .eq("nudge_type", "invite_reminder")
                .maybeSingle();

              if (existingNudge) {
                await supabase
                  .from("email_nudges")
                  .update({ 
                    email_count: existingNudge.email_count + 1, 
                    sent_at: now.toISOString(),
                    provider: "resend",
                    provider_message_id: responseData.id,
                    delivery_status: "sent",
                  })
                  .eq("id", existingNudge.id);
              } else {
                await supabase.from("email_nudges").insert({
                  user_id: user.id,
                  tenant_id: user.tenant_id,
                  nudge_type: "invite_reminder",
                  email_type: "invite_reminder",
                  email_count: 1,
                  subject: subject,
                  recipient_name: `${user.first_name} ${user.last_name}`,
                  recipient_email: user.email,
                  provider: "resend",
                  provider_message_id: responseData.id,
                  delivery_status: "sent",
                  metadata: { institution_name: institutionName, reminder_number: reminderNumber },
                });
              }

              results.inviteReminders++;
              console.log(`Sent invite reminder ${reminderNumber} to ${user.email}`);
            } else {
              results.errors.push(`Failed to send to ${user.email}: ${responseData.message}`);
            }
          } catch (err: any) {
            results.errors.push(`Error sending to ${user.email}: ${err.message}`);
          }
        }
      }
    }

    // 2. Find active users who haven't logged in for 5+ days
    const { data: inactiveUsers, error: inactiveError } = await supabase
      .from("profiles")
      .select(`
        id, email, first_name, last_name, status, last_login_at, tenant_id,
        tenants!inner(institution_name)
      `)
      .eq("status", "active")
      .not("last_login_at", "is", null)
      .lt("last_login_at", fiveDaysAgo.toISOString());

    if (inactiveError) {
      console.error("Error fetching inactive users:", inactiveError);
    } else if (inactiveUsers) {
      console.log(`Found ${inactiveUsers.length} inactive users to check`);

      for (const user of inactiveUsers) {
        const lastLogin = new Date(user.last_login_at!);
        const daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const { data: recentNudge } = await supabase
          .from("email_nudges")
          .select("sent_at")
          .eq("user_id", user.id)
          .eq("nudge_type", "we_miss_you")
          .gt("sent_at", fourteenDaysAgo.toISOString())
          .maybeSingle();

        if (!recentNudge) {
          const institutionName = (user.tenants as any)?.institution_name || "your institution";
          const subject = "We miss you at CampusVoice.AI! 👋";
          
          try {
            const response = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: "CampusVoice.AI <noreply@campusvoice.ai>",
                to: [user.email],
                subject,
                html: getWeMissYouHtml(user.first_name, institutionName, daysSinceLogin),
              }),
            });

            const responseData = await response.json();

            if (response.ok) {
              const { data: existingNudge } = await supabase
                .from("email_nudges")
                .select("id, email_count")
                .eq("user_id", user.id)
                .eq("nudge_type", "we_miss_you")
                .maybeSingle();

              if (existingNudge) {
                await supabase
                  .from("email_nudges")
                  .update({ 
                    email_count: existingNudge.email_count + 1, 
                    sent_at: now.toISOString(),
                    provider: "resend",
                    provider_message_id: responseData.id,
                    delivery_status: "sent",
                  })
                  .eq("id", existingNudge.id);
              } else {
                await supabase.from("email_nudges").insert({
                  user_id: user.id,
                  tenant_id: user.tenant_id,
                  nudge_type: "we_miss_you",
                  email_type: "we_miss_you",
                  email_count: 1,
                  subject: subject,
                  recipient_name: `${user.first_name} ${user.last_name}`,
                  recipient_email: user.email,
                  provider: "resend",
                  provider_message_id: responseData.id,
                  delivery_status: "sent",
                  metadata: { institution_name: institutionName, days_since_login: daysSinceLogin },
                });
              }

              results.weMissYou++;
              console.log(`Sent "we miss you" email to ${user.email}`);
            } else {
              results.errors.push(`Failed to send to ${user.email}: ${responseData.message}`);
            }
          } catch (err: any) {
            results.errors.push(`Error sending to ${user.email}: ${err.message}`);
          }
        }
      }
    }

    console.log("Engagement email check complete:", results);

    return new Response(JSON.stringify({ success: true, ...results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-engagement-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
