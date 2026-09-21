import { createFileRoute } from "@tanstack/react-router";
import AICopywriterFeaturePage from "@/pages/features/AICopywriterFeaturePage";

export const Route = createFileRoute("/features/ai-copywriter")({
  component: AICopywriterFeaturePage,
});
