import { createFileRoute } from "@tanstack/react-router";
import EvaluatePage from "@/pages/EvaluatePage";

export const Route = createFileRoute("/_app/evaluate")({
  component: EvaluatePage,
});
