import { createFileRoute } from "@tanstack/react-router";
import LibraryFeaturePage from "@/pages/features/LibraryFeaturePage";

export const Route = createFileRoute("/features/library")({
  component: LibraryFeaturePage,
});
