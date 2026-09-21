import { createFileRoute } from "@tanstack/react-router";
import AgencyAnalyticsPage from "@/pages/agency/AgencyAnalyticsPage";

export const Route = createFileRoute("/_app/agency/analytics")({
  component: AgencyAnalyticsPage,
});
