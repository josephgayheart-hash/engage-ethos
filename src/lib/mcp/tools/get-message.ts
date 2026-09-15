import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_message",
  title: "Get a saved message",
  description: "Fetch the full content and metadata of one saved message by its ID.",
  inputSchema: {
    id: z.string().uuid().describe("The message ID."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("personal_messages")
      .select(
        "id, title, content, channel, channels, channel_drafts, audience, cohort, tone, goal, moment, notes, approved, institutional_profile_id, created_at, updated_at",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "No message found with that ID." }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { message: data },
    };
  },
});
