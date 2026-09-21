import { createFileRoute } from "@tanstack/react-router";
import PlatformOpsPage from "@/pages/admin/PlatformOpsPage";

export const Route = createFileRoute("/_app/_superadmin/platform")({
  component: PlatformOpsPage,
});
