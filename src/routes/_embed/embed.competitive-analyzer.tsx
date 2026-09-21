import { createFileRoute } from "@tanstack/react-router";
import CompetitiveAnalyzerPage from "@/pages/CompetitiveAnalyzerPage";

export const Route = createFileRoute("/_embed/embed/competitive-analyzer")({
  component: CompetitiveAnalyzerPage,
});
