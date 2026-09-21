import { createFileRoute } from "@tanstack/react-router";
import UniversitySettingsPage from "@/pages/UniversitySettingsPage";

export const Route = createFileRoute("/_app/organization-settings")({
  component: UniversitySettingsPage,
});
