import { Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAgencyMode } from "@/hooks/useAgencyMode";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { BetaBanner } from "@/components/BetaBanner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { WorkspaceSelector } from "./WorkspaceSelector";

const MAX_LOGO_HEIGHT = 28;
const MAX_LOGO_WIDTH = 100;

export function AppTopBar() {
  const { tenant } = useAuth();
  const { isAgency } = useAgencyMode();
  const { canSwitch, activeWorkspace } = useWorkspace();

  // When super admin is switching, show the active workspace; otherwise show own tenant
  const displayTenant = canSwitch ? activeWorkspace : tenant;

  return (
    <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />

      {/* Workspace selector for super admins */}
      {canSwitch && <WorkspaceSelector />}

      {/* Tenant badge for non-switching users, or active workspace info */}
      {!canSwitch && displayTenant && (
        <div className="flex items-center gap-2">
          {displayTenant.logo_url && (
            <img
              src={displayTenant.logo_url}
              alt={displayTenant.institution_name}
              className="object-contain"
              style={{
                maxHeight: `${MAX_LOGO_HEIGHT}px`,
                maxWidth: `${MAX_LOGO_WIDTH}px`,
              }}
            />
          )}
          <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">
            {displayTenant.institution_name}
          </span>
          {isAgency && (
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1 text-xs"
            >
              <Users className="h-3 w-3" />
              Agency
            </Badge>
          )}
        </div>
      )}

      <div className="ml-auto">
        <BetaBanner variant="badge" />
      </div>
    </header>
  );
}
