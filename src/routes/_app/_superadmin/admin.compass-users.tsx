import { createFileRoute } from "@tanstack/react-router";
import ToolOnlyUsersPage from "@/pages/admin/ToolOnlyUsersPage";

export const Route = createFileRoute("/_app/_superadmin/admin/compass-users")({
  component: ToolOnlyUsersPage,
});
