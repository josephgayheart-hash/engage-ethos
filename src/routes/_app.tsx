import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth, RequireFullApp } from "@/components/route-guards";
import { AppLayout } from "@/components/app-shell/AppLayout";

export const Route = createFileRoute("/_app")({
  component: () => (
    <RequireAuth>
      <RequireFullApp>
        <AppLayout />
      </RequireFullApp>
    </RequireAuth>
  ),
});
