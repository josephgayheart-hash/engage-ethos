import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

export const Route = createFileRoute("/features/webcrawl")({
  component: () => <Navigate to="/features#webcrawl" replace />,
});
