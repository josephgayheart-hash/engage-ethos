import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_stories",
  title: "Search story bank",
  description:
    "Search the story bank the signed-in user can access by title or narrative text, returning matching stories.",
  inputSchema: {
    query: z.string().trim().min(2).describe("Text to look for in story titles and narratives."),
    profile_id: z.string().uuid().optional().describe("Only stories tied to this profile."),
    limit: z.number().int().min(1).max(25).default(10).describe("Maximum stories to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, profile_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const safe = query.replace(/[%,]/g, " ");
    let request = supabase
      .from("story_bank")
      .select("id, title, story_type, narrative, pull_quote, themes, is_featured, profile_id, created_at")
      .or(`title.ilike.%${safe}%,narrative.ilike.%${safe}%`)
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (profile_id) request = request.eq("profile_id", profile_id);
    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { stories: data ?? [] },
    };
  },
});
