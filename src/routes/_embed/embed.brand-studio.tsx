import { createFileRoute } from "@tanstack/react-router";
import BrandStudioPage from "@/pages/BrandStudioPage";

export const Route = createFileRoute("/_embed/embed/brand-studio")({
  component: BrandStudioPage,
});
