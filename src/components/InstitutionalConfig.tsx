import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  X, 
  Plus, 
  Building2, 
  Check, 
  Users, 
  MessageSquare, 
  Phone, 
  Globe,
  Calendar,
  FileSignature,
  Megaphone,
  GraduationCap,
  Heart,
  AlertTriangle
} from "lucide-react";
import type { InstitutionalConfig as InstitutionalConfigType } from "@/types/persist";

interface InstitutionalConfigProps {
  config: InstitutionalConfigType;
  onChange: (config: InstitutionalConfigType) => void;
}

export function InstitutionalConfig({ config, onChange }: InstitutionalConfigProps) {
  const [inputs, setInputs] = useState({
    buildingName: '',
    programName: '',
    supportCenter: '',
    slogan: '',
    leaderName: '',
    advisorTitle: '',
    staffTitle: '',
    primaryCTA: '',
    secondaryCTA: '',
    urgentCTA: '',
    websiteLink: '',
    socialHandle: '',
    academicTerm: '',
    gradingTerm: '',
    enrollmentTerm: '',
    signatureTemplate: '',
    toneRule: '',
    wordToAvoid: '',
    preferredPhrase: '',
    dateLabel: '',
    datePlaceholder: '',
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

  const addImportantDate = () => {
    if (!inputs.dateLabel.trim() || !inputs.datePlaceholder.trim()) return;
    const currentDates = config.importantDates || [];
    onChange({
      ...config,
      importantDates: [...currentDates, { label: inputs.dateLabel, placeholder: inputs.datePlaceholder }]
    });
    setInputs({ ...inputs, dateLabel: '', datePlaceholder: '' });
  };

  const removeImportantDate = (label: string) => {
    const currentDates = config.importantDates || [];
    onChange({ ...config, importantDates: currentDates.filter(d => d.label !== label) });
  };

  const renderArrayField = (
    label: string,
    field: keyof InstitutionalConfigType,
    inputKey: keyof typeof inputs,
    placeholder: string,
    hint?: string
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
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
    <div className="space-y-6">
      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full mb-6">
          <TabsTrigger value="identity" className="text-xs">Identity</TabsTrigger>
          <TabsTrigger value="people" className="text-xs">People</TabsTrigger>
          <TabsTrigger value="ctas" className="text-xs">CTAs</TabsTrigger>
          <TabsTrigger value="terms" className="text-xs">Terms</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
        </TabsList>

          {/* Identity Tab */}
          <TabsContent value="identity" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Institution Name</Label>
                <Input
                  value={config.institutionName || ''}
                  onChange={(e) => onChange({ ...config, institutionName: e.target.value })}
                  placeholder="e.g., Lakewood University"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Mascot / Nickname</Label>
                <Input
                  value={config.mascot || ''}
                  onChange={(e) => onChange({ ...config, mascot: e.target.value })}
                  placeholder="e.g., Griffins"
                />
              </div>
            </div>
            
            {renderArrayField('Slogans & Spirit Phrases', 'slogans', 'slogan', 'e.g., Go Griffins!', 'Phrases used in communications to build school spirit')}
            {renderArrayField('Building & Facility Names', 'buildingNames', 'buildingName', 'e.g., Student Success Center', 'Official names for buildings referenced in messages')}
            {renderArrayField('Program Names', 'programNames', 'programName', 'e.g., First-Year Experience Program', 'Academic and support program names')}
            {renderArrayField('Support Centers', 'supportCenters', 'supportCenter', 'e.g., Writing Center, Math Tutoring Lab', 'Student support resources to reference')}
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="contact">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Information
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Primary Contact Email</Label>
                      <Input
                        value={config.primaryContactEmail || ''}
                        onChange={(e) => onChange({ ...config, primaryContactEmail: e.target.value })}
                        placeholder="e.g., success@university.edu"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Primary Contact Phone</Label>
                      <Input
                        value={config.primaryContactPhone || ''}
                        onChange={(e) => onChange({ ...config, primaryContactPhone: e.target.value })}
                        placeholder="e.g., (555) 123-4567"
                      />
                    </div>
                  </div>
                  {renderArrayField('Website Links', 'websiteLinks', 'websiteLink', 'e.g., advising.university.edu')}
                  {renderArrayField('Social Media Handles', 'socialMediaHandles', 'socialHandle', 'e.g., @UKStudentSuccess')}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* People Tab */}
          <TabsContent value="people" className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                Naming Conventions
              </h4>
              <p className="text-xs text-muted-foreground">How should messages address students and staff?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Student Addressing</Label>
                <Select
                  value={config.studentAddressing || 'first-name'}
                  onValueChange={(value: 'first-name' | 'full-name' | 'formal') => 
                    onChange({ ...config, studentAddressing: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first-name">First Name (e.g., "Hi Sarah")</SelectItem>
                    <SelectItem value="full-name">Full Name (e.g., "Dear Sarah Johnson")</SelectItem>
                    <SelectItem value="formal">Formal (e.g., "Dear Student")</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Staff Addressing</Label>
                <Select
                  value={config.staffAddressing || 'first-name'}
                  onValueChange={(value: 'first-name' | 'title-last' | 'full-title') => 
                    onChange({ ...config, staffAddressing: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first-name">First Name (e.g., "from John")</SelectItem>
                    <SelectItem value="title-last">Title + Last (e.g., "Dr. Smith")</SelectItem>
                    <SelectItem value="full-title">Full Title (e.g., "Dean John Smith")</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Pronoun Preference</Label>
                <Select
                  value={config.pronounPreference || 'they'}
                  onValueChange={(value: 'they' | 'he-she' | 'avoid') => 
                    onChange({ ...config, pronounPreference: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="they">They/Them (inclusive)</SelectItem>
                    <SelectItem value="he-she">He/She (traditional)</SelectItem>
                    <SelectItem value="avoid">Avoid pronouns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {renderArrayField('Leader Names & Titles', 'leaderNames', 'leaderName', 'e.g., President Dr. Eli Capilouto', 'Key leaders students should know')}
            {renderArrayField('Advisor Titles', 'advisorTitles', 'advisorTitle', 'e.g., Academic Advisor, Success Coach', 'How advisors are titled at your institution')}
            {renderArrayField('Staff Role Titles', 'staffTitles', 'staffTitle', 'e.g., Peer Mentor, Resident Advisor', 'Common staff roles referenced in messages')}
            
            {renderArrayField('Signature Templates', 'signatureTemplates', 'signatureTemplate', 'e.g., "Your Student Success Team"', 'Standard message sign-offs')}
          </TabsContent>

          {/* CTAs Tab */}
          <TabsContent value="ctas" className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <Megaphone className="w-4 h-4" />
                Call-to-Action Library
              </h4>
              <p className="text-xs text-muted-foreground">Pre-approved CTAs ensure consistent, on-brand messaging across all communications.</p>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                {renderArrayField(
                  'Primary CTAs', 
                  'primaryCTAs', 
                  'primaryCTA', 
                  'e.g., Schedule your advising appointment today',
                  'Main action you want students to take'
                )}
              </div>
              
              <div className="border-l-4 border-secondary pl-4">
                {renderArrayField(
                  'Secondary CTAs', 
                  'secondaryCTAs', 
                  'secondaryCTA', 
                  'e.g., Learn more about available resources',
                  'Supporting actions or alternatives'
                )}
              </div>
              
              <div className="border-l-4 border-destructive pl-4">
                {renderArrayField(
                  'Urgent CTAs', 
                  'urgentCTAs', 
                  'urgentCTA', 
                  'e.g., Act now — deadline is this Friday!',
                  'Time-sensitive or critical actions'
                )}
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="dates">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Important Date Placeholders
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p className="text-xs text-muted-foreground">Define date placeholders that can be used in messages (e.g., {"{{registration_deadline}}"})</p>
                  <div className="flex gap-2">
                    <Input
                      value={inputs.dateLabel}
                      onChange={(e) => setInputs({ ...inputs, dateLabel: e.target.value })}
                      placeholder="Label (e.g., Registration Deadline)"
                      className="flex-1"
                    />
                    <Input
                      value={inputs.datePlaceholder}
                      onChange={(e) => setInputs({ ...inputs, datePlaceholder: e.target.value })}
                      placeholder="Placeholder (e.g., {{registration_deadline}})"
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addImportantDate}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(config.importantDates || []).map((date) => (
                      <div key={date.label} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{date.label}</Badge>
                          <code className="text-xs bg-background px-2 py-0.5 rounded">{date.placeholder}</code>
                        </div>
                        <button onClick={() => removeImportantDate(date.label)} className="hover:text-destructive">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* Terms Tab */}
          <TabsContent value="terms" className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4" />
                Academic Terminology
              </h4>
              <p className="text-xs text-muted-foreground">Institution-specific terms to use in generated messages.</p>
            </div>

            {renderArrayField(
              'Academic Terms', 
              'academicTerms', 
              'academicTerm', 
              'e.g., credit hours, full-time status, prerequisite',
              'Common academic vocabulary at your institution'
            )}
            
            {renderArrayField(
              'Grading Terms', 
              'gradingTerms', 
              'gradingTerm', 
              'e.g., midterm grade, GPA, academic standing',
              'Grading-related terminology'
            )}
            
            {renderArrayField(
              'Enrollment Terms', 
              'enrollmentTerms', 
              'enrollmentTerm', 
              'e.g., add/drop period, waitlist, course load',
              'Registration and enrollment language'
            )}
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4" />
                Tone & Voice Guidelines
              </h4>
              <p className="text-xs text-muted-foreground">Define the personality and boundaries of your institutional voice.</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              {renderArrayField(
                'Preferred Phrases', 
                'preferredPhrases', 
                'preferredPhrase', 
                'e.g., "We\'re here to support you"',
                'Phrases that reflect your institutional voice'
              )}
            </div>

            {renderArrayField(
              'Tone Rules', 
              'toneRules', 
              'toneRule', 
              'e.g., Use encouraging language, avoid jargon',
              'Guidelines for message tone'
            )}
            
            <div className="border-l-4 border-amber-500 pl-4">
              {renderArrayField(
                'Words to Avoid', 
                'wordsToAvoid', 
                'wordToAvoid', 
                'e.g., mandatory, must, failure',
                'Terms that should not appear in messages'
              )}
            </div>
          </TabsContent>
        </Tabs>

        {hasConfig && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mt-6">
            <Check className="w-4 h-4 text-green-600" />
            <span>Institutional settings will personalize all message outputs.</span>
          </div>
        )}
      </div>
  );
}
