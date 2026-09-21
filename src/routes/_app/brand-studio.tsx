import { createFileRoute } from "@tanstack/react-router";
import BrandStudioPage from "@/pages/BrandStudioPage";

export const Route = createFileRoute("/_app/brand-studio")({
  component: BrandStudioPage,
});
