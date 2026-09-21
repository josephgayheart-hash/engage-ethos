import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

export const Route = createFileRoute("/features/brand-studio")({
  component: () => <Navigate to="/features#brand-studio" replace />,
});
