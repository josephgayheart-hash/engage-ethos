import { createFileRoute } from "@tanstack/react-router";
import AdminConsolePage from "@/pages/admin/AdminConsolePage";

export const Route = createFileRoute("/_app/_admin/admin/console")({
  component: AdminConsolePage,
});
