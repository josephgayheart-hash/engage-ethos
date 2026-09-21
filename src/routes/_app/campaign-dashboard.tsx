import { createFileRoute } from "@tanstack/react-router";
import CampaignDashboard from "@/pages/CampaignDashboard";

export const Route = createFileRoute("/_app/campaign-dashboard")({
  component: CampaignDashboard,
});
