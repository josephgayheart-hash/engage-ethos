import { createFileRoute } from "@tanstack/react-router";
import HigherEdMarketingStrategiesPage from "@/pages/guides/HigherEdMarketingStrategiesPage";

export const Route = createFileRoute("/higher-education-marketing-strategies")({
  component: HigherEdMarketingStrategiesPage,
});
