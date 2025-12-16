import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Building2, Check } from "lucide-react";
import type { InstitutionalConfig as InstitutionalConfigType } from "@/types/persist";

interface InstitutionalConfigProps {
  config: InstitutionalConfigType;
  onChange: (config: InstitutionalConfigType) => void;
}

export function InstitutionalConfig({ config, onChange }: InstitutionalConfigProps) {
  const [inputs, setInputs] = useState({
    buildingName: '',
    programName: '',
    slogan: '',
    leaderName: '',
    toneRule: '',
    wordToAvoid: '',
  });

  const addToArray = (field: keyof InstitutionalConfigType, inputKey: keyof typeof inputs) => {
    const value = inputs[inputKey].trim();
    if (!value) return;
    
    const currentArray = (config[field] as string[]) || [];
    if (!currentArray.includes(value)) {
      onChange({ ...config, [field]: [...currentArray, value] });
    }
    setInputs({ ...inputs, [inputKey]: '' });
  };

  const removeFromArray = (field: keyof InstitutionalConfigType, value: string) => {
    const currentArray = (config[field] as string[]) || [];
    onChange({ ...config, [field]: currentArray.filter(v => v !== value) });
  };

  const renderArrayField = (
    label: string,
    field: keyof InstitutionalConfigType,
    inputKey: keyof typeof inputs,
    placeholder: string
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputs[inputKey]}
          onChange={(e) => setInputs({ ...inputs, [inputKey]: e.target.value })}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(field, inputKey))}
        />
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={() => addToArray(field, inputKey)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {((config[field] as string[]) || []).map((item) => (
          <Badge key={item} variant="secondary" className="gap-1">
            {item}
            <button
              type="button"
              onClick={() => removeFromArray(field, item)}
              className="hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );

  const hasConfig = Object.values(config).some(v => 
    (Array.isArray(v) && v.length > 0) || (typeof v === 'string' && v.length > 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-xl flex items-center gap-2">
          <Building2 className="w-5 h-5 text-secondary" />
          Institutional Customization
        </CardTitle>
        <CardDescription>
          Configure your institution's voice, lexicon, and branding. These settings will be applied to all message outputs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mascot / Nickname</Label>
            <Input
              value={config.mascot || ''}
              onChange={(e) => onChange({ ...config, mascot: e.target.value })}
              placeholder="e.g., Wildcats, Blue Devils"
            />
          </div>
          
          {renderArrayField('Building & Center Names', 'buildingNames', 'buildingName', 'e.g., Student Success Center')}
          {renderArrayField('Program Names', 'programNames', 'programName', 'e.g., First-Year Experience')}
          {renderArrayField('Slogans & Phrases', 'slogans', 'slogan', 'e.g., Go Big Blue!')}
          {renderArrayField('Leader Names & Titles', 'leaderNames', 'leaderName', 'e.g., Dean Smith')}
          {renderArrayField('Tone Rules', 'toneRules', 'toneRule', 'e.g., Always use first names')}
          {renderArrayField('Words to Avoid', 'wordsToAvoid', 'wordToAvoid', 'e.g., mandatory')}
        </div>

        {hasConfig && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <Check className="w-4 h-4 text-green-600" />
            <span>Institutional settings will be applied to all message outputs.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
