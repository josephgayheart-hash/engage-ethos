import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Search, PenTool, Map, Building2 } from "lucide-react";
import type { OperationMode } from "@/types/persist";

interface ModeSelectorProps {
  mode: OperationMode;
  onChange: (mode: OperationMode) => void;
}

const modes = [
  {
    id: 'evaluator' as OperationMode,
    label: 'Message Evaluator',
    description: 'Evaluate an existing message',
    icon: Search,
  },
  {
    id: 'builder' as OperationMode,
    label: 'Message Builder',
    description: 'Create a new message from context',
    icon: PenTool,
  },
  {
    id: 'mapper' as OperationMode,
    label: 'Message Mapper',
    description: 'Plan messaging strategy',
    icon: Map,
  },
  {
    id: 'customization' as OperationMode,
    label: 'Institutional Setup',
    description: 'Configure your institution\'s voice',
    icon: Building2,
  },
];

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.id;
        
        return (
          <Card
            key={m.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              isActive 
                ? "border-secondary bg-secondary/5 ring-1 ring-secondary" 
                : "border-border hover:border-secondary/50"
            )}
            onClick={() => onChange(m.id)}
          >
            <CardContent className="p-4 text-center">
              <Icon className={cn(
                "w-6 h-6 mx-auto mb-2",
                isActive ? "text-secondary" : "text-muted-foreground"
              )} />
              <p className={cn(
                "font-medium text-sm",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {m.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                {m.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
