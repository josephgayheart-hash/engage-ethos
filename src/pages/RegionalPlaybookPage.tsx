import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIBadge } from "@/components/ui/ai-indicator";
import { TranslationToggle } from "@/components/TranslationToggle";
import { PlaybookRenderer } from "@/components/playbook/PlaybookRenderer";
import { useToast } from "@/hooks/use-toast";
import { useIndustry } from "@/contexts/IndustryContext";
import { useAuth } from "@/contexts/AuthContext";
import { InstitutionalProfileSelector } from "@/components/InstitutionalProfileSelector";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin,
  Sparkles,
  Users,
  Calendar,
  Building2,
  Languages,
} from "lucide-react";

const outputLanguages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'it', label: 'Italian' },
  { value: 'ru', label: 'Russian' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'tl', label: 'Tagalog' },
];

type PlaybookTab = 'site-visit' | 'rep-engagement' | 'event-coordination';

const regionOptions = [
  { value: 'north-america', label: 'North America' },
  { value: 'latam', label: 'Latin America' },
  { value: 'emea', label: 'EMEA' },
  { value: 'apac', label: 'Asia-Pacific' },
  { value: 'dach', label: 'DACH' },
  { value: 'custom', label: 'Custom Region' },
];

const RegionalPlaybookPage = () => {
  const { toast } = useToast();
  const { labels: industryLabels } = useIndustry();
  const { profile } = useAuth();
  const { profiles } = useInstitutionalProfiles();

  const [activeTab, setActiveTab] = useState<PlaybookTab>('site-visit');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [outputLanguage, setOutputLanguage] = useState('en');
  const [region, setRegion] = useState('');
  const [customRegion, setCustomRegion] = useState('');

  // Site Visit state
  const [visitCompany, setVisitCompany] = useState('');
  const [visitContact, setVisitContact] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitObjective, setVisitObjective] = useState('');
  const [visitNotes, setVisitNotes] = useState('');

  // Rep Engagement state
  const [repCount, setRepCount] = useState('');
  const [engagementGoal, setEngagementGoal] = useState('');
  const [cadence, setCadence] = useState('weekly');

  // Event state
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState('');

  const [generatedContent, setGeneratedContent] = useState('');
  const [displayContent, setDisplayContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const regionLabel = region === 'custom' ? customRegion : regionOptions.find(r => r.value === region)?.label || 'your region';
  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  const buildPrompt = (): string => {
    const langInstruction = outputLanguage !== 'en'
      ? `\n\nIMPORTANT: Generate ALL content in ${outputLanguages.find(l => l.value === outputLanguage)?.label || outputLanguage}. All emails, templates, talking points, and instructions must be in ${outputLanguages.find(l => l.value === outputLanguage)?.label}. Only section headers may remain in English for structure.`
      : '';

    const base = `You are a regional operations strategist for ${industryLabels?.industryContext || 'enterprise brand management'}.
Organization: ${selectedProfile?.name || 'Not specified'}
Region: ${regionLabel}${langInstruction}`;

    if (activeTab === 'site-visit') {
      return `${base}

Generate a comprehensive Site Visit Playbook for:
- Company/Client: ${visitCompany || 'Not specified'}
- Key Contact: ${visitContact || 'Not specified'}
- Visit Date: ${visitDate || 'TBD'}
- Objective: ${visitObjective || 'General relationship building'}
- Additional Notes: ${visitNotes || 'None'}

Include these sections:
1. **Pre-Visit Briefing** — Company background, recent news, key metrics, talking points
2. **Visit Agenda** — Suggested 2-hour meeting structure with time blocks
3. **Discussion Guide** — Open-ended questions organized by topic (business needs, pain points, growth)
4. **Presentation Talking Points** — Key value propositions tailored to this client
5. **Post-Visit Follow-Up Sequence**:
   - Same-day thank you email (draft the email)
   - 48-hour action items summary email (draft)
   - 1-week check-in message (draft)
   - 30-day re-engagement touchpoint (draft)
6. **Internal Debrief Template** — What to report back to HQ

Use professional, actionable language with markdown formatting.`;
    }

    if (activeTab === 'rep-engagement') {
      return `${base}

Generate a Sales Rep Engagement Cadence for:
- Number of Reps: ${repCount || 'Not specified'}
- Primary Goal: ${engagementGoal || 'Performance improvement and alignment'}
- Cadence: ${cadence}

Include these sections:
1. **${cadence === 'weekly' ? 'Weekly' : cadence === 'biweekly' ? 'Bi-Weekly' : 'Monthly'} Check-In Template**
   - Meeting agenda template (15–30 min)
   - Key metrics to review
   - Coaching conversation starters
2. **Performance Nudge Messages** (draft 3 variations):
   - Motivational / recognition nudge
   - Accountability / pipeline review nudge
   - Training / upskill opportunity nudge
3. **Quarterly Business Review Template**
   - Rep self-assessment prompts
   - Manager review framework
   - Goal-setting structure
4. **Escalation Playbook**
   - When to escalate to leadership
   - Underperformance intervention steps
   - Support resources to offer
5. **Team Communication Templates**
   - Regional win announcement
   - New product/feature rollout brief
   - Territory change notification

Use a supportive yet results-driven tone.`;
    }

    // event-coordination
    return `${base}

Generate a Regional Event Coordination Playbook for:
- Event: ${eventName || 'Regional Event'}
- Type: ${eventType || 'Client meeting / networking'}
- Date: ${eventDate || 'TBD'}
- Expected Attendees: ${expectedAttendees || 'Not specified'}

Include these sections:
1. **Pre-Event Planning Checklist** — Venue, logistics, materials, speakers
2. **Invitation Sequence**:
   - Initial invite email (draft — professional, compelling)
   - Reminder email at 1 week out (draft)
   - Day-before reminder with logistics (draft)
3. **RSVP Tracking Template** — Fields to track
4. **Day-of Run Sheet** — Hour-by-hour agenda
5. **Post-Event Follow-Up Sequence**:
   - Thank you email within 24 hours (draft)
   - Survey / feedback request at 48 hours (draft)
   - Content share / recap at 1 week (draft)
   - Follow-up meeting request for hot leads (draft)
6. **ROI Report Template** — Attendance, leads generated, follow-up conversion

Tone should be organized, warm, and brand-aligned.`;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = buildPrompt();
      const { data, error } = await supabase.functions.invoke('playground-chat', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          model: 'google/gemini-2.5-flash',
          systemPrompt: `You are an expert regional operations manager creating field playbooks. Output comprehensive, ready-to-use templates with draft communications. Use markdown formatting with clear section headers.`,
        },
      });

      if (error) throw error;
      setGeneratedContent(data?.reply || 'No content generated.');
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const playbookTitle = activeTab === 'site-visit' ? 'Site Visit Playbook' : activeTab === 'rep-engagement' ? 'Rep Engagement Plan' : 'Event Coordination Playbook';

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-serif text-2xl font-bold mb-1 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Regional Manager Playbook
            </h1>
            <p className="text-sm text-muted-foreground">
              Generate field-ready playbooks for site visits, rep engagement, and regional events.
            </p>
          </div>

          {/* Context Selectors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Region & Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Region</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent>
                      {regionOptions.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {region === 'custom' && (
                  <div className="space-y-1.5">
                    <Label>Custom Region Name</Label>
                    <Input placeholder="e.g., Southeast US" value={customRegion} onChange={e => setCustomRegion(e.target.value)} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5" />
                    Output Language
                  </Label>
                  <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {outputLanguages.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {outputLanguage !== 'en' && (
                    <p className="text-xs text-muted-foreground">
                      Playbook will be generated in {outputLanguages.find(l => l.value === outputLanguage)?.label}. Use the toggle to review in English.
                    </p>
                  )}
                </div>
                {profiles.length > 0 && (
                  <div className="space-y-1.5">
                    <Label>{industryLabels?.organizationProfile || 'Profile'}</Label>
                    <InstitutionalProfileSelector
                      selectedProfileId={selectedProfileId}
                      onProfileChange={(id) => setSelectedProfileId(id)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Playbook Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PlaybookTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="site-visit" className="gap-1.5 text-xs sm:text-sm">
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Site Visit</span>
                <span className="sm:hidden">Visit</span>
              </TabsTrigger>
              <TabsTrigger value="rep-engagement" className="gap-1.5 text-xs sm:text-sm">
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rep Engagement</span>
                <span className="sm:hidden">Reps</span>
              </TabsTrigger>
              <TabsTrigger value="event-coordination" className="gap-1.5 text-xs sm:text-sm">
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Events</span>
                <span className="sm:hidden">Events</span>
              </TabsTrigger>
            </TabsList>

            {/* Site Visit Tab */}
            <TabsContent value="site-visit">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Site Visit Prep & Follow-Up
                  </CardTitle>
                  <CardDescription>Generate a complete site visit playbook with briefing, agenda, and follow-up sequence.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Company / Client Name</Label>
                      <Input placeholder="e.g., Acme Corp" value={visitCompany} onChange={e => setVisitCompany(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Key Contact</Label>
                      <Input placeholder="e.g., Jane Smith, VP Sales" value={visitContact} onChange={e => setVisitContact(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Visit Date</Label>
                      <Input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Visit Objective</Label>
                      <Input placeholder="e.g., QBR, relationship building, upsell" value={visitObjective} onChange={e => setVisitObjective(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Additional Context</Label>
                    <Textarea placeholder="Any notes about this client, recent interactions, deal status..." value={visitNotes} onChange={e => setVisitNotes(e.target.value)} rows={3} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rep Engagement Tab */}
            <TabsContent value="rep-engagement">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Sales Rep Engagement Cadence
                  </CardTitle>
                  <CardDescription>Generate check-in templates, performance nudges, and coaching frameworks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Number of Reps</Label>
                      <Input type="number" placeholder="e.g., 8" value={repCount} onChange={e => setRepCount(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Cadence</Label>
                      <Select value={cadence} onValueChange={setCadence}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Primary Goal</Label>
                      <Input placeholder="e.g., Pipeline growth, brand alignment" value={engagementGoal} onChange={e => setEngagementGoal(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Event Coordination Tab */}
            <TabsContent value="event-coordination">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Regional Event Coordination
                  </CardTitle>
                  <CardDescription>Generate invite sequences, run sheets, and post-event follow-up playbooks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Event Name</Label>
                      <Input placeholder="e.g., Q4 Partner Summit" value={eventName} onChange={e => setEventName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Event Type</Label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client-dinner">Client Dinner</SelectItem>
                          <SelectItem value="product-demo">Product Demo Day</SelectItem>
                          <SelectItem value="networking">Networking Event</SelectItem>
                          <SelectItem value="training">Training Workshop</SelectItem>
                          <SelectItem value="conference">Conference / Summit</SelectItem>
                          <SelectItem value="webinar">Webinar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Event Date</Label>
                      <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Expected Attendees</Label>
                      <Input placeholder="e.g., 25–50" value={expectedAttendees} onChange={e => setExpectedAttendees(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Generate Button */}
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2" size="lg">
            <Sparkles className="w-4 h-4" />
            {isGenerating
              ? 'Generating Playbook...'
              : activeTab === 'site-visit' ? 'Generate Site Visit Playbook'
              : activeTab === 'rep-engagement' ? 'Generate Rep Engagement Plan'
              : 'Generate Event Playbook'}
            <AIBadge />
          </Button>

          {/* Generated Content */}
          {generatedContent && (
            <Card className="print:shadow-none print:border-none">
              <CardContent className="pt-6 print:px-0">
                <PlaybookRenderer
                  content={displayContent || generatedContent}
                  title={playbookTitle}
                  outputLanguage={outputLanguage}
                  outputLanguageLabel={outputLanguages.find(l => l.value === outputLanguage)?.label}
                  brandColors={{
                    primary: selectedProfile?.config?.primaryColor || selectedProfile?.config?.accentColor,
                    secondary: selectedProfile?.config?.secondaryColor,
                    tertiary: selectedProfile?.config?.tertiaryColor,
                  }}
                  orgName={selectedProfile?.name}
                  translationToggle={
                    outputLanguage !== 'en' ? (
                      <TranslationToggle
                        originalContent={generatedContent}
                        outputLanguage={outputLanguage}
                        inline={false}
                        onToggle={(content) => setDisplayContent(content)}
                      />
                    ) : undefined
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default RegionalPlaybookPage;
