import { createFileRoute } from "@tanstack/react-router";
import SharedLibrary from "@/pages/SharedLibrary";

export const Route = createFileRoute("/_app/shared-library")({
  component: SharedLibrary,
});
