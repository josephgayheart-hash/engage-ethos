import { createFileRoute } from "@tanstack/react-router";
import { PublicRoute } from "@/components/route-guards";
import LoginPage from "@/pages/LoginPage";

export const Route = createFileRoute("/login")({
  component: () => (
    <PublicRoute><LoginPage /></PublicRoute>
  ),
});
