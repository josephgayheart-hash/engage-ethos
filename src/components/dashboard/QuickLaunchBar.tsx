import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  PenTool,
  FileText,
  Map,
  FolderOpen,
  Sparkles,
  Wrench,
} from "lucide-react";

const quickLinks = [
  { label: "Build", href: "/build", icon: PenTool },
  { label: "Evaluate", href: "/evaluate", icon: FileText },
  { label: "Strategy", href: "/strategy", icon: Map },
  { label: "Library", href: "/library", icon: FolderOpen },
  { label: "DNA Studio", href: "/admin/content-dna", icon: Sparkles },
  { label: "All Tools →", href: "/tools", icon: Wrench },
];

export function QuickLaunchBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-4 border-t border-border">
      {quickLinks.map((link) => {
        const Icon = link.icon;
        return (
          <Button key={link.href} variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Link to={link.href}>
              <Icon className="w-3.5 h-3.5" />
              {link.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
