import { createFileRoute } from "@tanstack/react-router";
import { RequireHigherEd } from "@/components/route-guards";
import StewardshipReportPage from "@/pages/StewardshipReportPage";

export const Route = createFileRoute("/_app/stewardship-report")({
  component: () => (
    <RequireHigherEd><StewardshipReportPage /></RequireHigherEd>
  ),
});
