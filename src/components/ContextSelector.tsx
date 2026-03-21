import { useState } from "react";
import { type AIModel, models as aiModels } from "@/components/playground/ModelSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, Clock, Briefcase, ChevronDown, ChevronUp, Cpu, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIndustry } from "@/contexts/IndustryContext";
import type { 
  MessageContext, 
  AudienceType, 
  CohortContext,
  CommunicationMoment, 
  Channel,
  MessageDomain,
  PrimaryGoal,
  TonePreference,
  OperationMode,
  Department
} from "@/types/campusvoice";

interface ContextSelectorProps {
  context: MessageContext;
  onChange: (context: MessageContext) => void;
  mode?: OperationMode;
  selectedModel?: AIModel;
  onModelChange?: (model: AIModel) => void;
}

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish (Español)' },
  { value: 'fr', label: 'French (Français)' },
  { value: 'zh', label: 'Chinese (中文)' },
  { value: 'ar', label: 'Arabic (العربية)' },
  { value: 'pt', label: 'Portuguese (Português)' },
  { value: 'de', label: 'German (Deutsch)' },
  { value: 'ja', label: 'Japanese (日本語)' },
  { value: 'ko', label: 'Korean (한국어)' },
  { value: 'hi', label: 'Hindi (हिन्दी)' },
  { value: 'vi', label: 'Vietnamese (Tiếng Việt)' },
  { value: 'tl', label: 'Tagalog' },
  { value: 'it', label: 'Italian (Italiano)' },
  { value: 'ru', label: 'Russian (Русский)' },
];

// ============= CHANNEL & TONE OPTIONS (industry-neutral) =============
const channelOptions: { value: Channel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS/Text' },
  { value: 'portal', label: 'Portal' },
  { value: 'landing-page', label: 'Landing Page' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'direct-mail', label: 'Direct Mail' },
  { value: 'phone-call', label: 'Phone Call' },
  { value: 'talking-points', label: 'Executive Talking Points' },
];

const toneOptions: { value: TonePreference; label: string }[] = [
  { value: 'supportive', label: 'Supportive' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'encouraging', label: 'Encouraging' },
  { value: 'directive', label: 'Directive' },
  { value: 'celebratory', label: 'Celebratory' },
  { value: 'urgent', label: 'Urgent' },
];

// ============= MAIN COMPONENT =============
export function ContextSelector({ context, onChange, mode = 'evaluator', selectedModel, onModelChange }: ContextSelectorProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const { audiences, cohorts, moments, domains, goals, departments, getCohortsForAudience, getMomentsForAudience } = useIndustry();

  const currentModel = aiModels.find(m => m.id === (selectedModel || 'google/gemini-3-flash-preview')) || aiModels[0];
  const CurrentModelIcon = currentModel.icon;
  const shouldShowModelSelector = Boolean(onModelChange);

  const showExtendedOptions = mode === 'builder' || mode === 'mapper';
  const hideChannel = mode === 'mapper' || mode === 'builder';
  
  // Map industry vocabulary to dropdown options
  const audienceOptions = audiences.map(a => ({ value: a.id as AudienceType, label: a.label }));

  const cohortOptions: { value: CohortContext; label: string }[] = context.audience
    ? [{ value: 'none' as CohortContext, label: 'No specific cohort' }, ...getCohortsForAudience(context.audience).map(c => ({ value: c.id as CohortContext, label: c.label }))]
    : [{ value: 'none' as CohortContext, label: 'No specific cohort' }];

  const momentOptions = context.audience
    ? getMomentsForAudience(context.audience).map(m => ({ value: m.id as CommunicationMoment, label: m.label }))
    : moments.map(m => ({ value: m.id as CommunicationMoment, label: m.label }));

  const domainOptions = domains.map(d => ({ value: d.id as MessageDomain, label: d.label }));
  const goalOptions = goals.map(g => ({ value: g.id as PrimaryGoal, label: g.label }));
  const departmentOptions = departments.map(d => ({ value: d.id as Department, label: d.label }));

  return (
    <div className="space-y-4">
      {/* Essential Filters - Always Visible */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${hideChannel ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
        <div className="space-y-2">
          <Label htmlFor="audience" className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-pillar-authority" />
            Audience Type
          </Label>
          <Select
            value={context.audience ?? ""}
            onValueChange={(value) =>
              onChange({ 
                ...context, 
                audience: value === "none" || value === "" ? undefined : value as AudienceType,
                cohort: undefined,
                moment: undefined,
                moments: undefined,
                domain: undefined,
                goal: undefined,
                goals: undefined,
              })
            }
          >
            <SelectTrigger id="audience" className="w-full bg-background">
              <SelectValue placeholder="Select audience..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None —</SelectItem>
              {audienceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cohort" className="flex items-center gap-2 text-sm font-medium">
            <Briefcase className="w-4 h-4 text-pillar-susceptibility" />
            Cohort Context
          </Label>
          <Select
            value={context.cohort || 'none'}
            onValueChange={(value: CohortContext) =>
              onChange({ ...context, cohort: value === 'none' ? undefined : value })
            }
          >
            <SelectTrigger id="cohort" className="w-full bg-background">
              <SelectValue placeholder="Select cohort" />
            </SelectTrigger>
            <SelectContent>
              {cohortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="moment" className="flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4 text-pillar-cognitive" />
            Communication Moment
          </Label>
          <MultiSelectDropdown
            options={momentOptions}
            value={context.moments || (context.moment ? [context.moment] : [])}
            onChange={(values) =>
              onChange({ 
                ...context, 
                moments: values.length > 0 ? values as CommunicationMoment[] : undefined,
                moment: values.length > 0 ? values[0] as CommunicationMoment : undefined
              })
            }
            placeholder="Select moments..."
          />
        </div>

        {!hideChannel && (
          <div className="space-y-2">
            <Label htmlFor="channel" className="flex items-center gap-2 text-sm font-medium">
              Channel
            </Label>
            <Select
              value={context.channel ?? ""}
              onValueChange={(value) =>
                onChange({ ...context, channel: value === "none" || value === "" ? undefined : value as Channel })
              }
            >
              <SelectTrigger id="channel" className="w-full bg-background">
                <SelectValue placeholder="Select channel..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {channelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Advanced Options - Collapsible */}
      {(showExtendedOptions || shouldShowModelSelector) && (
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/50"
            >
              {advancedOpen ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Advanced Options
                </>
              ) : (
                <>
                   <ChevronDown className="w-4 h-4" />
                    <span>Advanced Options</span>
                    {shouldShowModelSelector && (
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 font-normal">
                        <CurrentModelIcon className="w-3 h-3" />
                        {currentModel.name}
                      </Badge>
                    )}
                    {context.outputLanguage && context.outputLanguage !== 'en' && (
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 font-normal">
                        <Globe className="w-3 h-3" />
                        {languageOptions.find(l => l.value === context.outputLanguage)?.label?.split(' ')[0] || context.outputLanguage}
                      </Badge>
                    )}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div
              className={`grid grid-cols-1 ${
                showExtendedOptions
                  ? shouldShowModelSelector
                    ? 'md:grid-cols-2 lg:grid-cols-6'
                    : 'md:grid-cols-2 lg:grid-cols-5'
                  : shouldShowModelSelector
                    ? 'md:grid-cols-2 lg:grid-cols-3'
                    : 'md:grid-cols-2'
              } gap-4 p-4 border border-border rounded-lg bg-muted/30`}
            >
              {/* AI Model Selector */}
              {shouldShowModelSelector && (
                <div className="space-y-2">
                  <Label htmlFor="ai-model" className="flex items-center gap-2 text-sm font-medium">
                    <Cpu className="w-4 h-4 text-primary" />
                    AI Model
                  </Label>
                  <Select
                    value={selectedModel || 'google/gemini-3-flash-preview'}
                    onValueChange={(value) => onModelChange?.(value as AIModel)}
                  >
                    <SelectTrigger id="ai-model" className="w-full bg-background">
                      <SelectValue placeholder="Select model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {aiModels.map((model) => {
                        const ModelIcon = model.icon;
                        return (
                          <SelectItem key={model.id} value={model.id} className="py-2">
                            <div className="flex items-center gap-2">
                              <ModelIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showExtendedOptions && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">
                      Department
                    </Label>
                    <Select
                      value={context.department ?? ""}
                      onValueChange={(value) =>
                        onChange({ ...context, department: value === "none" || value === "" ? undefined : value as Department })
                      }
                    >
                      <SelectTrigger id="department" className="w-full bg-background">
                        <SelectValue placeholder="Select department..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— None —</SelectItem>
                        {departmentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain" className="text-sm font-medium">
                      Message Domain
                    </Label>
                    <Select
                      value={context.domain ?? ""}
                      onValueChange={(value) =>
                        onChange({ ...context, domain: value === "none" || value === "" ? undefined : value as MessageDomain })
                      }
                    >
                      <SelectTrigger id="domain" className="w-full bg-background">
                        <SelectValue placeholder="Select domain..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— None —</SelectItem>
                        {domainOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal" className="text-sm font-medium">
                      Primary Goal
                    </Label>
                    <MultiSelectDropdown
                      options={goalOptions}
                      value={context.goals || (context.goal ? [context.goal] : [])}
                      onChange={(values) =>
                        onChange({ 
                          ...context, 
                          goals: values.length > 0 ? values as PrimaryGoal[] : undefined,
                          goal: values.length > 0 ? values[0] as PrimaryGoal : undefined
                        })
                      }
                      placeholder="Select goals..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone" className="text-sm font-medium">
                      Tone Preference
                    </Label>
                    <Select
                      value={context.tone ?? ""}
                      onValueChange={(value) =>
                        onChange({ ...context, tone: value === "none" || value === "" ? undefined : value as TonePreference })
                      }
                    >
                      <SelectTrigger id="tone" className="w-full bg-background">
                        <SelectValue placeholder="Select tone..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— None —</SelectItem>
                        {toneOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
