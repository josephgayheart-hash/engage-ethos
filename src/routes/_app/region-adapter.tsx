import { createFileRoute } from "@tanstack/react-router";
import RegionAdapterPage from "@/pages/RegionAdapterPage";

export const Route = createFileRoute("/_app/region-adapter")({
  component: RegionAdapterPage,
});
