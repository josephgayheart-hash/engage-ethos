import { createFileRoute } from "@tanstack/react-router";
import AgencyClientsPage from "@/pages/agency/AgencyClientsPage";

export const Route = createFileRoute("/_app/agency/clients")({
  component: AgencyClientsPage,
});
