import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface NextStep {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "ghost";
}

interface NextStepsBarProps {
  /** Contextual message shown above the actions */
  message?: string;
  /** Array of next step actions */
  steps: NextStep[];
  /** Whether to show the Home button */
  showHome?: boolean;
  className?: string;
}

export function NextStepsBar({ message, steps, showHome = true, className }: NextStepsBarProps) {
  return (
    <div
      className={cn(
        "mt-6 p-4 rounded-lg border border-border/60 bg-muted/30",
        "animate-fade-in",
        className
      )}
    >
      {message && (
        <p className="text-sm text-muted-foreground mb-3">{message}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const variant = step.variant || "outline";

          const content = (
            <>
              {Icon && <Icon className="w-4 h-4" />}
              {step.label}
              {step.href && <ArrowRight className="w-3.5 h-3.5" />}
            </>
          );

          if (step.href) {
            return (
              <Button key={step.label} variant={variant} size="sm" asChild className="gap-1.5">
                <Link to={step.href}>{content}</Link>
              </Button>
            );
          }

          return (
            <Button
              key={step.label}
              variant={variant}
              size="sm"
              onClick={step.onClick}
              className="gap-1.5"
            >
              {content}
            </Button>
          );
        })}

        {showHome && (
          <Button variant="ghost" size="sm" asChild className="gap-1.5 ml-auto text-muted-foreground hover:text-foreground">
            <Link to="/">
              <Home className="w-4 h-4" />
              Command Center
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default NextStepsBar;
