import { createFileRoute } from "@tanstack/react-router";
import CampaignBriefPage from "@/pages/CampaignBriefPage";

export const Route = createFileRoute("/_embed/embed/campaign-brief")({
  component: CampaignBriefPage,
});
