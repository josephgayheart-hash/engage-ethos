import { createFileRoute } from "@tanstack/react-router";
import MoreCapabilitiesPage from "@/pages/features/MoreCapabilitiesPage";

export const Route = createFileRoute("/features/")({
  component: MoreCapabilitiesPage,
});
