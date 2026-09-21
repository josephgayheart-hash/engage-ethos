import { createFileRoute } from "@tanstack/react-router";
import SalesforceCanvasGuidePage from "@/pages/docs/SalesforceCanvasGuidePage";

export const Route = createFileRoute("/docs/salesforce-canvas")({
  component: SalesforceCanvasGuidePage,
});
