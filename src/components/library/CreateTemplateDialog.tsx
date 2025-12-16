import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Sparkles, RefreshCw } from "lucide-react";
import type { SharedTemplate } from "@/types/library";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (template: Omit<SharedTemplate, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory'>) => void;
  initialContent?: string;
}

export function CreateTemplateDialog({ open, onOpenChange, onSubmit, initialContent = '' }: CreateTemplateDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [intentStatement, setIntentStatement] = useState('');
  const [content, setContent] = useState(initialContent);
  const [playbook, setPlaybook] = useState('');
  const [owner, setOwner] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [audiences, setAudiences] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [moments, setMoments] = useState<string[]>([]);
  const [whenToUse, setWhenToUse] = useState<string[]>([]);
  const [whenNotToUse, setWhenNotToUse] = useState<string[]>([]);
  const [guardrails, setGuardrails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [newUseCase, setNewUseCase] = useState('');
  const [newNotUseCase, setNewNotUseCase] = useState('');
  const [newGuardrail, setNewGuardrail] = useState('');

  const audienceOptions = ['prospective', 'first-year', 'continuing', 'at-risk', 'graduate'];
  const channelOptions = ['email', 'sms', 'portal', 'landing-page', 'social-media'];
  const momentOptions = ['early-term', 'midterm', 'finals', 're-engagement', 'seasonal', 'recruitment', 'orientation', 'registration'];

  const toggleArrayItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    if (arr.includes(item)) {
      setArr(arr.filter(i => i !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  const addToList = (value: string, list: string[], setList: (v: string[]) => void, clear: () => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      clear();
    }
  };

  const handleGenerateWithAI = async () => {
    if (audiences.length === 0 || channels.length === 0) {
      toast({ 
        variant: "destructive", 
        title: "Select context first", 
        description: "Please select at least one audience and channel for AI generation." 
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: {
          type: 'template',
          context: {
            audience: audiences[0],
            channel: channels[0],
            moment: moments[0] || 'general',
            domain: playbook || 'academic support',
            tone: 'supportive',
          },
          institutionalConfig: {
            institutionName: collegeName || undefined,
            departmentName: departmentName || undefined,
          }
        }
      });

      if (error) throw error;

      if (data?.message) {
        setContent(data.message);
        toast({ 
          title: "Message generated",
          description: "AI created a template based on your selections. Review and customize as needed."
        });
      }
    } catch (error) {
      console.error("Generation failed:", error);
      toast({ 
        variant: "destructive", 
        title: "Generation failed", 
        description: "Could not generate message. Please try again." 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (!title || !content || !intentStatement) {
      toast({ variant: "destructive", title: "Missing required fields", description: "Please fill in title, intent, and content." });
      return;
    }

    if (audiences.length === 0 || channels.length === 0 || moments.length === 0) {
      toast({ variant: "destructive", title: "Missing required fields", description: "Please select at least one audience, channel, and moment." });
      return;
    }

    // Extract placeholders from content
    const placeholderMatches = content.match(/\{\{([^}]+)\}\}/g) || [];
    const placeholders = placeholderMatches.map(match => {
      const key = match.replace(/\{\{|\}\}/g, '');
      return {
        key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `Value for ${key}`,
        required: true,
      };
    });

    const template: Omit<SharedTemplate, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory'> = {
      title,
      intentStatement,
      content,
      playbook: playbook || undefined,
      owner: owner || 'Unknown',
      maintainer: owner || 'Unknown',
      collegeName: collegeName || undefined,
      departmentName: departmentName || undefined,
      status: 'draft',
      version: '1.0',
      placeholders,
      requiredFields: {
        audience: audiences,
        channel: channels,
        moment: moments,
      },
      useCases: {
        whenToUse,
        whenNotToUse,
      },
      ethicalGuardrails: guardrails.length > 0 ? guardrails : ['Review for ethical compliance before publishing'],
    };

    onSubmit(template);
    onOpenChange(false);
    
    // Reset form
    setTitle('');
    setIntentStatement('');
    setContent('');
    setPlaybook('');
    setOwner('');
    setCollegeName('');
    setDepartmentName('');
    setAudiences([]);
    setChannels([]);
    setMoments([]);
    setWhenToUse([]);
    setWhenNotToUse([]);
    setGuardrails([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            Create Template
            <AIBadge />
          </DialogTitle>
          <DialogDescription>
            Submit a new template for the Shared Library. Use AI to generate content or write your own.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Template Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Midterm Academic Support Outreach" />
            </div>
            <div>
              <Label htmlFor="intent">Intent Statement *</Label>
              <Textarea id="intent" value={intentStatement} onChange={(e) => setIntentStatement(e.target.value)} placeholder="Briefly describe the purpose of this template..." rows={2} />
            </div>
          </div>

          {/* Classification - moved up for AI context */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="playbook">Playbook Category</Label>
                <Input id="playbook" value={playbook} onChange={(e) => setPlaybook(e.target.value)} placeholder="e.g., Midterm Academic Support" />
              </div>
              <div>
                <Label htmlFor="owner">Owner / Contact</Label>
                <Input id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g., Jane Smith" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="collegeName">College Name</Label>
                <Input id="collegeName" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="e.g., College of Arts & Sciences" />
              </div>
              <div>
                <Label htmlFor="departmentName">Department Name</Label>
                <Input id="departmentName" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} placeholder="e.g., Student Success Office" />
              </div>
            </div>
          </div>

          {/* Required Fields - needed for AI */}
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Target Audiences *</Label>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map(a => (
                  <Badge 
                    key={a} 
                    variant={audiences.includes(a) ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(audiences, setAudiences, a)}
                  >
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Channels *</Label>
              <div className="flex flex-wrap gap-2">
                {channelOptions.map(c => (
                  <Badge 
                    key={c} 
                    variant={channels.includes(c) ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(channels, setChannels, c)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Communication Moments *</Label>
              <div className="flex flex-wrap gap-2">
                {momentOptions.map(m => (
                  <Badge 
                    key={m} 
                    variant={moments.includes(m) ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(moments, setMoments, m)}
                  >
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Content with AI Generate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Message Content *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateWithAI}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>
            <Textarea 
              id="content" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Use {{placeholder}} syntax for variables... or click 'Generate with AI' after selecting audience and channel above." 
              rows={8} 
              className="font-mono text-sm" 
            />
            <p className="text-xs text-muted-foreground">Use {"{{variable_name}}"} for placeholders that users can customize</p>
          </div>

          {/* Use Cases */}
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">When to Use</Label>
              <div className="flex gap-2 mb-2">
                <Input value={newUseCase} onChange={(e) => setNewUseCase(e.target.value)} placeholder="Add use case..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList(newUseCase, whenToUse, setWhenToUse, () => setNewUseCase('')))} />
                <Button type="button" variant="outline" size="icon" onClick={() => addToList(newUseCase, whenToUse, setWhenToUse, () => setNewUseCase(''))}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {whenToUse.map((item, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setWhenToUse(whenToUse.filter((_, idx) => idx !== i))} />
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">When NOT to Use</Label>
              <div className="flex gap-2 mb-2">
                <Input value={newNotUseCase} onChange={(e) => setNewNotUseCase(e.target.value)} placeholder="Add case to avoid..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList(newNotUseCase, whenNotToUse, setWhenNotToUse, () => setNewNotUseCase('')))} />
                <Button type="button" variant="outline" size="icon" onClick={() => addToList(newNotUseCase, whenNotToUse, setWhenNotToUse, () => setNewNotUseCase(''))}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {whenNotToUse.map((item, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setWhenNotToUse(whenNotToUse.filter((_, idx) => idx !== i))} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Ethical Guardrails */}
          <div>
            <Label className="mb-2 block">Ethical Guardrails</Label>
            <div className="flex gap-2 mb-2">
              <Input value={newGuardrail} onChange={(e) => setNewGuardrail(e.target.value)} placeholder="Add ethical guideline..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList(newGuardrail, guardrails, setGuardrails, () => setNewGuardrail('')))} />
              <Button type="button" variant="outline" size="icon" onClick={() => addToList(newGuardrail, guardrails, setGuardrails, () => setNewGuardrail(''))}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {guardrails.map((item, i) => (
                <Badge key={i} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setGuardrails(guardrails.filter((_, idx) => idx !== i))} />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit as Draft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
