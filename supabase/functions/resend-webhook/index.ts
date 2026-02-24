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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const event: ResendWebhookEvent = await req.json();
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
