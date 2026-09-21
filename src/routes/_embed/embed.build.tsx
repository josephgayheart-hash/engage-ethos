import { createFileRoute } from "@tanstack/react-router";
import BuildPage from "@/pages/BuildPage";

export const Route = createFileRoute("/_embed/embed/build")({
  component: BuildPage,
});
