import { createFileRoute } from "@tanstack/react-router";
import BetaFeedbackPage from "@/pages/BetaFeedbackPage";

export const Route = createFileRoute("/_app/feedback")({
  component: BetaFeedbackPage,
});
