import { Badge } from "@/components/ui/badge";
import { 
  PenTool, 
  Route, 
  MessageSquare, 
  FileUp, 
  ClipboardCheck, 
  Download,
  MoreHorizontal
} from "lucide-react";
import type { LibrarySource } from "@/types/library";

interface SourceBadgeProps {
  source?: LibrarySource;
  className?: string;
}

const sourceConfig: Record<LibrarySource, { label: string; icon: typeof PenTool; className: string }> = {
  builder: { 
    label: "Builder", 
    icon: PenTool, 
    className: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800" 
  },
  journey: { 
    label: "Journey", 
    icon: Route, 
    className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800" 
  },
  copywriter: { 
    label: "Copywriter", 
    icon: MessageSquare, 
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800" 
  },
  byoc: { 
    label: "BYOC", 
    icon: FileUp, 
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800" 
  },
  evaluate: { 
    label: "Evaluate", 
    icon: ClipboardCheck, 
    className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800" 
  },
  import: { 
    label: "Import", 
    icon: Download, 
    className: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-800" 
  },
  other: { 
    label: "Other", 
    icon: MoreHorizontal, 
    className: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800" 
  },
};

export function SourceBadge({ source, className }: SourceBadgeProps) {
  if (!source) return null;
  
  const config = sourceConfig[source] || sourceConfig.other;
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="outline" 
      className={`text-xs flex items-center gap-1 ${config.className} ${className || ""}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
