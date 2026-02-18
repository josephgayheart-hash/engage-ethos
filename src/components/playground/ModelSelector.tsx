import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Cpu, Zap, Sparkles, Brain } from 'lucide-react';

export type AIModel = 
  | 'google/gemini-2.5-flash' 
  | 'google/gemini-2.5-flash-lite' 
  | 'google/gemini-2.5-pro'
  | 'openai/gpt-5-mini';

interface ModelOption {
  id: AIModel;
  name: string;
  description: string;
  icon: typeof Cpu;
  badge?: string;
}

const models: ModelOption[] = [
  { id: 'google/gemini-2.5-flash', name: 'Flash', description: 'Fast & balanced', icon: Zap, badge: 'Default' },
  { id: 'google/gemini-2.5-flash-lite', name: 'Lite', description: 'Fastest', icon: Cpu },
  { id: 'google/gemini-2.5-pro', name: 'Pro', description: 'Most capable', icon: Brain, badge: 'Premium' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Strong reasoning', icon: Sparkles },
];

interface ModelSelectorProps {
  value: AIModel;
  onChange: (model: AIModel) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const selectedModel = models.find(m => m.id === value) || models[0];
  const Icon = selectedModel.icon;

  return (
    <Select value={value} onValueChange={(v) => onChange(v as AIModel)} disabled={disabled}>
      <SelectTrigger className="h-8 w-auto text-xs gap-1.5 border-border/50 rounded-lg bg-background hover:bg-muted/50 transition-colors">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <SelectValue>
          <span className="hidden sm:inline">{selectedModel.name}</span>
          <span className="sm:hidden">AI</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {models.map((model) => {
          const ModelIcon = model.icon;
          return (
            <SelectItem key={model.id} value={model.id} className="py-2">
              <div className="flex items-center gap-2">
                <ModelIcon className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    {model.badge && (
                      <Badge 
                        variant={model.badge === 'Premium' ? 'default' : 'secondary'} 
                        className="text-[10px] px-1 py-0"
                      >
                        {model.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{model.description}</span>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
