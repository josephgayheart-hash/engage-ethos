import { createFileRoute } from "@tanstack/react-router";
import CompetitiveAnalyzerPage from "@/pages/CompetitiveAnalyzerPage";

export const Route = createFileRoute("/_app/competitive-analyzer")({
  component: CompetitiveAnalyzerPage,
});
