import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppTopBar } from "./AppTopBar";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { WorkspaceSwitchOverlay } from "./WorkspaceSwitchOverlay";
import { useAuth } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { IndustryProvider } from "@/contexts/IndustryContext";

export function AppLayout() {
  const { isImpersonating, impersonatedUserEmail, exitImpersonation } = useAuth();

  return (
    <WorkspaceProvider>
      <IndustryProvider>
        <WorkspaceSwitchOverlay />
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            {isImpersonating && impersonatedUserEmail && (
              <ImpersonationBanner
                targetUserEmail={impersonatedUserEmail}
                onExit={exitImpersonation}
              />
            )}
            <AppTopBar />
            <div className="flex-1">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </IndustryProvider>
    </WorkspaceProvider>
  );
}
