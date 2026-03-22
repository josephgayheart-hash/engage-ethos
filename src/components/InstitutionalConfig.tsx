import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCustomOverlays } from "@/hooks/useCustomOverlays";
import { Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useContentDNA } from "@/hooks/useContentDNA";
import { supabase } from "@/integrations/supabase/client";
import { extractTextFromFile, getAcceptString } from "@/lib/documentParser";
import { ConfigTextField } from "@/components/ui/config-text-field";
import { 
  QuickAddTerms, 
  COMMON_ACADEMIC_TERMS, 
  COMMON_GRADING_TERMS, 
  COMMON_ENROLLMENT_TERMS 
} from "@/components/config/QuickAddTerms";
import { 
  X, 
  Plus, 
  Check, 
  Users, 
  Phone, 
  Calendar,
  Megaphone,
  GraduationCap,
  Heart,
  Monitor,
  MapPin,
  Building,
  Clock,
  Mic,
  Sparkles,
  Loader2,
  FileText,
  Trash2,
  Upload,
  ExternalLink,
  Dna,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon
} from "lucide-react";
import type { InstitutionalConfig as InstitutionalConfigType, VoiceAnalysis } from "@/types/campusvoice";
import { useAuth } from "@/contexts/AuthContext";
import { useIndustry } from "@/contexts/IndustryContext";

interface InstitutionalConfigProps {
  config: InstitutionalConfigType;
  onChange: (config: InstitutionalConfigType) => void;
  profileId?: string;
}

export function InstitutionalConfig({ config, onChange, profileId }: InstitutionalConfigProps) {
  const { toast } = useToast();
  const { tenant } = useAuth();
  const { vocabulary, isHigherEd } = useIndustry();
  const relevantFields = new Set(vocabulary.relevantConfigFields);
  const { analysis, samples, isLoading: isContentDNALoading } = useContentDNA({ profileId });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [sampleInput, setSampleInput] = useState('');
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
    campusTerm: '',
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

  // Generic logo upload handler for any logo field
  const handleLogoUploadForField = async (event: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'logoUrlSecondary' | 'logoUrlAthletic' | 'logoUrlPresidential') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Logo must be under 2MB",
      });
      return;
    }

    setIsUploadingLogo(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const suffix = field === 'logoUrlSecondary' ? '-secondary' : field === 'logoUrlAthletic' ? '-athletic' : field === 'logoUrlPresidential' ? '-presidential' : '';
      const fileName = `${tenant?.id || 'unknown'}/profile-${profileId || 'default'}-logo${suffix}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      onChange({ ...config, [field]: publicUrl });

      toast({
        title: "Logo uploaded",
        description: "Your profile logo has been updated.",
      });
    } catch (error) {
      console.error("Logo upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Could not upload logo. Please try again.",
      });
    } finally {
      setIsUploadingLogo(false);
      event.target.value = '';
    }
  };

  // Convenience wrapper for primary logo
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => handleLogoUploadForField(event, 'logoUrl');

  const handleRemoveLogo = () => {
    onChange({ ...config, logoUrl: undefined });
    toast({
      title: "Logo removed",
      description: "Profile will use the institution logo instead.",
    });
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

  const addVoiceSample = () => {
    const value = sampleInput.trim();
    if (!value) return;
    
    const currentSamples = config.brandVoiceSamples || [];
    onChange({ ...config, brandVoiceSamples: [...currentSamples, value] });
    setSampleInput('');
    toast({
      title: "Sample added",
      description: "Voice sample has been added. Analyze samples to update your voice profile.",
    });
  };

  const removeVoiceSample = (index: number) => {
    const currentSamples = config.brandVoiceSamples || [];
    const newSamples = currentSamples.filter((_, i) => i !== index);
    onChange({ ...config, brandVoiceSamples: newSamples });
  };

  const analyzeVoiceSamples = async () => {
    const samples = config.brandVoiceSamples || [];
    if (samples.length === 0) {
      toast({
        title: "No samples",
        description: "Please add at least one sample communication before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-voice', {
        body: { samples }
      });

      if (error) throw error;

      onChange({ ...config, voiceAnalysis: data as VoiceAnalysis });
      toast({
        title: "Analysis complete",
        description: "Your brand voice profile has been extracted and will be applied to all message generation.",
      });
    } catch (error) {
      console.error('Voice analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze voice samples",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearVoiceAnalysis = () => {
    onChange({ ...config, voiceAnalysis: undefined });
    toast({
      title: "Voice profile cleared",
      description: "Voice analysis has been removed. Add samples and re-analyze to create a new profile.",
    });
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

  // Callback for updating a single text field
  const handleTextFieldUpdate = useCallback((fieldKey: string, value: string) => {
    onChange({ ...config, [fieldKey]: value });
  }, [config, onChange]);

  // Helper to add a term directly (used by QuickAddTerms)
  const addTermDirectly = useCallback((field: keyof InstitutionalConfigType, term: string) => {
    const currentArray = (config[field] as string[]) || [];
    if (!currentArray.includes(term)) {
      onChange({ ...config, [field]: [...currentArray, term] });
    }
  }, [config, onChange]);

  const renderTextField = (
    label: string,
    field: keyof InstitutionalConfigType,
    placeholder: string,
    hint?: string
  ) => (
    <ConfigTextField 
      label={label} 
      fieldKey={field}
      value={(config[field] as string) || ''}
      placeholder={placeholder} 
      hint={hint}
      onUpdate={handleTextFieldUpdate}
    />
  );

  const hasConfig = Object.values(config).some(v => 
    (Array.isArray(v) && v.length > 0) || (typeof v === 'string' && v.length > 0)
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="identity" className="w-full">
        <TabsList className={`grid w-full mb-6 ${
          !relevantFields.has('academicTerms') && !relevantFields.has('campusTerms') 
            ? 'grid-cols-3 md:grid-cols-6' 
            : !relevantFields.has('academicTerms') || !relevantFields.has('campusTerms')
              ? 'grid-cols-4 md:grid-cols-7'
              : 'grid-cols-4 md:grid-cols-8'
        }`}>
          <TabsTrigger value="identity" className="text-xs">Identity</TabsTrigger>
          <TabsTrigger value="systems" className="text-xs">Systems</TabsTrigger>
          {relevantFields.has('campusTerms') && (
            <TabsTrigger value="locations" className="text-xs">Locations</TabsTrigger>
          )}
          <TabsTrigger value="people" className="text-xs">People</TabsTrigger>
          <TabsTrigger value="ctas" className="text-xs">CTAs</TabsTrigger>
          {relevantFields.has('academicTerms') && (
            <TabsTrigger value="terms" className="text-xs">Terms</TabsTrigger>
          )}
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
          <TabsTrigger value="voice" className="text-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Content DNA
          </TabsTrigger>
        </TabsList>

        {/* Identity Tab */}
        <TabsContent value="identity" className="space-y-6">
          {/* Profile Logo Section */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {config.logoUrl ? (
                  <div className="relative">
                    <img
                      src={config.logoUrl}
                      alt="Profile logo"
                      className="w-20 h-20 object-contain rounded-lg border border-border bg-white p-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={handleRemoveLogo}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <label
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-background"
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                    />
                  </label>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Profile Logo
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a custom logo for this profile. If not set, the institution logo will be used.
                </p>
                {!config.logoUrl && (
                  <label className="inline-block mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingLogo}
                      asChild
                    >
                      <span className="cursor-pointer">
                        {isUploadingLogo ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Logo
                          </>
                        )}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Alternate Logo Variants */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-1">
              <ImageIcon className="w-4 h-4" />
              Additional Logo Variants
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Upload alternate logo versions for use in branded image overlays and social graphics. These are optional.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {([
                { field: 'logoUrlSecondary' as const, label: 'Secondary Logo', desc: 'Horizontal, stacked, or reversed variant' },
                ...(isHigherEd
                  ? [
                      { field: 'logoUrlAthletic' as const, label: 'Athletic Mark', desc: 'Team logo or athletics identity' },
                      { field: 'logoUrlPresidential' as const, label: 'Presidential Mark', desc: 'Presidential seal or mark' },
                    ]
                  : [
                      { field: 'logoUrlAthletic' as const, label: 'Icon / Favicon', desc: 'App icon, favicon, or compact mark' },
                      { field: 'logoUrlPresidential' as const, label: 'Executive Mark', desc: 'Leadership or corporate seal' },
                    ]
                ),
              ]).map((logo) => {
                const url = config[logo.field] as string | undefined;
                return (
                  <div key={logo.field} className="space-y-1.5">
                    <Label className="text-xs font-medium">{logo.label}</Label>
                    <p className="text-[10px] text-muted-foreground">{logo.desc}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {url ? (
                        <div className="relative">
                          <img src={url} alt={logo.label} className="w-14 h-14 object-contain rounded border border-border bg-white p-1" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-1.5 -right-1.5 h-5 w-5"
                            onClick={() => {
                              onChange({ ...config, [logo.field]: undefined });
                              toast({ title: `${logo.label} removed` });
                            }}
                          >
                            <X className="w-2.5 h-2.5" />
                          </Button>
                        </div>
                      ) : (
                        <label className="w-14 h-14 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-background">
                          {isUploadingLogo ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Upload className="w-4 h-4 text-muted-foreground" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleLogoUploadForField(e, logo.field)}
                            disabled={isUploadingLogo}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Overlay Patterns */}
          <CustomOverlayUploadSection profileId={profileId} tenantId={tenant?.id} />

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
              <span className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-accent" />
              Brand Colors
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Define your institution's official brand colors. These will be used in all message outputs, PDFs, and exports.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Color */}
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-sm font-medium">
                  Primary Color
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="primaryColor"
                    value={config.primaryColor || '#1F2A44'}
                    onChange={(e) => onChange({ ...config, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={config.primaryColor || '#1F2A44'}
                    onChange={(e) => onChange({ ...config, primaryColor: e.target.value })}
                    placeholder="#1F2A44"
                    className="font-mono text-sm flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Main brand color for headers</p>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <Label htmlFor="secondaryColor" className="text-sm font-medium">
                  Secondary Color
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={config.secondaryColor || config.accentColor || '#2C7A7B'}
                    onChange={(e) => onChange({ ...config, secondaryColor: e.target.value, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={config.secondaryColor || config.accentColor || '#2C7A7B'}
                    onChange={(e) => onChange({ ...config, secondaryColor: e.target.value, accentColor: e.target.value })}
                    placeholder="#2C7A7B"
                    className="font-mono text-sm flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Supporting color for accents</p>
              </div>

              {/* Tertiary Color */}
              <div className="space-y-2">
                <Label htmlFor="tertiaryColor" className="text-sm font-medium">
                  Tertiary Color
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="tertiaryColor"
                    value={config.tertiaryColor || '#D4AF37'}
                    onChange={(e) => onChange({ ...config, tertiaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={config.tertiaryColor || '#D4AF37'}
                    onChange={(e) => onChange({ ...config, tertiaryColor: e.target.value })}
                    placeholder="#D4AF37"
                    className="font-mono text-sm flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Accent for special elements</p>
              </div>
            </div>
            
            {/* Color Preview */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">Preview:</span>
              <div 
                className="w-8 h-8 rounded border border-border" 
                style={{ backgroundColor: config.primaryColor || '#1F2A44' }}
                title="Primary"
              />
              <div 
                className="w-8 h-8 rounded border border-border" 
                style={{ backgroundColor: config.secondaryColor || config.accentColor || '#2C7A7B' }}
                title="Secondary"
              />
              <div 
                className="w-8 h-8 rounded border border-border" 
                style={{ backgroundColor: config.tertiaryColor || '#D4AF37' }}
                title="Tertiary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderTextField('Institution Name', 'institutionName', 'e.g., Lakewood University')}
            {renderTextField('Abbreviation', 'institutionAbbreviation', 'e.g., LU, LWU')}
            {renderTextField('Mascot / Nickname', 'mascot', 'e.g., Griffins')}
          </div>
          
          {renderArrayField('Slogans & Spirit Phrases', 'slogans', 'slogan', 'e.g., Go Griffins!', 'Phrases used in communications to build school spirit')}
          
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
                  {renderTextField('Email Domain', 'emailDomain', 'e.g., @university.edu')}
                  {renderTextField('Primary Contact Email', 'primaryContactEmail', 'e.g., success@university.edu')}
                  {renderTextField('Primary Contact Phone', 'primaryContactPhone', 'e.g., (555) 123-4567')}
                  {renderTextField('Advising Email', 'advisingEmail', 'e.g., advising@university.edu')}
                  {renderTextField('General Help Email', 'generalHelpEmail', 'e.g., help@university.edu')}
                  {renderTextField('Emergency Phone', 'emergencyPhone', 'e.g., (555) 911-0000')}
                  {renderTextField('Text Alert Number', 'textAlertNumber', 'e.g., 55555')}
                  {renderTextField('Appointment Booking Link', 'appointmentLink', 'e.g., calendly.com/advising')}
                </div>
                {renderArrayField('Website Links', 'websiteLinks', 'websiteLink', 'e.g., advising.lakewood.edu')}
                {renderArrayField('Social Media Handles', 'socialMediaHandles', 'socialHandle', 'e.g., @LakewoodSuccess')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Systems Tab */}
        <TabsContent value="systems" className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <Monitor className="w-4 h-4" />
              Digital Platforms & Systems
            </h4>
            <p className="text-xs text-muted-foreground">Names of systems students interact with - AI will reference these in messages.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTextField('Student Portal Name', 'portalName', 'e.g., MyUniversity Portal, Student Hub')}
            {renderTextField('LMS Name', 'lmsName', 'e.g., Canvas, Blackboard, Moodle')}
            {renderTextField('Advising System', 'advisingSystemName', 'e.g., Navigate, Starfish, EAB')}
            {renderTextField('Scheduling System', 'schedulingSystemName', 'e.g., Calendly, Bookings, AppointmentPlus')}
            {renderTextField('Degree Audit System', 'degreeAuditSystem', 'e.g., DegreeWorks, Stellic')}
            {renderTextField('Financial Aid Portal', 'financialAidPortal', 'e.g., Financial Aid Self-Service')}
            {renderTextField('Registration System', 'registrationSystem', 'e.g., Student Registration Portal')}
            {renderTextField('Virtual Meeting Platform', 'virtualMeetingPlatform', 'e.g., Zoom, Teams, Google Meet')}
          </div>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              Campus Locations & Offices
            </h4>
            <p className="text-xs text-muted-foreground">Physical locations and office names to include in messages.</p>
          </div>

          {renderArrayField('Building Names', 'buildingNames', 'buildingName', 'e.g., Student Success Center', 'Official names for buildings')}
          {renderArrayField('Program Names', 'programNames', 'programName', 'e.g., First-Year Experience Program')}
          {renderArrayField('Support Centers', 'supportCenters', 'supportCenter', 'e.g., Writing Center, Math Lab')}
          {renderArrayField('Campus Terms', 'campusTerms', 'campusTerm', 'e.g., quad, commons, student union', 'Local campus geography terms')}
          
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="centers">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Specific Center Names
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextField('Library', 'libraryName', 'e.g., Whitman Library')}
                  {renderTextField('Tutoring Center', 'tutorCenter', 'e.g., Academic Support Center')}
                  {renderTextField('Writing Center', 'writingCenter', 'e.g., Writing Resource Center')}
                  {renderTextField('Math Center', 'mathCenter', 'e.g., Math Tutoring Lab')}
                  {renderTextField('Career Center', 'careerCenter', 'e.g., Career Development Center')}
                  {renderTextField('Counseling Center', 'counselingCenter', 'e.g., Counseling & Psychological Services')}
                  {renderTextField('Health Center', 'healthCenter', 'e.g., Student Health Services')}
                  {renderTextField('Fitness Center', 'fitnessCenter', 'e.g., Recreation Center, The Rec')}
                  {renderTextField('Dining Hall', 'diningHall', 'e.g., Main Dining Hall, The Commons')}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="offices">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Administrative Offices
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextField('Registrar Office', 'registrarOffice', 'e.g., Office of the Registrar')}
                  {renderTextField('Financial Aid Office', 'financialAidOffice', 'e.g., Financial Aid & Scholarships')}
                  {renderTextField('Admissions Office', 'admissionsOffice', 'e.g., Office of Undergraduate Admissions')}
                  {renderTextField('Bursar Office', 'bursarOffice', 'e.g., Bursar & Student Accounts')}
                  {renderTextField('IT Help Desk', 'itHelpDesk', 'e.g., IT Service Desk, Tech Support')}
                  {renderTextField('Housing Office', 'housingOffice', 'e.g., Residence Life, Housing Services')}
                  {renderTextField('Student Affairs', 'studentAffairsOffice', 'e.g., Dean of Students Office')}
                  {renderTextField('International Office', 'internationalOffice', 'e.g., International Student Services')}
                  {renderTextField('Disability Services', 'disabilityServices', 'e.g., Accessibility Resource Center')}
                  {renderTextField('Veterans Services', 'veteransServices', 'e.g., Veterans Resource Center')}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="meeting">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Meeting & Scheduling
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextField('Default Meeting Location', 'defaultMeetingLocation', 'e.g., Advising Center, Room 200')}
                  {renderTextField('Office Hours Format', 'officeHoursFormat', 'e.g., Monday-Friday 8am-5pm')}
                  {renderTextField('Time Zone', 'timeZone', 'e.g., Eastern Time (ET)')}
                </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <SelectItem value="first-name">First Name (Hi Sarah)</SelectItem>
                  <SelectItem value="full-name">Full Name (Dear Sarah Johnson)</SelectItem>
                  <SelectItem value="formal">Formal (Dear Student)</SelectItem>
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
                  <SelectItem value="first-name">First Name (from John)</SelectItem>
                  <SelectItem value="title-last">Title + Last (Dr. Smith)</SelectItem>
                  <SelectItem value="full-title">Full Title (Dean John Smith)</SelectItem>
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
            {renderTextField('Student ID Term', 'studentIdTerm', 'e.g., Student ID, Banner ID')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTextField('Default Advisor Name (placeholder)', 'defaultAdvisorName', 'e.g., Your Academic Advisor')}
          </div>

          {renderArrayField('Leader Names & Titles', 'leaderNames', 'leaderName', 'e.g., President Dr. Jane Smith', 'Key leaders students should know')}
          {renderArrayField('Advisor Titles', 'advisorTitles', 'advisorTitle', 'e.g., Academic Advisor, Success Coach', 'How advisors are titled')}
          {renderArrayField('Staff Role Titles', 'staffTitles', 'staffTitle', 'e.g., Peer Mentor, Resident Advisor', 'Common staff roles')}
          {renderArrayField('Signature Templates', 'signatureTemplates', 'signatureTemplate', 'e.g., Your Student Success Team', 'Standard message sign-offs')}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTextField('Current Term Name', 'currentTermName', 'e.g., Spring 2025')}
            {renderTextField('Next Term Name', 'nextTermName', 'e.g., Fall 2025')}
          </div>

          <div className="space-y-2">
            {renderArrayField(
              'Academic Terms', 
              'academicTerms', 
              'academicTerm', 
              'e.g., credit hours, full-time status, prerequisite',
              'Common academic vocabulary at your institution'
            )}
            <QuickAddTerms
              terms={COMMON_ACADEMIC_TERMS}
              currentValues={(config.academicTerms as string[]) || []}
              onAdd={(term) => addTermDirectly('academicTerms', term)}
            />
          </div>
          
          <div className="space-y-2">
            {renderArrayField(
              'Grading Terms', 
              'gradingTerms', 
              'gradingTerm', 
              'e.g., midterm grade, GPA, academic standing',
              'Grading-related terminology'
            )}
            <QuickAddTerms
              terms={COMMON_GRADING_TERMS}
              currentValues={(config.gradingTerms as string[]) || []}
              onAdd={(term) => addTermDirectly('gradingTerms', term)}
            />
          </div>
          
          <div className="space-y-2">
            {renderArrayField(
              'Enrollment Terms', 
              'enrollmentTerms', 
              'enrollmentTerm', 
              'e.g., add/drop period, waitlist, course load',
              'Registration and enrollment language'
            )}
            <QuickAddTerms
              terms={COMMON_ENROLLMENT_TERMS}
              currentValues={(config.enrollmentTerms as string[]) || []}
              onAdd={(term) => addTermDirectly('enrollmentTerms', term)}
            />
          </div>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4" />
              Tone & Voice Guidelines
            </h4>
            <p className="text-xs text-muted-foreground">Define the voice and style for all communications.</p>
          </div>

          {renderArrayField(
            'Preferred Phrases', 
            'preferredPhrases', 
            'preferredPhrase', 
            'e.g., "We are here to support you", "Your success matters"',
            'Phrases to encourage in messaging'
          )}
          
          {renderArrayField(
            'Tone Guidelines', 
            'toneRules', 
            'toneRule', 
            'e.g., Always be encouraging, Avoid jargon',
            'Rules for maintaining consistent tone'
          )}
          
          {renderArrayField(
            'Words to Avoid', 
            'wordsToAvoid', 
            'wordToAvoid', 
            'e.g., mandatory, must, failure',
            'Terms that should not appear in messages'
          )}
        </TabsContent>

        {/* Content DNA Tab */}
        <TabsContent value="voice" className="space-y-6">
          {isContentDNALoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : analysis?.voice_analysis ? (
            // Content DNA is configured - show status and summary
            <div className="space-y-6">
              {/* Active Status Banner */}
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-400">Content DNA Active</h4>
                    <p className="text-xs text-green-700 dark:text-green-500">
                      Your institution's voice profile is being applied to all AI-generated messages
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-muted/30 overflow-hidden">
                  <CardContent className="p-3 text-center">
                    <div className="text-lg sm:text-xl font-bold text-primary truncate">{samples.length}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Content Samples</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 overflow-hidden">
                  <CardContent className="p-3 text-center">
                    <div className="text-sm sm:text-base font-bold text-primary truncate leading-tight" title={analysis.voice_analysis.overallTone || ''}>
                      {analysis.voice_analysis.overallTone?.split(' ').slice(0, 2).join(' ') || 'Active'}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Overall Tone</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 overflow-hidden">
                  <CardContent className="p-3 text-center">
                    <div className="text-sm sm:text-base font-bold text-primary truncate leading-tight" title={analysis.voice_analysis.formalityLevel || ''}>
                      {analysis.voice_analysis.formalityLevel?.split(' ').slice(0, 2).join(' ') || 'Set'}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Formality</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 overflow-hidden">
                  <CardContent className="p-3 text-center">
                    <div className="text-sm sm:text-base font-bold text-primary truncate leading-tight">
                      {analysis.last_analyzed_at 
                        ? new Date(analysis.last_analyzed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'Recent'}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Last Analyzed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Voice Summary */}
              {analysis.voice_analysis.summary && (
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Voice Profile Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis.voice_analysis.summary}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Key Characteristics Preview */}
              {analysis.voice_analysis.keyCharacteristics && analysis.voice_analysis.keyCharacteristics.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Key Characteristics
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.voice_analysis.keyCharacteristics.slice(0, 6).map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-xs font-normal">
                        {item}
                      </Badge>
                    ))}
                    {analysis.voice_analysis.keyCharacteristics.length > 6 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        +{analysis.voice_analysis.keyCharacteristics.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Link to Full Content DNA Page */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Dna className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Manage Content DNA</h4>
                        <p className="text-xs text-muted-foreground">
                          Upload new samples, view full analysis, and update brand guidelines
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm">
                      <Link to={profileId ? `/admin/content-dna?profileId=${profileId}` : "/admin/content-dna"}>
                        Open Content DNA
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Content DNA not configured - show setup prompt
            <div className="space-y-6">
              {/* Setup Prompt */}
              <Card className="border-2 border-dashed border-primary/40">
                <CardContent className="py-10">
                  <div className="text-center max-w-md mx-auto">
                    <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                      <Dna className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold mb-2">Set Up Content DNA</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Content DNA captures your institution's unique voice and communication style. 
                      Upload sample communications and let AI analyze your patterns, tone, and vocabulary.
                    </p>
                    
                    {/* Benefits List */}
                    <div className="grid gap-2 text-left mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <span>AI-generated messages match your brand voice</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <span>Consistent tone across all communications</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <span>Custom vocabulary and phrase patterns</span>
                      </div>
                    </div>
                    
                    <Button asChild size="lg" className="gap-2">
                      <Link to={profileId ? `/admin/content-dna?profileId=${profileId}` : "/admin/content-dna"}>
                        <Sparkles className="w-4 h-4" />
                        Configure Content DNA
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Info Note */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">What happens without Content DNA?</p>
                  <p>
                    AI-generated messages will use general best practices. Setting up Content DNA ensures 
                    outputs are tailored to your institution's specific voice and style guidelines.
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {hasConfig && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mt-6">
          <Check className="w-4 h-4 text-green-600" />
          <span>Institutional settings will personalize all AI-generated message outputs.</span>
        </div>
      )}
    </div>
  );
}

// ── Custom Overlay Upload Section ──
function CustomOverlayUploadSection({ profileId, tenantId }: { profileId?: string; tenantId?: string }) {
  const {
    overlays,
    isUploading,
    canUploadMore,
    selfServiceCount,
    selfServiceLimit,
    uploadOverlay,
    deleteOverlay,
  } = useCustomOverlays(profileId);
  const { toast } = useToast();
  const [overlayName, setOverlayName] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "Invalid file", description: "Please upload a PNG, SVG, or JPG file." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Overlay must be under 2MB." });
      return;
    }

    const name = overlayName.trim() || file.name.replace(/\.[^.]+$/, '');
    const result = await uploadOverlay(file, name, profileId);
    if (result) {
      toast({ title: "Pattern uploaded", description: `"${result.name}" is now available in Image Studio.` });
      setOverlayName('');
    } else {
      toast({ variant: "destructive", title: "Upload failed", description: "Could not upload pattern." });
    }
    e.target.value = '';
  };

  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <h4 className="font-medium text-sm flex items-center gap-2 mb-1">
        <Layers className="w-4 h-4" />
        Custom Brand Patterns
      </h4>
      <p className="text-xs text-muted-foreground mb-3">
        Upload custom overlay patterns (PNG/SVG) that will appear in Image Studio alongside built-in styles.
        <span className="font-medium"> {selfServiceCount}/{selfServiceLimit} slots used.</span>
        {' '}Need more? Contact us about our premium Brand Pattern Pack service.
      </p>

      {/* Existing overlays */}
      {overlays.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {overlays.map((o) => (
            <div key={o.id} className="relative group">
              <img
                src={o.fileUrl}
                alt={o.name}
                className="w-full aspect-square object-cover rounded-md border border-border"
              />
              <span className="text-[9px] text-center block mt-0.5 truncate">{o.name}</span>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-1.5 -right-1.5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  deleteOverlay(o.id);
                  toast({ title: "Pattern removed" });
                }}
              >
                <X className="w-2.5 h-2.5" />
              </Button>
              {o.source === 'concierge' && (
                <Badge variant="secondary" className="absolute top-0.5 left-0.5 text-[7px] px-1 py-0">Premium</Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload control */}
      {canUploadMore && (
        <div className="flex gap-2">
          <Input
            placeholder="Pattern name (optional)"
            value={overlayName}
            onChange={(e) => setOverlayName(e.target.value)}
            className="flex-1 h-8 text-xs"
          />
          <label>
            <Button type="button" variant="outline" size="sm" disabled={isUploading} asChild>
              <span className="cursor-pointer">
                {isUploading ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Uploading...</>
                ) : (
                  <><Upload className="w-3.5 h-3.5 mr-1.5" />Upload Pattern</>
                )}
              </span>
            </Button>
            <input type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      )}
    </div>
  );
}
