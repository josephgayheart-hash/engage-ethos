import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Building2, Loader2 } from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo-new.png";

export function WorkspaceSwitchOverlay() {
  const { isSwitching, switchingToName } = useWorkspace();

  if (!isSwitching) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
        {/* Logo */}
        <img
          src={campusvoiceLogo}
          alt="CampusVoice"
          className="h-8 opacity-60"
        />

        {/* Switching indicator */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center">
              <Loader2 className="w-3 h-3 text-primary animate-spin" />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">
              Switching context
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Loading <span className="font-medium text-foreground">{switchingToName}</span> workspace…
            </p>
          </div>
        </div>

        {/* Subtle progress bar */}
        <div className="w-48 h-0.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}
