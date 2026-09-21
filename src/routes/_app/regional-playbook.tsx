import { createFileRoute } from "@tanstack/react-router";
import RegionalPlaybookPage from "@/pages/RegionalPlaybookPage";

export const Route = createFileRoute("/_app/regional-playbook")({
  component: RegionalPlaybookPage,
});
