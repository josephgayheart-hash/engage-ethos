import { createFileRoute } from "@tanstack/react-router";
import ForAgenciesPage from "@/pages/agency/ForAgenciesPage";

export const Route = createFileRoute("/for-agencies")({
  component: ForAgenciesPage,
});
