import { createFileRoute } from "@tanstack/react-router";
import AITechnologyPage from "@/pages/admin/AITechnologyPage";

export const Route = createFileRoute("/_app/_superadmin/admin/ai-technology")({
  component: AITechnologyPage,
});
