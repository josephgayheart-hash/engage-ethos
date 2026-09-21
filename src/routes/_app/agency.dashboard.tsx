import { createFileRoute } from "@tanstack/react-router";
import AgencyDashboardPage from "@/pages/agency/AgencyDashboardPage";

export const Route = createFileRoute("/_app/agency/dashboard")({
  component: AgencyDashboardPage,
});
