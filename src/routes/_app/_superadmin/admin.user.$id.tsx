import { createFileRoute } from "@tanstack/react-router";
import UserDetailPage from "@/pages/admin/UserDetailPage";

export const Route = createFileRoute("/_app/_superadmin/admin/user/$id")({
  component: UserDetailPage,
});
