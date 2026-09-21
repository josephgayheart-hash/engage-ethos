import { createFileRoute } from "@tanstack/react-router";
import WebContentAnalyzerPage from "@/pages/WebContentAnalyzerPage";

export const Route = createFileRoute("/_app/web-analyzer")({
  component: WebContentAnalyzerPage,
});
