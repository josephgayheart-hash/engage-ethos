import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIIndicatorProps {
  className?: string;
  label?: string;
  size?: "sm" | "md";
  pulse?: boolean;
}

export function AIIndicator({ className, label = "AI", size = "sm", pulse = false }: AIIndicatorProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1 text-secondary font-medium",
        size === "sm" ? "text-xs" : "text-sm",
        pulse && "animate-pulse",
        className
      )}
    >
      <Sparkles className={cn(size === "sm" ? "w-3 h-3" : "w-4 h-4")} />
      {label}
    </span>
  );
}

interface AIBadgeProps {
  className?: string;
  generating?: boolean;
}

export function AIBadge({ className, generating = false }: AIBadgeProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        "bg-secondary/10 text-secondary border border-secondary/20",
        generating && "animate-pulse",
        className
      )}
    >
      <Sparkles className="w-3 h-3" />
      {generating ? "Generating..." : "AI-Powered"}
    </span>
  );
}
