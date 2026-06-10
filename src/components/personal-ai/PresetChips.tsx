import { Button } from "@/components/ui/button";
import { Workflow, FileText, Network, GitBranch, LayoutGrid, Boxes, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Preset {
  id: string;
  label: string;
  icon: typeof Workflow;
  /** Prepended to the user's prompt as guidance. */
  instruction: string;
}

export const PRESETS: Preset[] = [
  {
    id: "workflow",
    label: "Workflow",
    icon: Workflow,
    instruction:
      "Build a workflow for the following. Return (1) a Mermaid flowchart inside a ```mermaid fenced block showing the steps with decision points, (2) a swim-lane Mermaid diagram if multiple owners are involved, and (3) a RACI markdown table mapping each step to Responsible / Accountable / Consulted / Informed. Keep step labels short.",
  },
  {
    id: "one-pager",
    label: "Operating-Model One-Pager",
    icon: FileText,
    instruction:
      "Produce a polished one-page operating model for the following. Use the `generate_html` tool to return a self-contained branded HTML one-pager with these sections: Vision, Inputs, Process, Outputs, Metrics, Owners, Risks. Use clean modern styling, ample whitespace, and inline CSS. No external assets.",
  },
  {
    id: "process",
    label: "Process Map",
    icon: GitBranch,
    instruction:
      "Map this as a process. Return a Mermaid `flowchart LR` inside a ```mermaid fenced block with clear start/end nodes, decision diamonds, and labeled arrows. Below the diagram, list each step in one short sentence.",
  },
  {
    id: "org",
    label: "Org / Capability Map",
    icon: Network,
    instruction:
      "Render an organizational or capability map for the following as a Mermaid `flowchart TB` tree inside a ```mermaid fenced block. Keep nodes terse. Group related branches.",
  },
  {
    id: "architecture",
    label: "System Architecture",
    icon: Boxes,
    instruction:
      "Diagram this system architecture as a Mermaid `flowchart LR` (or `C4Context` if it fits) inside a ```mermaid fenced block. Show components, data stores, and integrations with directional arrows labeled by interaction type.",
  },
  {
    id: "framework",
    label: "Framework / 2x2",
    icon: LayoutGrid,
    instruction:
      "Render a framework graphic (2x2 matrix, pyramid, value chain, or funnel — pick what fits) as a custom SVG inside a ```svg fenced block. Use a viewBox, readable type, and a clean modern look. Use neutral grays unless the user specified brand colors.",
  },
  {
    id: "sequence",
    label: "Sequence Diagram",
    icon: BarChart3,
    instruction:
      "Render this interaction as a Mermaid `sequenceDiagram` inside a ```mermaid fenced block. Show participants, messages, and any activation/return arrows.",
  },
];

interface Props {
  onSelect: (preset: Preset) => void;
  active?: string | null;
  className?: string;
}

export function PresetChips({ onSelect, active, className }: Props) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <div className="flex items-center gap-1 pr-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        <Sparkles className="h-3 w-3" />
        Build
      </div>
      {PRESETS.map((p) => {
        const Icon = p.icon;
        const isActive = active === p.id;
        return (
          <Button
            key={p.id}
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(p)}
            className="h-7 gap-1.5 rounded-full px-2.5 text-xs font-medium"
          >
            <Icon className="h-3.5 w-3.5" />
            {p.label}
          </Button>
        );
      })}
    </div>
  );
}
