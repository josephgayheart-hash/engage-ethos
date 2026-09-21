import { createFileRoute } from "@tanstack/react-router";
import PersonalAIEditsPage from "@/pages/admin/PersonalAIEditsPage";

export const Route = createFileRoute("/_app/_superadmin/admin/personal-ai/edits")({
  component: PersonalAIEditsPage,
});
