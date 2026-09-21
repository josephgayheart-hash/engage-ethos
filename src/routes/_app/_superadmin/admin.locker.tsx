import { createFileRoute } from "@tanstack/react-router";
import CompassLockerPage from "@/pages/admin/CompassLockerPage";

export const Route = createFileRoute("/_app/_superadmin/admin/locker")({
  component: CompassLockerPage,
});
