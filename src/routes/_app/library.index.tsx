import { createFileRoute } from "@tanstack/react-router";
import PersonalLibrary from "@/pages/PersonalLibrary";

export const Route = createFileRoute("/_app/library")({
  component: PersonalLibrary,
});
