import { createFileRoute } from "@tanstack/react-router";
import AgencyOnboardingPage from "@/pages/agency/AgencyOnboardingPage";

export const Route = createFileRoute("/_app/agency/onboarding")({
  component: AgencyOnboardingPage,
});
