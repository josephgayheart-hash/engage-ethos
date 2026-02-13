import { OVERLAY_PATTERNS, getOverlayStyle, type OverlayPatternId } from "./overlayPatterns";
import { cn } from "@/lib/utils";

interface OverlayPatternSelectorProps {
  value: OverlayPatternId;
  onChange: (id: OverlayPatternId) => void;
  brandColor: string;
  secondaryColor?: string;
}

const categories = ["Plain", "Gradients", "Geometric", "Patterns"] as const;

export function OverlayPatternSelector({
  value,
  onChange,
  brandColor,
  secondaryColor,
}: OverlayPatternSelectorProps) {
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
                    {/* Checkerboard-style preview background */}
                    <div className="absolute inset-0 bg-muted" />
                    {/* Pattern preview */}
                    <div className="absolute inset-0" style={style} />
                    {/* Label */}
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
    </div>
  );
}
