import { createFileRoute } from "@tanstack/react-router";
import UniversityDashboardPage from "@/pages/UniversityDashboardPage";

export const Route = createFileRoute("/_app/_admin/institution-dashboard")({
  component: UniversityDashboardPage,
});
