import { createFileRoute } from "@tanstack/react-router";
import AdminPanel from "@/pages/AdminPanel";

export const Route = createFileRoute("/_app/_superadmin/admin/panel")({
  component: AdminPanel,
});
