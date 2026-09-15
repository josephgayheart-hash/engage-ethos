import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_messages",
  title: "List saved messages",
  description:
    "List the signed-in user's saved messages, newest first. Optionally filter by profile, channel, or a text search on the title.",
  inputSchema: {
    profile_id: z.string().uuid().optional().describe("Only messages tied to this profile."),
    channel: z.string().trim().min(1).optional().describe("Only messages for this channel, e.g. email."),
    search: z.string().trim().min(1).optional().describe("Case-insensitive title search."),
    limit: z.number().int().min(1).max(50).default(20).describe("Maximum messages to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ profile_id, channel, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("personal_messages")
      .select("id, title, channel, audience, tone, approved, institutional_profile_id, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (profile_id) query = query.eq("institutional_profile_id", profile_id);
    if (channel) query = query.eq("channel", channel);
    if (search) query = query.ilike("title", `%${search}%`);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { messages: data ?? [] },
    };
  },
});
