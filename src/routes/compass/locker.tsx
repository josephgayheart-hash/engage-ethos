import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/route-guards";
import CompassLockerPage from "@/pages/admin/CompassLockerPage";

export const Route = createFileRoute("/compass/locker")({
  component: () => (
    <RequireAuth><CompassLockerPage /></RequireAuth>
  ),
});
