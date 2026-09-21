import { createFileRoute } from "@tanstack/react-router";
import OGPreviewPage from "@/pages/OGPreviewPage";

export const Route = createFileRoute("/og-preview")({
  component: OGPreviewPage,
});
