import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  PenTool,
  FileText,
  Map,
  FolderOpen,
  Sparkles,
  Image,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COMPACT_KEY = "campusvoice_quick_actions_compact";

const coreActions = [
  {
    label: "Build",
    description: "Create on-brand communications guided by your Content DNA and institutional voice.",
    href: "/build",
    icon: PenTool,
    gradient: "from-primary/90 to-primary",
  },
  {
    label: "Evaluate",
    description: "Score existing messages for brand alignment, reading level, and tone consistency.",
    href: "/evaluate",
    icon: FileText,
    gradient: "from-accent/90 to-accent",
  },
  {
    label: "Journey",
    description: "Map multi-touch communication sequences for key student lifecycle moments.",
    href: "/strategy",
    icon: Map,
    gradient: "from-[hsl(var(--cyber-purple))]/90 to-[hsl(var(--cyber-purple))]",
  },
  {
    label: "Library",
    description: "Access your saved messages, shared templates, and approved content.",
    href: "/library",
    icon: FolderOpen,
    gradient: "from-secondary/90 to-secondary",
  },
  {
    label: "Image Studio",
    description: "Generate on-brand campus visuals for social, email, and web channels.",
    href: "/image-generator",
    icon: Image,
    gradient: "from-[hsl(var(--cyber-lime))]/80 to-[hsl(var(--cyber-purple))]/90",
  },
  {
    label: "DNA Studio",
    description: "Train and refine your Content DNA for better AI-generated results.",
    href: "/admin/content-dna",
    icon: Sparkles,
    gradient: "from-[hsl(var(--cyber-lime))]/80 to-[hsl(var(--cyber-lime))]",
  },
];

export function QuickActionsPanel() {
  const [compact, setCompact] = useState(() => {
    try {
      return localStorage.getItem(COMPACT_KEY) === "true";
    } catch {
      return false;
    }
  });

  const handleToggle = () => {
    const next = !compact;
    setCompact(next);
    try {
      localStorage.setItem(COMPACT_KEY, String(next));
    } catch {
      // ignore
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
          {compact ? "Quick Actions" : "Get Started"}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7"
        >
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", compact && "-rotate-180")} />
          {compact ? "Show details" : "Compact view"}
        </Button>
      </div>

      <div className={cn(
        "grid gap-3 transition-all",
        compact
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}>
        {coreActions.map((action) => {
          const Icon = action.icon;

          if (compact) {
            return (
              <Link
                key={action.href}
                to={action.href}
                className="group relative overflow-hidden rounded-xl p-3 flex items-center gap-2.5 bg-card border border-border/60 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0", action.gradient)}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          }

          return (
            <Link key={action.href} to={action.href} className="group">
              <div className="relative h-full overflow-hidden rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                {/* Gradient accent strip */}
                <div className={cn("h-1.5 w-full bg-gradient-to-r", action.gradient)} />
                <div className="p-5 flex flex-col gap-3">
                  <div className={cn(
                    "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform",
                    action.gradient
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground flex items-center gap-1.5">
                      {action.label}
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default QuickActionsPanel;
