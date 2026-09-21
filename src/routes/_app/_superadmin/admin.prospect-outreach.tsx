import { createFileRoute } from "@tanstack/react-router";
import ProspectOutreachPage from "@/pages/ProspectOutreachPage";

export const Route = createFileRoute("/_app/_superadmin/admin/prospect-outreach")({
  component: ProspectOutreachPage,
});
