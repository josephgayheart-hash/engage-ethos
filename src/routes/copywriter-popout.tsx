import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/route-guards";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { IndustryProvider } from "@/contexts/IndustryContext";
import { BrandModeProvider } from "@/contexts/BrandModeContext";
import CopywriterPopoutPage from "@/pages/CopywriterPopoutPage";

export const Route = createFileRoute("/copywriter-popout")({
  component: () => (
    <RequireAuth>
      <WorkspaceProvider>
        <IndustryProvider>
          <BrandModeProvider>
            <CopywriterPopoutPage />
          </BrandModeProvider>
        </IndustryProvider>
      </WorkspaceProvider>
    </RequireAuth>
  ),
});
