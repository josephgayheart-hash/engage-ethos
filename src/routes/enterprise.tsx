import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

export const Route = createFileRoute("/enterprise")({
  component: () => <Navigate to="/for-enterprise" replace />,
});
