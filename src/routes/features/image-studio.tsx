import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

export const Route = createFileRoute("/features/image-studio")({
  component: () => <Navigate to="/features#image-studio" replace />,
});
