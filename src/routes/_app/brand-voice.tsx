import { createFileRoute } from "@tanstack/react-router";
import BrandVoiceScorer from "@/pages/BrandVoiceScorer";

export const Route = createFileRoute("/_app/brand-voice")({
  component: BrandVoiceScorer,
});
