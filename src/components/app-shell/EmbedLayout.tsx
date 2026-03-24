import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { IndustryProvider } from "@/contexts/IndustryContext";
import { EmbedProvider } from "@/contexts/EmbedContext";
import { BrandedLoader } from "@/components/BrandedLoader";

/**
 * Stripped-down layout for Salesforce Canvas / iframe embedding.
 * No sidebar, no top bar, no feedback button — just the tool content.
 */
export function EmbedLayout() {
  return (
    <WorkspaceProvider>
      <IndustryProvider>
        <EmbedProvider>
          <div className="min-h-screen bg-background">
            <Outlet />
          </div>
        </EmbedProvider>
      </IndustryProvider>
    </WorkspaceProvider>
  );
}
