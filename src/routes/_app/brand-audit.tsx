import { createFileRoute } from "@tanstack/react-router";
import BrandAuditPage from "@/pages/BrandAuditPage";

export const Route = createFileRoute("/_app/brand-audit")({
  component: BrandAuditPage,
});
