import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, 
  Monitor, 
  Users, 
  Plus, 
  CheckCircle2,
  Circle,
  Layers
} from "lucide-react";
import { TOUCHPOINT_CHECKLIST, type TouchpointChecklistItem, type TouchpointType } from "@/types/playbook";
import { cn } from "@/lib/utils";

interface TouchpointInventoryProps {
  selectedTouchpoints: string[];
  onToggleTouchpoint: (touchpointId: string) => void;
  onAddCustomTouchpoint: (type: TouchpointType, name: string) => void;
}

const typeIcons: Record<TouchpointType, React.ElementType> = {
  physical: Building2,
  digital: Monitor,
  human: Users,
};

const typeLabels: Record<TouchpointType, string> = {
  physical: 'Physical Touchpoints',
  digital: 'Digital Touchpoints',
  human: 'Human Touchpoints',
};

const typeDescriptions: Record<TouchpointType, string> = {
  physical: 'Signage, printed materials, campus displays',
  digital: 'Website, email, social media, portals',
  human: 'Phone scripts, talking points, in-person interactions',
};

const typeColors: Record<TouchpointType, string> = {
  physical: 'bg-pillar-authority/10 text-pillar-authority border-pillar-authority/20',
  digital: 'bg-pillar-cognitive/10 text-pillar-cognitive border-pillar-cognitive/20',
  human: 'bg-pillar-consensus/10 text-pillar-consensus border-pillar-consensus/20',
};

export function TouchpointInventory({
  selectedTouchpoints,
  onToggleTouchpoint,
  onAddCustomTouchpoint,
}: TouchpointInventoryProps) {
  const [activeType, setActiveType] = useState<TouchpointType>('physical');
  const [customName, setCustomName] = useState('');

  const getItemsByType = (type: TouchpointType) => {
    return TOUCHPOINT_CHECKLIST.filter(item => item.type === type);
  };

  const getSelectedCountByType = (type: TouchpointType) => {
    const typeItems = getItemsByType(type);
    return typeItems.filter(item => selectedTouchpoints.includes(item.id)).length;
  };

  const handleAddCustom = () => {
    if (customName.trim()) {
      onAddCustomTouchpoint(activeType, customName.trim());
      setCustomName('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="icon-container icon-container-md bg-primary/10">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Touchpoint Inventory</CardTitle>
            <CardDescription>
              Select the touchpoints you want to include in your brand consistency audit
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeType} onValueChange={(v) => setActiveType(v as TouchpointType)}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            {(['physical', 'digital', 'human'] as TouchpointType[]).map(type => {
              const Icon = typeIcons[type];
              const count = getSelectedCountByType(type);
              const total = getItemsByType(type).length;

              return (
                <TabsTrigger key={type} value={type} className="gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{typeLabels[type].split(' ')[0]}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    {count}/{total}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(['physical', 'digital', 'human'] as TouchpointType[]).map(type => (
            <TabsContent key={type} value={type} className="mt-0">
              <div className="mb-3">
                <p className="text-sm text-muted-foreground">
                  {typeDescriptions[type]}
                </p>
              </div>

              <ScrollArea className="h-[320px] pr-3">
                <div className="space-y-2">
                  {getItemsByType(type).map(item => {
                    const isSelected = selectedTouchpoints.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          isSelected 
                            ? "bg-primary/5 border-primary/30" 
                            : "bg-card hover:bg-muted/50 border-border"
                        )}
                        onClick={() => onToggleTouchpoint(item.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{item.name}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {item.examples.slice(0, 3).map((example, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-[10px] px-1.5 py-0"
                              >
                                {example}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Custom Touchpoint */}
                  <div className="p-3 rounded-lg border border-dashed bg-muted/30">
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Add Custom {typeLabels[type].split(' ')[0]} Touchpoint
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Department Newsletter"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddCustom}
                        disabled={!customName.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{selectedTouchpoints.length}</span> touchpoints selected
          </div>
          <div className="flex gap-2">
            {(['physical', 'digital', 'human'] as TouchpointType[]).map(type => {
              const count = getSelectedCountByType(type);
              if (count === 0) return null;
              const Icon = typeIcons[type];
              return (
                <Badge key={type} variant="outline" className={cn("gap-1", typeColors[type])}>
                  <Icon className="w-3 h-3" />
                  {count}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
