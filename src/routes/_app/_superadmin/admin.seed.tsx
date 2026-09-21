import { createFileRoute } from "@tanstack/react-router";
import SeedDataPage from "@/pages/admin/SeedDataPage";

export const Route = createFileRoute("/_app/_superadmin/admin/seed")({
  component: SeedDataPage,
});
