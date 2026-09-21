import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAdmin } from "@/components/route-guards";

export const Route = createFileRoute("/_app/_admin")({
  component: () => (
    <RequireAdmin>
      <Outlet />
    </RequireAdmin>
  ),
});
