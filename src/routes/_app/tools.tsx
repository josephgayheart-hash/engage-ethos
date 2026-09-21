import { createFileRoute } from "@tanstack/react-router";
import ToolsPage from "@/pages/ToolsPage";

export const Route = createFileRoute("/_app/tools")({
  component: ToolsPage,
});
