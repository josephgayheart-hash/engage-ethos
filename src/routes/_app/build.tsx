import { createFileRoute } from "@tanstack/react-router";
import BuildPage from "@/pages/BuildPage";

export const Route = createFileRoute("/_app/build")({
  component: BuildPage,
});
