import { createFileRoute } from "@tanstack/react-router";
import EmailPreview from "@/pages/EmailPreview";

export const Route = createFileRoute("/_app/email-preview")({
  component: EmailPreview,
});
