import { createFileRoute } from "@tanstack/react-router";
import JourneyDesignerFeaturePage from "@/pages/features/JourneyDesignerFeaturePage";

export const Route = createFileRoute("/features/journey-designer")({
  component: JourneyDesignerFeaturePage,
});
