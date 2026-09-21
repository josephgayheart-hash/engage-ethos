import { createFileRoute } from "@tanstack/react-router";
import WebContentAnalyzerPage from "@/pages/WebContentAnalyzerPage";

export const Route = createFileRoute("/_embed/embed/web-analyzer")({
  component: WebContentAnalyzerPage,
});
