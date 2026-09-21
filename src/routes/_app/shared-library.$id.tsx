import { createFileRoute } from "@tanstack/react-router";
import TemplateDetailPage from "@/pages/TemplateDetailPage";

export const Route = createFileRoute("/_app/shared-library/$id")({
  component: TemplateDetailPage,
});
