import { createFileRoute } from "@tanstack/react-router";
import ContentDNAPage from "@/pages/admin/ContentDNAPage";

export const Route = createFileRoute("/_app/content-dna")({
  component: ContentDNAPage,
});
