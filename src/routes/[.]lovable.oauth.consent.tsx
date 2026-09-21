import { createFileRoute } from "@tanstack/react-router";
import OAuthConsentPage from "@/pages/OAuthConsentPage";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  component: OAuthConsentPage,
});
