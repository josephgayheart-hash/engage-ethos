import { OVERLAY_PATTERNS, getOverlayStyle, type OverlayPatternId } from "./overlayPatterns";
import { cn } from "@/lib/utils";
import type { CustomOverlay } from "@/hooks/useCustomOverlays";

interface OverlayPatternSelectorProps {
  value: OverlayPatternId | string;
  onChange: (id: OverlayPatternId | string) => void;
  brandColor: string;
  secondaryColor?: string;
  /** Custom uploaded overlays to display alongside built-ins */
  customOverlays?: CustomOverlay[];
  /** Callback when a custom overlay is selected — passes the URL */
  onCustomOverlaySelect?: (overlay: CustomOverlay) => void;
}

const categories = ["Plain", "Gradients", "Geometric", "Patterns"] as const;

export function OverlayPatternSelector({
  value,
  onChange,
  brandColor,
  secondaryColor,
  customOverlays,
  onCustomOverlaySelect,
}: OverlayPatternSelectorProps) {
  const activeCustomOverlays = customOverlays?.filter(o => o.isActive) || [];

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const items = OVERLAY_PATTERNS.filter((p) => p.category === cat);
        return (
          <div key={cat}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              {cat}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {items.map((p) => {
                const style = getOverlayStyle(p.id, brandColor, 0.6, secondaryColor);
                const isSelected = value === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChange(p.id)}
                    className={cn(
                      "relative rounded-md border overflow-hidden aspect-square transition-all",
                      isSelected
                        ? "ring-2 ring-primary border-primary"
                        : "border-border hover:border-foreground/30"
                    )}
                    title={p.label}
                  >
                    <div className="absolute inset-0 bg-muted" />
                    <div className="absolute inset-0" style={style} />
                    <span className="absolute bottom-0 inset-x-0 bg-background/80 text-[8px] text-center py-0.5 font-medium truncate px-0.5">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Custom Uploaded Overlays */}
      {activeCustomOverlays.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Your Brand Patterns
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {activeCustomOverlays.map((overlay) => {
              const isSelected = value === `custom:${overlay.id}`;
              return (
                <button
                  key={overlay.id}
                  type="button"
                  onClick={() => {
                    onChange(`custom:${overlay.id}`);
                    onCustomOverlaySelect?.(overlay);
                  }}
                  className={cn(
                    "relative rounded-md border overflow-hidden aspect-square transition-all",
                    isSelected
                      ? "ring-2 ring-primary border-primary"
                      : "border-border hover:border-foreground/30"
                  )}
                  title={overlay.name}
                >
                  <img
                    src={overlay.fileUrl}
                    alt={overlay.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-background/80 text-[8px] text-center py-0.5 font-medium truncate px-0.5">
                    {overlay.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
