import { createFileRoute } from "@tanstack/react-router";
import CRMPage from "@/pages/CRMPage";

export const Route = createFileRoute("/_app/_superadmin/admin/crm")({
  component: CRMPage,
});
