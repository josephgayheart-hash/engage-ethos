import { createFileRoute } from "@tanstack/react-router";
import RegionAdapterPage from "@/pages/RegionAdapterPage";

export const Route = createFileRoute("/_embed/embed/region-adapter")({
  component: RegionAdapterPage,
});
