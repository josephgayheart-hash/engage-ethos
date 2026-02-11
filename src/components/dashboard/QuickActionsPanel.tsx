import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PenTool,
  FileText,
  Map,
  FolderOpen,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";

const DISMISSED_KEY = "campusvoice_quick_actions_dismissed";

const coreActions = [
  {
    label: "Build a Message",
    description: "Create on-brand communications guided by your Content DNA and institutional voice.",
    href: "/build",
    icon: PenTool,
  },
  {
    label: "Evaluate Content",
    description: "Score existing messages for brand alignment, reading level, and tone consistency.",
    href: "/evaluate",
    icon: FileText,
  },
  {
    label: "Design a Journey",
    description: "Map multi-touch communication sequences for key student lifecycle moments.",
    href: "/strategy",
    icon: Map,
  },
  {
    label: "Browse Library",
    description: "Access your saved messages, shared templates, and approved content.",
    href: "/library",
    icon: FolderOpen,
  },
  {
    label: "DNA Studio",
    description: "Train and refine your institution's Content DNA for better AI-generated results.",
    href: "/admin/content-dna",
    icon: Sparkles,
  },
];

export function QuickActionsPanel() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // ignore
    }
  };

  if (dismissed) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
          Get Started
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7"
        >
          <X className="w-3.5 h-3.5" />
          Got it, hide these
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {coreActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} to={action.href} className="group">
              <Card className="h-full border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4 flex flex-col gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-1">
                      {action.label}
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default QuickActionsPanel;
