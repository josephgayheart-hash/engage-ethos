import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const nudgeId = url.searchParams.get("id");
    const destination = url.searchParams.get("url");
    const linkName = url.searchParams.get("link") || "unknown";

    console.log(`Tracking click: nudge=${nudgeId}, link=${linkName}, destination=${destination}`);

    if (!destination) {
      return new Response("Missing destination URL", { status: 400 });
    }

    // Decode the destination URL
    const decodedUrl = decodeURIComponent(destination);

    // Track the click if we have a nudge ID
    if (nudgeId && nudgeId !== "undefined") {
      try {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
        
        const clickEvent = {
          link_name: linkName,
          url: decodedUrl,
          clicked_at: new Date().toISOString(),
          user_agent: req.headers.get("user-agent") || null,
        };

        // Get current nudge data
        const { data: nudge, error: fetchError } = await supabase
          .from("email_nudges")
          .select("link_clicks, clicked_at")
          .eq("id", nudgeId)
          .single();

        if (fetchError) {
          console.error("Error fetching nudge:", fetchError);
        } else {
          // Append click to link_clicks array
          const currentClicks = (nudge?.link_clicks as any[]) || [];
          const updatedClicks = [...currentClicks, clickEvent];

          // Update the nudge with click data
          const { error: updateError } = await supabase
            .from("email_nudges")
            .update({
              clicked_at: nudge?.clicked_at || new Date().toISOString(),
              link_clicks: updatedClicks,
              last_event_at: new Date().toISOString(),
            })
            .eq("id", nudgeId);

          if (updateError) {
            console.error("Error updating nudge:", updateError);
          } else {
            console.log(`Click tracked successfully for nudge ${nudgeId}`);
          }
        }
      } catch (dbError) {
        console.error("Database error tracking click:", dbError);
        // Don't block redirect on tracking errors
      }
    }

    // Redirect to the destination
    return new Response(null, {
      status: 302,
      headers: {
        "Location": decodedUrl,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error in track-email-click:", error);
    // On error, try to redirect anyway if we have a destination
    const url = new URL(req.url);
    const destination = url.searchParams.get("url");
    if (destination) {
      return new Response(null, {
        status: 302,
        headers: { "Location": decodeURIComponent(destination) },
      });
    }
    return new Response("Error processing request", { status: 500 });
  }
};

serve(handler);
