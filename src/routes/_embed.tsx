import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/route-guards";
import { EmbedLayout } from "@/components/app-shell/EmbedLayout";

export const Route = createFileRoute("/_embed")({
  component: () => (
    <RequireAuth>
      <EmbedLayout />
    </RequireAuth>
  ),
});
