import { createFileRoute } from "@tanstack/react-router";
import { RequireApprover } from "@/components/route-guards";
import ApprovalsPage from "@/pages/ApprovalsPage";

export const Route = createFileRoute("/_app/approvals")({
  component: () => (
    <RequireApprover><ApprovalsPage /></RequireApprover>
  ),
});
