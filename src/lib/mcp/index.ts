import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProfilesTool from "./tools/list-profiles";
import listMessagesTool from "./tools/list-messages";
import getMessageTool from "./tools/get-message";
import createMessageTool from "./tools/create-message";
import searchStoriesTool from "./tools/search-stories";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "campusvoice-ai",
  title: "CampusVoice.ai",
  version: "0.1.0",
  instructions:
    "Tools for CampusVoice.ai. Use `list_profiles` to find the user's profiles, `list_messages` and `get_message` to read their saved messages, `create_message` to save new copy into their library, and `search_stories` to pull supporting stories from the story bank. All calls act as the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProfilesTool, listMessagesTool, getMessageTool, createMessageTool, searchStoriesTool],
});
