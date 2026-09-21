import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireSuperAdmin } from "@/components/route-guards";

export const Route = createFileRoute("/_app/_superadmin")({
  component: () => (
    <RequireSuperAdmin>
      <Outlet />
    </RequireSuperAdmin>
  ),
});
