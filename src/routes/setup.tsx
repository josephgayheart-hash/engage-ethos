import { createFileRoute } from "@tanstack/react-router";
import InitialSetupPage from "@/pages/InitialSetupPage";

export const Route = createFileRoute("/setup")({
  component: InitialSetupPage,
});
