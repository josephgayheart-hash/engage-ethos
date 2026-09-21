import { createFileRoute } from "@tanstack/react-router";
import ForEnterprisePage from "@/pages/ForEnterprisePage";

export const Route = createFileRoute("/for-enterprise")({
  component: ForEnterprisePage,
});
