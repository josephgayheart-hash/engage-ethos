import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

export const Route = createFileRoute("/features/evaluate")({
  component: () => <Navigate to="/features#evaluate" replace />,
});
