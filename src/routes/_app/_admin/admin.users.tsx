import { createFileRoute } from "@tanstack/react-router";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";

export const Route = createFileRoute("/_app/_admin/admin/users")({
  component: AdminUsersPage,
});
