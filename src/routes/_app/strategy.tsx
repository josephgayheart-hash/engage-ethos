import { createFileRoute } from "@tanstack/react-router";
import StrategyPage from "@/pages/StrategyPage";

export const Route = createFileRoute("/_app/strategy")({
  component: StrategyPage,
});
