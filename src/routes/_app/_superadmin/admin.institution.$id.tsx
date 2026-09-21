import { createFileRoute } from "@tanstack/react-router";
import InstitutionDetailPage from "@/pages/admin/InstitutionDetailPage";

export const Route = createFileRoute("/_app/_superadmin/admin/institution/$id")({
  component: InstitutionDetailPage,
});
