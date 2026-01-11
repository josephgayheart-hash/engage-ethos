import { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BuilderStepSectionProps {
  stepNumber: number;
  title: string;
  description?: string;
  helpText?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  optional?: boolean;
}

/**
 * BuilderStepSection - A numbered section component for guided workflows
 * 
 * Used in Message Builder and Journey Designer to create a clear, numbered
 * step-by-step flow for users configuring their message context.
 */
export function BuilderStepSection({
  stepNumber,
  title,
  description,
  helpText,
  icon,
  children,
  className,
  optional = false,
}: BuilderStepSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Step Header */}
      <div className="flex items-start gap-4">
        {/* Step Number Badge - Soft CampusVoice Brand Style */}
        <div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-gradient-to-br from-accent/15 via-primary/10 to-accent/5 border border-accent/25 text-accent flex items-center justify-center text-sm font-semibold shadow-sm">
          {stepNumber}
        </div>
        
        {/* Title and Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="text-primary">{icon}</span>
            )}
            <h3 className="text-base font-semibold text-foreground">
              {title}
            </h3>
            {optional && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Optional
              </span>
            )}
            {helpText && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-sm">{helpText}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Step Content */}
      <div className="ml-[52px] pl-0.5 border-l-2 border-accent/20">
        <div className="pl-4">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * BuilderStepDivider - A visual divider between major step groups
 */
export function BuilderStepDivider({ label }: { label?: string }) {
  return (
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/60" />
      </div>
      {label && (
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
