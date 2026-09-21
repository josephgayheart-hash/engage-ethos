import { createFileRoute } from "@tanstack/react-router";
import BrandVoiceScorer from "@/pages/BrandVoiceScorer";

export const Route = createFileRoute("/_embed/embed/brand-voice")({
  component: BrandVoiceScorer,
});
