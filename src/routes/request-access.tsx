import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

export const Route = createFileRoute("/request-access")({
  component: () => <Navigate to="/login?signup=1" replace />,
});
