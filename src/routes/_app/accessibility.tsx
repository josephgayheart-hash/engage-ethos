import { createFileRoute } from "@tanstack/react-router";
import AccessibilityChecker from "@/pages/AccessibilityChecker";

export const Route = createFileRoute("/_app/accessibility")({
  component: AccessibilityChecker,
});
