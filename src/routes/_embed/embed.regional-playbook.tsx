import { createFileRoute } from "@tanstack/react-router";
import RegionalPlaybookPage from "@/pages/RegionalPlaybookPage";

export const Route = createFileRoute("/_embed/embed/regional-playbook")({
  component: RegionalPlaybookPage,
});
