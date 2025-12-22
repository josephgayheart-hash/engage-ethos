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

const logoUrl = "https://yeuwpuzbccqnqdlnjhfm.supabase.co/storage/v1/object/public/brand-assets/campusvoice-email-logo.png";

const getInviteReminderHtml = (firstName: string, institutionName: string, daysAgo: number) => `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif"><div style="background:#1a2036;padding:24px;text-align:center;border-radius:8px 8px 0 0"><table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td style="background:#fff;padding:10px 14px;border-radius:6px"><img src="${logoUrl}" alt="CampusVoice.AI" style="height:36px"/></td></tr></table><h1 style="margin:16px 0 0;color:#fff;font-size:20px">Your Account is Waiting!</h1></div><div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none"><p style="margin:0 0 14px;color:#1e293b;font-size:16px;font-weight:600">Hi ${firstName},</p><p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.5">Your CampusVoice.AI account was created ${daysAgo} days ago, but we haven't seen you log in yet! <strong>${institutionName}</strong> has given you access.</p><div style="background:#f0fdf4;border-radius:6px;padding:16px;margin:16px 0;border-left:3px solid #22c55e"><p style="margin:0 0 10px;color:#166534;font-size:13px;font-weight:600">Here's what you can do:</p><p style="margin:0;color:#166534;font-size:13px;line-height:1.6">Build AI-powered messages, score your content, and access templates.</p></div><div style="text-align:center;margin:20px 0"><a href="https://campusvoice.ai/login" style="display:inline-block;background:#1e293b;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">Login Now</a></div><p style="margin:16px 0 0;color:#64748b;font-size:12px;text-align:center">Forgot your password? Request a new one on the login page.</p></div><div style="background:#f8fafc;padding:16px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;text-align:center"><p style="margin:0;color:#94a3b8;font-size:11px">— The CampusVoice.AI Team</p></div></div>`;

const getWeMissYouHtml = (firstName: string, institutionName: string, daysSinceLogin: number) => `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif"><div style="background:#1a2036;padding:24px;text-align:center;border-radius:8px 8px 0 0"><table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td style="background:#fff;padding:10px 14px;border-radius:6px"><img src="${logoUrl}" alt="CampusVoice.AI" style="height:36px"/></td></tr></table><h1 style="margin:16px 0 0;color:#fff;font-size:20px">We Miss You!</h1></div><div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none"><p style="margin:0 0 14px;color:#1e293b;font-size:16px;font-weight:600">Hi ${firstName},</p><p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.5">It's been ${daysSinceLogin} days since you visited CampusVoice.AI. We'd love to help you create great content for <strong>${institutionName}</strong>!</p><div style="background:#eff6ff;border-radius:6px;padding:16px;margin:16px 0;border-left:3px solid #3b82f6"><p style="margin:0 0 10px;color:#1e40af;font-size:13px;font-weight:600">Quick ideas to get started:</p><p style="margin:0;color:#1e40af;font-size:13px;line-height:1.6">Draft a message, score your content, browse templates, or try the Playground.</p></div><div style="text-align:center;margin:20px 0"><a href="https://campusvoice.ai/login" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">Jump Back In</a></div><p style="margin:16px 0 0;color:#64748b;font-size:12px;text-align:center">We're always adding new features based on your feedback!</p></div><div style="background:#f8fafc;padding:16px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;text-align:center"><p style="margin:0;color:#94a3b8;font-size:11px">— The CampusVoice.AI Team</p></div></div>`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting engagement email check...");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const now = new Date();
    const results = { inviteReminders: 0, weMissYou: 0, errors: [] as string[] };

    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const { data: invitedUsers, error: invitedError } = await supabase
      .from("profiles")
      .select(`id, email, first_name, last_name, status, created_at, last_login_at, tenant_id, tenants!inner(institution_name)`)
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
          
          if (nudgeCount < reminderNumber) {
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
                    .update({ email_count: existingNudge.email_count + 1, sent_at: now.toISOString(), provider: "resend", provider_message_id: responseData.id, delivery_status: "sent" })
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
    }

    const { data: inactiveUsers, error: inactiveError } = await supabase
      .from("profiles")
      .select(`id, email, first_name, last_name, status, last_login_at, tenant_id, tenants!inner(institution_name)`)
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
          const subject = "We miss you at CampusVoice.AI!";
          
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
                  .update({ email_count: existingNudge.email_count + 1, sent_at: now.toISOString(), provider: "resend", provider_message_id: responseData.id, delivery_status: "sent" })
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
              console.log(`Sent we miss you email to ${user.email}`);
            } else {
              results.errors.push(`Failed to send to ${user.email}: ${responseData.message}`);
            }
          } catch (err: any) {
            results.errors.push(`Error sending to ${user.email}: ${err.message}`);
          }
        }
      }
    }

    console.log(`Engagement emails complete. Invite reminders: ${results.inviteReminders}, We miss you: ${results.weMissYou}, Errors: ${results.errors.length}`);

    return new Response(JSON.stringify(results), {
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
