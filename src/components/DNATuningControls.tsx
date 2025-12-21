import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sliders,
  MessageSquare,
  Shield,
  Plus,
  X,
  Lightbulb,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { 
  VoiceDimension, 
  SectionFeedback, 
  OverrideRule, 
  DNAAdjustments,
  ContentDNAAdjustmentsRecord 
} from '@/hooks/useContentDNA';

interface DNATuningControlsProps {
  voiceAnalysis: any;
  existingAdjustments?: ContentDNAAdjustmentsRecord | null;
  onSave?: (adjustments: DNAAdjustments) => void;
  isLoading?: boolean;
}

export type { DNAAdjustments };

const DEFAULT_DIMENSIONS: VoiceDimension[] = [
  {
    id: 'formality',
    label: 'Tone Formality',
    leftLabel: 'Casual',
    rightLabel: 'Formal',
    value: 50,
    description: 'Adjust the overall formality level of generated content',
  },
  {
    id: 'warmth',
    label: 'Voice Warmth',
    leftLabel: 'Professional',
    rightLabel: 'Warm & Personal',
    value: 50,
    description: 'Control how approachable vs. businesslike the voice sounds',
  },
  {
    id: 'conciseness',
    label: 'Content Length',
    leftLabel: 'Detailed',
    rightLabel: 'Concise',
    value: 50,
    description: 'Prefer brevity or comprehensive explanations',
  },
  {
    id: 'urgency',
    label: 'Call-to-Action Strength',
    leftLabel: 'Soft Suggest',
    rightLabel: 'Strong Urge',
    value: 50,
    description: 'How assertive should calls-to-action be',
  },
  {
    id: 'storytelling',
    label: 'Narrative Style',
    leftLabel: 'Direct Facts',
    rightLabel: 'Story-driven',
    value: 50,
    description: 'Balance between straightforward info and narrative elements',
  },
];

const VOICE_SECTIONS = [
  { id: 'tone', label: 'Tone & Formality', description: 'Overall voice character' },
  { id: 'vocabulary', label: 'Vocabulary & Phrasing', description: 'Word choices and expressions' },
  { id: 'structure', label: 'Sentence Structure', description: 'How sentences are constructed' },
  { id: 'cta', label: 'Calls-to-Action', description: 'How actions are requested' },
  { id: 'openings', label: 'Openings & Closings', description: 'How messages begin and end' },
];

export function DNATuningControls({ voiceAnalysis, existingAdjustments, onSave, isLoading }: DNATuningControlsProps) {
  const [activeTab, setActiveTab] = useState('sliders');
  const [dimensions, setDimensions] = useState<VoiceDimension[]>(DEFAULT_DIMENSIONS);
  const [sectionFeedback, setSectionFeedback] = useState<SectionFeedback[]>([]);
  const [overrideRules, setOverrideRules] = useState<OverrideRule[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [newRuleInput, setNewRuleInput] = useState('');
  const [newRuleType, setNewRuleType] = useState<'always' | 'never' | 'prefer'>('always');

  // Load existing adjustments when available
  useEffect(() => {
    if (existingAdjustments) {
      // Merge saved dimensions with defaults (in case new dimensions were added)
      if (existingAdjustments.dimensions?.length > 0) {
        setDimensions(prev => 
          prev.map(d => {
            const saved = existingAdjustments.dimensions.find(sd => sd.id === d.id);
            return saved ? { ...d, value: saved.value } : d;
          })
        );
      }
      if (existingAdjustments.section_feedback?.length > 0) {
        setSectionFeedback(existingAdjustments.section_feedback);
      }
      if (existingAdjustments.override_rules?.length > 0) {
        setOverrideRules(existingAdjustments.override_rules);
      }
    }
  }, [existingAdjustments]);

  // Handle slider changes
  const handleDimensionChange = (id: string, value: number[]) => {
    setDimensions(prev =>
      prev.map(d => (d.id === id ? { ...d, value: value[0] } : d))
    );
  };

  // Reset dimensions to default
  const handleResetDimensions = () => {
    setDimensions(DEFAULT_DIMENSIONS);
  };

  // Add section feedback
  const handleAddFeedback = (sectionId: string) => {
    if (!feedbackInput.trim()) return;
    
    const newFeedback: SectionFeedback = {
      id: `${sectionId}-${Date.now()}`,
      section: sectionId,
      feedback: feedbackInput,
      timestamp: new Date().toISOString(),
    };
    
    setSectionFeedback(prev => [...prev, newFeedback]);
    setFeedbackInput('');
    setExpandedSection(null);
  };

  // Remove section feedback
  const handleRemoveFeedback = (id: string) => {
    setSectionFeedback(prev => prev.filter(f => f.id !== id));
  };

  // Add override rule
  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    
    const newRule: OverrideRule = {
      id: `rule-${Date.now()}`,
      type: newRuleType,
      rule: newRuleInput,
    };
    
    setOverrideRules(prev => [...prev, newRule]);
    setNewRuleInput('');
  };

  // Remove override rule
  const handleRemoveRule = (id: string) => {
    setOverrideRules(prev => prev.filter(r => r.id !== id));
  };

  // Save all adjustments
  const handleSave = () => {
    if (onSave) {
      onSave({ dimensions, sectionFeedback, overrideRules });
    }
  };

  // Check if there are unsaved changes
  const hasChanges = 
    dimensions.some(d => d.value !== 50) ||
    sectionFeedback.length > 0 ||
    overrideRules.length > 0;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sliders" className="flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Dimension Sliders</span>
            <span className="sm:hidden">Sliders</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Section Feedback</span>
            <span className="sm:hidden">Feedback</span>
            {sectionFeedback.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {sectionFeedback.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Override Rules</span>
            <span className="sm:hidden">Rules</span>
            {overrideRules.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {overrideRules.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Dimension Sliders Tab */}
        <TabsContent value="sliders" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Voice Dimension Tuning</CardTitle>
                  <CardDescription>
                    Fine-tune specific aspects of your voice without changing the core DNA
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleResetDimensions}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {dimensions.map((dimension) => (
                <div key={dimension.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{dimension.label}</Label>
                    <span className="text-xs text-muted-foreground">
                      {dimension.value < 40 ? dimension.leftLabel : 
                       dimension.value > 60 ? dimension.rightLabel : 'Balanced'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-20 text-right">
                      {dimension.leftLabel}
                    </span>
                    <Slider
                      value={[dimension.value]}
                      onValueChange={(value) => handleDimensionChange(dimension.id, value)}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-20">
                      {dimension.rightLabel}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{dimension.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section Feedback Tab */}
        <TabsContent value="feedback" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Section-Specific Feedback</CardTitle>
              <CardDescription>
                Click on a DNA section to provide specific feedback or corrections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {VOICE_SECTIONS.map((section) => {
                  const sectionFeedbackItems = sectionFeedback.filter(f => f.section === section.id);
                  const isExpanded = expandedSection === section.id;
                  
                  return (
                    <div key={section.id} className="border rounded-lg">
                      <button
                        onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{section.label}</p>
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {sectionFeedbackItems.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {sectionFeedbackItems.length} note{sectionFeedbackItems.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 border-t">
                          {/* Existing feedback for this section */}
                          {sectionFeedbackItems.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {sectionFeedbackItems.map((item) => (
                                <div key={item.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                                  <p className="flex-1 text-sm">{item.feedback}</p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0"
                                    onClick={() => handleRemoveFeedback(item.id)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Add new feedback */}
                          <div className="mt-3 space-y-2">
                            <Textarea
                              placeholder={`What would you like to adjust about ${section.label.toLowerCase()}? (e.g., "Make greetings warmer" or "Avoid jargon")`}
                              value={feedbackInput}
                              onChange={(e) => setFeedbackInput(e.target.value)}
                              className="min-h-[80px] resize-none"
                            />
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                onClick={() => handleAddFeedback(section.id)}
                                disabled={!feedbackInput.trim()}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Feedback
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Override Rules Tab */}
        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Override Rules</CardTitle>
              <CardDescription>
                Create rules that always apply on top of your Content DNA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing rules */}
              {overrideRules.length > 0 && (
                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-2">
                    {overrideRules.map((rule) => (
                      <div key={rule.id} className="flex items-center gap-2 p-3 border rounded-lg">
                        <Badge 
                          variant={rule.type === 'never' ? 'destructive' : rule.type === 'always' ? 'default' : 'secondary'}
                          className="shrink-0"
                        >
                          {rule.type === 'always' ? 'Always' : rule.type === 'never' ? 'Never' : 'Prefer'}
                        </Badge>
                        <p className="flex-1 text-sm">{rule.rule}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleRemoveRule(rule.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              
              {/* Add new rule */}
              <div className="space-y-3 pt-2 border-t">
                <Label className="text-sm">Add New Rule</Label>
                <div className="flex gap-2">
                  <select
                    value={newRuleType}
                    onChange={(e) => setNewRuleType(e.target.value as 'always' | 'never' | 'prefer')}
                    className="px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    <option value="always">Always</option>
                    <option value="never">Never</option>
                    <option value="prefer">Prefer</option>
                  </select>
                  <Input
                    placeholder="e.g., use active voice, emphasize student outcomes..."
                    value={newRuleInput}
                    onChange={(e) => setNewRuleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddRule} disabled={!newRuleInput.trim()}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                {/* Example rules */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <p className="text-xs text-muted-foreground w-full">Examples:</p>
                  {[
                    { type: 'always', text: 'use active voice' },
                    { type: 'never', text: 'use passive voice' },
                    { type: 'prefer', text: 'shorter sentences' },
                    { type: 'always', text: 'emphasize student outcomes' },
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setNewRuleType(example.type as 'always' | 'never' | 'prefer');
                        setNewRuleInput(example.text);
                      }}
                      className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                    >
                      {example.type}: {example.text}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary & Save */}
      {hasChanges && (
        <Alert className="border-secondary/50 bg-secondary/10">
          <Lightbulb className="h-4 w-4" />
          <AlertDescription className="ml-2 flex items-center justify-between">
            <span className="text-sm">
              You have unsaved adjustments: 
              {dimensions.filter(d => d.value !== 50).length > 0 && (
                <Badge variant="outline" className="ml-2">{dimensions.filter(d => d.value !== 50).length} sliders</Badge>
              )}
              {sectionFeedback.length > 0 && (
                <Badge variant="outline" className="ml-2">{sectionFeedback.length} feedback</Badge>
              )}
              {overrideRules.length > 0 && (
                <Badge variant="outline" className="ml-2">{overrideRules.length} rules</Badge>
              )}
            </span>
            <Button size="sm" onClick={handleSave} disabled={isLoading} className="ml-4">
              <Save className="w-4 h-4 mr-2" />
              Save Adjustments
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
