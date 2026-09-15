import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_message",
  title: "Save a message",
  description:
    "Save a new message for the signed-in user so it appears in their personal library in the app.",
  inputSchema: {
    title: z.string().trim().min(1).max(200).describe("Short title for the message."),
    content: z.string().trim().min(1).describe("The message body."),
    channel: z.string().trim().min(1).optional().describe("Channel, e.g. email, social, letter."),
    audience: z.string().trim().min(1).optional().describe("Intended audience."),
    tone: z.string().trim().min(1).optional().describe("Tone of voice."),
    profile_id: z.string().uuid().optional().describe("Profile this message belongs to."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, content, channel, audience, tone, profile_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("personal_messages")
      .insert({
        user_id: ctx.getUserId(),
        title,
        content,
        channel: channel ?? null,
        audience: audience ?? null,
        tone: tone ?? null,
        institutional_profile_id: profile_id ?? null,
        source: "mcp",
      })
      .select("id, title, channel, created_at")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Saved "${title}" (id ${data?.id}).` }],
      structuredContent: { message: data },
    };
  },
});
