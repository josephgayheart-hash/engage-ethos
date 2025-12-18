import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, TrendingUp, Zap, Info } from "lucide-react";

export type CadenceFrequency = 
  | 'daily' 
  | 'every-other-day' 
  | '2-3x-week' 
  | 'weekly' 
  | 'biweekly';

export type EscalationPattern = 
  | 'none' 
  | 'gradual-increase' 
  | 'gradual-decrease' 
  | 'peak-middle' 
  | 'bookend';

interface CadenceSelectorProps {
  journeyWeeks: number;
  onCadenceChange: (cadence: CadenceFrequency) => void;
  onEscalationChange: (escalation: EscalationPattern) => void;
  onEstimatedTouchpointsChange?: (count: number) => void;
  initialCadence?: CadenceFrequency;
  initialEscalation?: EscalationPattern;
}

const cadenceOptions: { value: CadenceFrequency; label: string; perWeek: number; description: string }[] = [
  { value: 'biweekly', label: 'Biweekly', perWeek: 0.5, description: 'Light touch - 1 touchpoint every 2 weeks' },
  { value: 'weekly', label: 'Weekly', perWeek: 1, description: 'Standard - 1 touchpoint per week' },
  { value: '2-3x-week', label: '2-3x Per Week', perWeek: 2.5, description: 'Balanced - 2-3 touchpoints per week' },
  { value: 'every-other-day', label: 'Every Other Day', perWeek: 3.5, description: 'Moderate-high - ~3-4 touchpoints per week' },
  { value: 'daily', label: 'Daily', perWeek: 7, description: 'High intensity - 7 touchpoints per week' },
];

const escalationOptions: { value: EscalationPattern; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'none', label: 'Consistent', description: 'Same frequency throughout', icon: <span className="text-lg">―</span> },
  { value: 'gradual-increase', label: 'Ramp Up', description: 'Start slow, increase toward deadline', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'gradual-decrease', label: 'Ramp Down', description: 'Start strong, taper off', icon: <TrendingUp className="w-4 h-4 rotate-180" /> },
  { value: 'peak-middle', label: 'Peak Middle', description: 'Build up, peak mid-journey, taper', icon: <span className="text-lg">⌒</span> },
  { value: 'bookend', label: 'Bookend', description: 'Heavy start & end, lighter middle', icon: <span className="text-lg">⊓</span> },
];

// Calculate estimated touchpoints based on cadence, weeks, and escalation
const calculateEstimatedTouchpoints = (
  weeks: number, 
  cadence: CadenceFrequency, 
  escalation: EscalationPattern
): number => {
  const cadenceOption = cadenceOptions.find(c => c.value === cadence);
  if (!cadenceOption) return weeks;
  
  let baseTouchpoints = Math.round(weeks * cadenceOption.perWeek);
  
  // Escalation patterns can slightly modify the total (some patterns are more intensive)
  switch (escalation) {
    case 'gradual-increase':
    case 'gradual-decrease':
      // These typically result in similar totals
      break;
    case 'peak-middle':
      // Peak middle might have slightly more touchpoints due to the peak
      baseTouchpoints = Math.round(baseTouchpoints * 1.1);
      break;
    case 'bookend':
      // Bookend has heavier start and end
      baseTouchpoints = Math.round(baseTouchpoints * 1.15);
      break;
    default:
      break;
  }
  
  return Math.max(1, baseTouchpoints);
};

// Get intensity level for visual indicator
const getIntensityLevel = (cadence: CadenceFrequency): { level: number; label: string; color: string } => {
  switch (cadence) {
    case 'daily':
      return { level: 5, label: 'Very High', color: 'text-red-500' };
    case 'every-other-day':
      return { level: 4, label: 'High', color: 'text-orange-500' };
    case '2-3x-week':
      return { level: 3, label: 'Moderate', color: 'text-yellow-500' };
    case 'weekly':
      return { level: 2, label: 'Standard', color: 'text-green-500' };
    case 'biweekly':
      return { level: 1, label: 'Light', color: 'text-blue-500' };
    default:
      return { level: 2, label: 'Standard', color: 'text-green-500' };
  }
};

export function CadenceSelector({
  journeyWeeks,
  onCadenceChange,
  onEscalationChange,
  onEstimatedTouchpointsChange,
  initialCadence = 'weekly',
  initialEscalation = 'none',
}: CadenceSelectorProps) {
  const [cadence, setCadence] = useState<CadenceFrequency>(initialCadence);
  const [escalation, setEscalation] = useState<EscalationPattern>(initialEscalation);
  const [useEscalation, setUseEscalation] = useState(initialEscalation !== 'none');

  const estimatedTouchpoints = calculateEstimatedTouchpoints(journeyWeeks, cadence, escalation);
  const intensity = getIntensityLevel(cadence);

  useEffect(() => {
    onCadenceChange(cadence);
  }, [cadence, onCadenceChange]);

  useEffect(() => {
    onEscalationChange(useEscalation ? escalation : 'none');
  }, [escalation, useEscalation, onEscalationChange]);

  useEffect(() => {
    onEstimatedTouchpointsChange?.(estimatedTouchpoints);
  }, [estimatedTouchpoints, onEstimatedTouchpointsChange]);

  const handleCadenceSlider = (value: number[]) => {
    const index = value[0];
    setCadence(cadenceOptions[index].value);
  };

  const currentCadenceIndex = cadenceOptions.findIndex(c => c.value === cadence);

  return (
    <Card className="p-4 space-y-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold">Cadence & Intensity</Label>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Control how frequently touchpoints occur throughout your journey. Higher intensity means more frequent communications.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Cadence Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Light</span>
          <span>Standard</span>
          <span>Intense</span>
        </div>
        <Slider
          value={[currentCadenceIndex]}
          onValueChange={handleCadenceSlider}
          max={cadenceOptions.length - 1}
          min={0}
          step={1}
          className="w-full"
        />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{cadenceOptions[currentCadenceIndex].label}</p>
            <p className="text-xs text-muted-foreground">{cadenceOptions[currentCadenceIndex].description}</p>
          </div>
          <Badge variant="outline" className={`${intensity.color} border-current`}>
            <Zap className="w-3 h-3 mr-1" />
            {intensity.label}
          </Badge>
        </div>
      </div>

      {/* Escalation Toggle */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-secondary" />
            <Label className="text-sm">Escalation Pattern</Label>
          </div>
          <Switch
            checked={useEscalation}
            onCheckedChange={setUseEscalation}
          />
        </div>

        {useEscalation && (
          <Select 
            value={escalation} 
            onValueChange={(v) => setEscalation(v as EscalationPattern)}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select pattern" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {escalationOptions.filter(o => o.value !== 'none').map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <div>
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">- {option.description}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Estimated Touchpoints */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Estimated Touchpoints</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">{estimatedTouchpoints}</span>
            <span className="text-xs text-muted-foreground">over {journeyWeeks} weeks</span>
          </div>
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (estimatedTouchpoints / (journeyWeeks * 7)) * 100)}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

export default CadenceSelector;
