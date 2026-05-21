import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowRightLeft, Sparkles } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useBrandMode } from "@/contexts/BrandModeContext";
import { toast } from "sonner";

/**
 * Super-admin shortcut: jump into a Fieldmark-eligible workspace
 * (enterprise / franchise / manufacturer) to preview the Fieldmark brand mode.
 */
export function FieldmarkDemoSwitcher() {
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId } = useWorkspace();
  const { brandMode } = useBrandMode();

  const fieldmarkWorkspaces = useMemo(
    () =>
      workspaces.filter(
        (w) =>
          w.tenant_type === "enterprise" ||
          w.tenant_type === "franchise" ||
          w.industry_vertical === "manufacturer"
      ),
    [workspaces]
  );

  if (fieldmarkWorkspaces.length === 0) return null;

  const isOnFieldmark = brandMode === "fieldmark";

  return (
    <Card className="border-dashed bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-md bg-emerald-400/10 text-emerald-300 grid place-items-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">Fieldmark experience</span>
              <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-300 border-0 text-[10px]">
                {isOnFieldmark ? "Active" : "Preview"}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Switch into an enterprise / franchise workspace to preview the Fieldmark brand mode.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          {fieldmarkWorkspaces.map((w) => {
            const isActive = w.id === activeWorkspaceId;
            return (
              <Button
                key={w.id}
                size="sm"
                variant={isActive ? "secondary" : "default"}
                className={
                  isActive
                    ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/25 border border-emerald-500/30"
                    : "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                }
                onClick={() => {
                  if (isActive) return;
                  setActiveWorkspaceId(w.id);
                  toast.success(`Switching to ${w.institution_name}`);
                }}
              >
                {isActive ? <Building2 className="w-3.5 h-3.5 mr-1.5" /> : <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />}
                {w.institution_name}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
