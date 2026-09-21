import { createFileRoute } from "@tanstack/react-router";
import QADiagnosticsPage from "@/pages/admin/QADiagnosticsPage";

export const Route = createFileRoute("/_app/_superadmin/admin/qa")({
  component: QADiagnosticsPage,
});
