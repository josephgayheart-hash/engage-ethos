import { createFileRoute } from "@tanstack/react-router";
import CampaignBriefPage from "@/pages/CampaignBriefPage";

export const Route = createFileRoute("/_app/campaign-brief")({
  component: CampaignBriefPage,
});
