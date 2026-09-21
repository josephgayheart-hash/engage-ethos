import { createFileRoute } from "@tanstack/react-router";
import NDALinksPage from "@/pages/admin/NDALinksPage";

export const Route = createFileRoute("/_app/_superadmin/admin/nda-links")({
  component: NDALinksPage,
});
