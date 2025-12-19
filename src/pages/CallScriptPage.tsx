import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import { InstitutionalProfileSelector } from "@/components/InstitutionalProfileSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIBadge } from "@/components/ui/ai-indicator";
import { SmsCharCounter } from "@/components/ui/sms-char-counter";
import { useToast } from "@/hooks/use-toast";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useContentDNAForGeneration } from "@/hooks/useContentDNAForGeneration";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Phone, 
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Save,
  Clock,
  CalendarIcon,
  User,
  Target,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle
} from "lucide-react";
import type { AudienceType, CommunicationMoment, MessageDomain, PrimaryGoal, TonePreference, InstitutionalConfig } from "@/types/uplaybook";
import { useAuth } from "@/contexts/AuthContext";

interface CallScript {
  opening: string;
  purposeStatement: string;
  keyTalkingPoints: string[];
  objectionHandlers: { objection: string; response: string }[];
  closingOptions: { scenario: string; script: string }[];
  voicemailScript: string;
  followUpNotes: string;
}

const audienceOptions: { value: AudienceType; label: string }[] = [
  { value: 'prospective', label: 'Prospective Student' },
  { value: 'first-year', label: 'First-Year Student' },
  { value: 'continuing', label: 'Continuing Student' },
  { value: 'at-risk', label: 'At-Risk Student' },
  { value: 'graduate', label: 'Graduate Student' },
  { value: 'online-learner', label: 'Online Learner' },
];

const momentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'recruitment', label: 'Recruitment Outreach' },
  { value: 'early-term', label: 'Early Term Check-in' },
  { value: 'midterm', label: 'Mid-Term Follow-up' },
  { value: 're-engagement', label: 'Re-engagement' },
  { value: 'registration', label: 'Registration' },
  { value: 'orientation', label: 'Orientation' },
];

const domainOptions: { value: MessageDomain; label: string }[] = [
  { value: 'academic', label: 'Academic Performance' },
  { value: 'financial', label: 'Financial Aid' },
  { value: 'wellbeing', label: 'Wellbeing & Mental Health' },
  { value: 'behavioral', label: 'Behavioral Support' },
  { value: 'engagement', label: 'Student Engagement' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'compliance', label: 'Compliance' },
];

const goalOptions: { value: PrimaryGoal; label: string }[] = [
  { value: 'persist', label: 'Persist / Retain' },
  { value: 'respond', label: 'Get Response' },
  { value: 'check-in', label: 'Check-in' },
  { value: 'attend', label: 'Attend Event' },
  { value: 'submit', label: 'Submit Documents' },
  { value: 'register', label: 'Register' },
];

const toneOptions: { value: TonePreference; label: string }[] = [
  { value: 'supportive', label: 'Supportive & Warm' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'encouraging', label: 'Encouraging' },
  { value: 'directive', label: 'Directive' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'celebratory', label: 'Celebratory' },
];

const CallScriptPage = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { addMessage } = useMessageLibrary();
  const { contentDNA } = useContentDNAForGeneration();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedProfileName, setSelectedProfileName] = useState<string | undefined>(undefined);
  const [institutionalConfig, setInstitutionalConfig] = useState<InstitutionalConfig | null>(null);
  
  const [audience, setAudience] = useState<AudienceType>('first-year');
  const [moment, setMoment] = useState<CommunicationMoment>('early-term');
  const [domain, setDomain] = useState<MessageDomain>('academic');
  const [goal, setGoal] = useState<PrimaryGoal>('check-in');
  const [tone, setTone] = useState<TonePreference>('supportive');
  const [callerRole, setCallerRole] = useState('');
  const [specificContext, setSpecificContext] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [urgencyLabel, setUrgencyLabel] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [callScript, setCallScript] = useState<CallScript | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCallScript(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: {
          type: 'call-script',
          context: {
            audience,
            moment,
            domain,
            goal,
            tone,
            callerRole,
            specificContext,
            dueDate: dueDate?.toISOString(),
            urgencyLabel,
          },
          institutionalConfig,
          contentDNA: contentDNA || undefined,
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setCallScript(data.script);
      toast({
        title: "Call Script Generated",
        description: "Your personalized call script is ready.",
      });
    } catch (error) {
      console.error("Generation failed:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSaveToLibrary = () => {
    if (!callScript) return;
    
    const fullScript = `CALL SCRIPT: ${domain} - ${audience}

OPENING:
${callScript.opening}

PURPOSE:
${callScript.purposeStatement}

KEY TALKING POINTS:
${callScript.keyTalkingPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

OBJECTION HANDLERS:
${callScript.objectionHandlers.map(o => `Q: ${o.objection}\nA: ${o.response}`).join('\n\n')}

CLOSING OPTIONS:
${callScript.closingOptions.map(c => `[${c.scenario}]\n${c.script}`).join('\n\n')}

VOICEMAIL SCRIPT:
${callScript.voicemailScript}

FOLLOW-UP NOTES:
${callScript.followUpNotes}`;

    addMessage({
      title: `Call Script: ${domain} for ${audience}`,
      content: fullScript,
      channel: 'phone-call',
      audience,
      domain,
      moment,
      goal,
      tone,
      approved: false,
      mode: 'generated',
      institutionalProfileId: selectedProfileId || undefined,
      institutionalProfileName: selectedProfileName,
      createdByUserId: profile?.id,
      createdByName: profile ? `${profile.first_name} ${profile.last_name}` : undefined,
    });

    toast({
      title: "Saved to Library",
      description: "Call script saved to your personal library.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Call Script Generator</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Phone className="w-7 h-7 text-pillar-authority" />
                Call Script Generator
              </h1>
              <p className="text-muted-foreground mt-1">
                Generate research-informed phone call scripts for student outreach
              </p>
            </div>
            <AIBadge />
          </div>

          {/* Context Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Call Context</CardTitle>
              <CardDescription>
                Define the student, situation, and your goals for this call
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Institutional Profile Selector */}
              <InstitutionalProfileSelector
                selectedProfileId={selectedProfileId}
                onProfileChange={(id, config, name) => {
                  setSelectedProfileId(id);
                  setInstitutionalConfig(config);
                  setSelectedProfileName(name);
                }}
              />

              {/* Caller Info */}
              <div className="space-y-2">
                <Label htmlFor="caller-role">Your Role/Title</Label>
                <Input
                  id="caller-role"
                  placeholder="e.g., Academic Advisor, Success Coach"
                  value={callerRole}
                  onChange={(e) => setCallerRole(e.target.value)}
                />
              </div>

              {/* Context Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Student Type</Label>
                  <Select value={audience} onValueChange={(v) => setAudience(v as AudienceType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {audienceOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Call Purpose</Label>
                  <Select value={moment} onValueChange={(v) => setMoment(v as CommunicationMoment)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {momentOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Topic/Domain</Label>
                  <Select value={domain} onValueChange={(v) => setDomain(v as MessageDomain)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {domainOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Goal</Label>
                  <Select value={goal} onValueChange={(v) => setGoal(v as PrimaryGoal)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {goalOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as TonePreference)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Specific Context */}
              <div className="space-y-2">
                <Label htmlFor="specific-context">Specific Situation (Optional)</Label>
                <Textarea
                  id="specific-context"
                  placeholder="e.g., Student missed last two advising appointments, GPA dropped from 3.2 to 2.4, hasn't responded to emails..."
                  value={specificContext}
                  onChange={(e) => setSpecificContext(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Urgency & Deadline */}
              <div className="space-y-3 pt-2 border-t border-border">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-destructive" />
                  Urgency & Deadline (Optional)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="urgency-label" className="text-xs text-muted-foreground">Deadline Label</Label>
                    <Input
                      id="urgency-label"
                      placeholder="e.g., Drop deadline, Financial aid priority"
                      value={urgencyLabel}
                      onChange={(e) => setUrgencyLabel(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating Script...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Call Script
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Script */}
          {callScript && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Your Call Script
                </h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const fullScript = `CALL SCRIPT: ${domain} - ${audience}

OPENING:
${callScript.opening}

PURPOSE:
${callScript.purposeStatement}

KEY TALKING POINTS:
${callScript.keyTalkingPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

OBJECTION HANDLERS:
${callScript.objectionHandlers.map(o => `Q: ${o.objection}\nA: ${o.response}`).join('\n\n')}

CLOSING OPTIONS:
${callScript.closingOptions.map(c => `[${c.scenario}]\n${c.script}`).join('\n\n')}

VOICEMAIL SCRIPT:
${callScript.voicemailScript}

FOLLOW-UP NOTES:
${callScript.followUpNotes}`;
                      handleCopy(fullScript, 'all');
                    }}
                  >
                    {copiedSection === 'all' ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSaveToLibrary}>
                    <Save className="w-4 h-4 mr-2" />
                    Save to Library
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="opening" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="opening">Opening</TabsTrigger>
                  <TabsTrigger value="talking-points">Talking Points</TabsTrigger>
                  <TabsTrigger value="objections">Objections</TabsTrigger>
                  <TabsTrigger value="closing">Closing</TabsTrigger>
                </TabsList>

                <TabsContent value="opening" className="space-y-4 mt-4">
                  {/* Opening */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Opening Script
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative bg-muted/30 rounded-lg p-4">
                        <p className="text-sm whitespace-pre-wrap pr-10">{callScript.opening}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopy(callScript.opening, 'opening')}
                        >
                          {copiedSection === 'opening' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Purpose Statement */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="w-4 h-4 text-secondary" />
                        Purpose Statement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative bg-muted/30 rounded-lg p-4">
                        <p className="text-sm whitespace-pre-wrap pr-10">{callScript.purposeStatement}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopy(callScript.purposeStatement, 'purpose')}
                        >
                          {copiedSection === 'purpose' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Voicemail */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Phone className="w-4 h-4 text-amber-500" />
                        Voicemail Script
                      </CardTitle>
                      <CardDescription>If the student doesn't answer</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative bg-muted/30 rounded-lg p-4">
                        <p className="text-sm whitespace-pre-wrap pr-10">{callScript.voicemailScript}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopy(callScript.voicemailScript, 'voicemail')}
                        >
                          {copiedSection === 'voicemail' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="talking-points" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Key Talking Points</CardTitle>
                      <CardDescription>Cover these points during the conversation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {callScript.keyTalkingPoints.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                            <Badge variant="secondary" className="shrink-0">{idx + 1}</Badge>
                            <p className="text-sm">{point}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="objections" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Objection Handlers
                      </CardTitle>
                      <CardDescription>Responses to common student pushback</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {callScript.objectionHandlers.map((handler, idx) => (
                          <div key={idx} className="border border-border rounded-lg overflow-hidden">
                            <div className="bg-destructive/10 p-3 flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                              <p className="text-sm font-medium">"{handler.objection}"</p>
                            </div>
                            <div className="bg-muted/30 p-3 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                              <p className="text-sm">{handler.response}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="closing" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Closing Scripts</CardTitle>
                      <CardDescription>Choose based on how the call went</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {callScript.closingOptions.map((option, idx) => (
                          <div key={idx} className="border border-border rounded-lg overflow-hidden">
                            <div className="bg-primary/10 p-3">
                              <Badge variant="outline">{option.scenario}</Badge>
                            </div>
                            <div className="relative p-3">
                              <p className="text-sm whitespace-pre-wrap pr-10">{option.script}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => handleCopy(option.script, `closing-${idx}`)}
                              >
                                {copiedSection === `closing-${idx}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Follow-Up Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                        <p className="text-sm">{callScript.followUpNotes}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CallScriptPage;
