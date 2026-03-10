import { Building2, ChevronDown, Check, LogOut } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export function WorkspaceSelector() {
  const { workspaces, activeWorkspaceId, activeWorkspace, canSwitch, setActiveWorkspaceId } = useWorkspace();
  const { tenant } = useAuth();

  if (!canSwitch) return null;

  const isImpersonating = activeWorkspaceId && tenant && activeWorkspaceId !== tenant.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 max-w-[220px] h-8">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-xs font-medium">
            {activeWorkspace?.institution_name ?? "Select workspace"}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[260px]">
        {isImpersonating && (
          <>
            <DropdownMenuItem
              onSelect={() => setActiveWorkspaceId(tenant!.id)}
              className="flex items-center gap-2 cursor-pointer text-primary font-medium"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="text-sm">Exit to Platform</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Switch workspace ({workspaces.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[320px]">
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onSelect={() => setActiveWorkspaceId(ws.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              {ws.logo_url ? (
                <img
                  src={ws.logo_url}
                  alt=""
                  className="h-5 w-5 rounded object-contain shrink-0"
                />
              ) : (
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate text-sm flex-1">{ws.institution_name}</span>
              {ws.id === activeWorkspaceId && (
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
