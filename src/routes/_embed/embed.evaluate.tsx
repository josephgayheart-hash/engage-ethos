import { createFileRoute } from "@tanstack/react-router";
import EvaluatePage from "@/pages/EvaluatePage";

export const Route = createFileRoute("/_embed/embed/evaluate")({
  component: EvaluatePage,
});
