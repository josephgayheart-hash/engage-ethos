import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at?: string;
    bounce?: { message: string; type: string };
    click?: { link: string; timestamp: string; userAgent: string };
  };
}

// Verify Svix-style webhook signature (Resend uses Svix).
// Signature header format: "v1,<base64-sha256>" (may contain multiple space-separated entries).
async function verifySvixSignature(
  rawBody: string,
  svixId: string,
  svixTimestamp: string,
  svixSignatureHeader: string,
  signingSecret: string,
): Promise<boolean> {
  try {
    // Reject signatures older than 5 minutes (replay protection).
    const tsSec = parseInt(svixTimestamp, 10);
    if (!Number.isFinite(tsSec)) return false;
    const ageMs = Math.abs(Date.now() - tsSec * 1000);
    if (ageMs > 5 * 60 * 1000) return false;

    // Svix secret format: "whsec_<base64>". Strip the prefix if present.
    const secret = signingSecret.startsWith("whsec_") ? signingSecret.slice(6) : signingSecret;
    const keyBytes = Uint8Array.from(atob(secret), (c) => c.charCodeAt(0));

    const toSign = `${svixId}.${svixTimestamp}.${rawBody}`;
    const key = await crypto.subtle.importKey(
      "raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(toSign));
    const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));

    const provided = svixSignatureHeader.split(" ").map((p) => p.trim());
    for (const entry of provided) {
      const [version, value] = entry.split(",", 2);
      if (version === "v1" && value && value === expected) return true;
    }
    return false;
  } catch (e) {
    console.error("Svix signature verification error:", e);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ---- Signature verification ----
    const signingSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
    if (!signingSecret) {
      console.error("RESEND_WEBHOOK_SECRET is not configured; rejecting webhook.");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const svixId = req.headers.get("svix-id") || "";
    const svixTimestamp = req.headers.get("svix-timestamp") || "";
    const svixSignature = req.headers.get("svix-signature") || "";
    const rawBody = await req.text();
    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response(JSON.stringify({ error: "Missing signature headers" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const ok = await verifySvixSignature(rawBody, svixId, svixTimestamp, svixSignature, signingSecret);
    if (!ok) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event: ResendWebhookEvent = JSON.parse(rawBody);
    console.log("Resend webhook received:", event.type, event.data?.email_id);

    const emailId = event.data?.email_id;
    if (!emailId) {
      console.log("No email_id in webhook payload");
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const eventTypeMap: Record<string, { status: string; field: string }> = {
      "email.sent": { status: "sent", field: "sent_at" },
      "email.delivered": { status: "delivered", field: "delivered_at" },
      "email.opened": { status: "opened", field: "opened_at" },
      "email.clicked": { status: "clicked", field: "clicked_at" },
      "email.bounced": { status: "bounced", field: "bounced_at" },
      "email.complained": { status: "complained", field: "bounced_at" },
    };

    const mapping = eventTypeMap[event.type];
    if (!mapping) {
      console.log("Unhandled event type:", event.type);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const timestamp = new Date().toISOString();

    // --- Try email_nudges first ---
    const { data: nudge, error: findError } = await supabase
      .from("email_nudges")
      .select("id, events")
      .eq("provider", "resend")
      .eq("provider_message_id", emailId)
      .maybeSingle();

    if (findError) {
      console.error("Error finding email nudge:", findError);
    }

    if (nudge) {
      const existingEvents = (nudge.events as Record<string, any>) || {};
      const updatedEvents = { ...existingEvents, [event.type]: { timestamp, data: event.data } };
      const updateData: Record<string, any> = {
        delivery_status: mapping.status,
        last_event_at: timestamp,
        events: updatedEvents,
        [mapping.field]: timestamp,
      };

      const { error: updateError } = await supabase
        .from("email_nudges")
        .update(updateData)
        .eq("id", nudge.id);

      if (updateError) {
        console.error("Error updating email nudge:", updateError);
      } else {
        console.log(`Updated email_nudges ${emailId} with status: ${mapping.status}`);
      }

      return new Response(JSON.stringify({ received: true, updated: true, table: "email_nudges", status: mapping.status }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Fallback: try outreach_history ---
    const { data: outreach, error: outreachFindError } = await supabase
      .from("outreach_history")
      .select("id, events")
      .eq("provider", "resend")
      .eq("provider_message_id", emailId)
      .maybeSingle();

    if (outreachFindError) {
      console.error("Error finding outreach_history:", outreachFindError);
    }

    if (outreach) {
      const existingEvents = (outreach.events as Record<string, any>) || {};
      const updatedEvents = { ...existingEvents, [event.type]: { timestamp, data: event.data } };
      const updateData: Record<string, any> = {
        delivery_status: mapping.status,
        last_event_at: timestamp,
        events: updatedEvents,
        [mapping.field]: timestamp,
      };

      const { error: updateError } = await supabase
        .from("outreach_history")
        .update(updateData)
        .eq("id", outreach.id);

      if (updateError) {
        console.error("Error updating outreach_history:", updateError);
      } else {
        console.log(`Updated outreach_history ${emailId} with status: ${mapping.status}`);
      }

      return new Response(JSON.stringify({ received: true, updated: true, table: "outreach_history", status: mapping.status }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("No matching record found for:", emailId);
    return new Response(JSON.stringify({ received: true, matched: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error processing Resend webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
