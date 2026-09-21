import { createFileRoute } from "@tanstack/react-router";
import ContentDNAFeaturePage from "@/pages/features/ContentDNAFeaturePage";

export const Route = createFileRoute("/features/content-dna")({
  component: ContentDNAFeaturePage,
});
