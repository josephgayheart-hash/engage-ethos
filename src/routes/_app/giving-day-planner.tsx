import { createFileRoute } from "@tanstack/react-router";
import { RequireHigherEd } from "@/components/route-guards";
import GivingDayPlannerPage from "@/pages/GivingDayPlannerPage";

export const Route = createFileRoute("/_app/giving-day-planner")({
  component: () => (
    <RequireHigherEd><GivingDayPlannerPage /></RequireHigherEd>
  ),
});
