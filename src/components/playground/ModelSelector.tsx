import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Cpu, Zap, Sparkles, Brain, Rocket, FlaskConical, Crown } from 'lucide-react';

export type AIModel = 
  | 'google/gemini-2.5-flash' 
  | 'google/gemini-2.5-flash-lite' 
  | 'google/gemini-2.5-pro'
  | 'google/gemini-3-flash-preview'
  | 'google/gemini-3.1-pro-preview'
  | 'openai/gpt-5'
  | 'openai/gpt-5-mini'
  | 'openai/gpt-5-nano'
  | 'openai/gpt-5.2';

interface ModelOption {
  id: AIModel;
  name: string;
  description: string;
  icon: typeof Cpu;
  badge?: string;
}

export const models: ModelOption[] = [
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fast & capable (recommended)', icon: Rocket, badge: 'Default' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Balanced speed & quality', icon: Zap },
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Lite', description: 'Fastest, simple tasks', icon: Cpu },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Complex reasoning & analysis', icon: Brain, badge: 'Premium' },
  { id: 'google/gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', description: 'Next-gen reasoning', icon: FlaskConical, badge: 'Preview' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Strong reasoning, lower cost', icon: Sparkles },
  { id: 'openai/gpt-5', name: 'GPT-5', description: 'Powerful all-rounder', icon: Crown, badge: 'Premium' },
  { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', description: 'Speed & cost optimized', icon: Cpu },
  { id: 'openai/gpt-5.2', name: 'GPT-5.2', description: 'Enhanced reasoning', icon: Brain, badge: 'Latest' },
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
