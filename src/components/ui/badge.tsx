import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status variants for CampusVoice
        strong:
          "border-transparent bg-status-strong text-status-strong-foreground",
        moderate:
          "border-transparent bg-status-moderate text-status-moderate-foreground",
        attention:
          "border-transparent bg-status-attention text-status-attention-foreground",
        // Pillar variants
        authority:
          "border-transparent bg-pillar-authority text-primary-foreground",
        susceptibility:
          "border-transparent bg-pillar-susceptibility text-primary-foreground",
        cognitive:
          "border-transparent bg-pillar-cognitive text-accent-foreground",
        consensus:
          "border-transparent bg-pillar-consensus text-secondary-foreground",
        ethics:
          "border-transparent bg-pillar-ethics text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
