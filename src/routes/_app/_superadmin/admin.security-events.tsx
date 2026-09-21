import { createFileRoute } from "@tanstack/react-router";
import SecurityEventsPage from "@/pages/admin/SecurityEventsPage";

export const Route = createFileRoute("/_app/_superadmin/admin/security-events")({
  component: SecurityEventsPage,
});
