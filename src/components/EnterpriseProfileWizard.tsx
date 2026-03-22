import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useIndustry } from '@/contexts/IndustryContext';
import type { InstitutionalConfig } from '@/types/campusvoice';
import {
  Building2,
  Globe,
  MapPin,
  Layers,
  ChevronRight,
  ChevronLeft,
  Check,
  Languages,
} from 'lucide-react';

interface EnterpriseProfileWizardProps {
  onComplete: (name: string, config: InstitutionalConfig, profileType: string) => Promise<void>;
  onCancel: () => void;
  parentProfileId?: string | null;
  parentProfileName?: string | null;
}

type EnterpriseLevel = 'headquarters' | 'region' | 'division' | 'location';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const REGIONS = [
  { id: 'north-america', label: 'North America' },
  { id: 'latin-america', label: 'Latin America (LATAM)' },
  { id: 'europe', label: 'Europe (EMEA)' },
  { id: 'asia-pacific', label: 'Asia-Pacific (APAC)' },
  { id: 'middle-east', label: 'Middle East & Africa' },
  { id: 'global', label: 'Global' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'zh', label: 'Chinese (Mandarin)' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'it', label: 'Italian' },
  { code: 'ru', label: 'Russian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'sv', label: 'Swedish' },
  { code: 'th', label: 'Thai' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'tl', label: 'Tagalog' },
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'America/Mexico_City',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland',
];

const LEVEL_CONFIG: Record<EnterpriseLevel, { label: string; description: string; icon: React.ReactNode; profileType: string }> = {
  headquarters: {
    label: 'Headquarters (HQ)',
    description: 'Global or national corporate headquarters',
    icon: <Building2 className="w-5 h-5" />,
    profileType: 'headquarters',
  },
  region: {
    label: 'Region',
    description: 'Geographic region (e.g. North America, EMEA)',
    icon: <Globe className="w-5 h-5" />,
    profileType: 'region',
  },
  division: {
    label: 'Division / Business Unit',
    description: 'Product line, brand, or business unit',
    icon: <Layers className="w-5 h-5" />,
    profileType: 'division',
  },
  location: {
    label: 'Location',
    description: 'Individual office, store, franchise, or branch',
    icon: <MapPin className="w-5 h-5" />,
    profileType: 'location',
  },
};

export function EnterpriseProfileWizard({
  onComplete,
  onCancel,
  parentProfileId,
  parentProfileName,
}: EnterpriseProfileWizardProps) {
  const { labels } = useIndustry();
  const { toast } = useToast();

  // Determine available levels based on parent
  const availableLevels: EnterpriseLevel[] = parentProfileId
    ? ['region', 'division', 'location']
    : ['headquarters', 'region', 'division', 'location'];

  const STEPS: WizardStep[] = [
    {
      id: 'level',
      title: 'Profile Level',
      description: 'Select the organizational level for this profile',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'identity',
      title: 'Identity',
      description: 'Name and identification details',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      id: 'geography',
      title: 'Region & Language',
      description: 'Geographic and language settings',
      icon: <Globe className="w-5 h-5" />,
    },
  ];

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [level, setLevel] = useState<EnterpriseLevel>(parentProfileId ? 'region' : 'headquarters');
  const [profileName, setProfileName] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [slogan, setSlogan] = useState('');

  // Geography
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [city, setCity] = useState('');
  const [timezone, setTimezone] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [secondaryLanguages, setSecondaryLanguages] = useState<string[]>([]);

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep.id) {
      case 'level':
        return !!level;
      case 'identity':
        return profileName.trim().length > 0;
      case 'geography':
        return true; // all optional
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!profileName.trim()) return;

    setIsSubmitting(true);
    try {
      const config: InstitutionalConfig = {
        institutionName: profileName.trim(),
        enterpriseLevel: level,
        enterpriseRegion: region || undefined,
        primaryLanguage: primaryLanguage || 'en',
        secondaryLanguages: secondaryLanguages.length > 0 ? secondaryLanguages : undefined,
        locationCode: locationCode || undefined,
        timezone: timezone || undefined,
        country: country || undefined,
        stateProvince: stateProvince || undefined,
        city: city || undefined,
        slogans: slogan ? [slogan] : [],
      };

      const profileType = LEVEL_CONFIG[level].profileType;
      await onComplete(profileName.trim(), config, profileType);

      toast({
        title: 'Profile Created',
        description: `${LEVEL_CONFIG[level].label} "${profileName}" has been created.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === STEPS.length - 1) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const toggleSecondaryLanguage = (code: string) => {
    if (code === primaryLanguage) return;
    setSecondaryLanguages(prev =>
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length}: {currentStep.title}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {parentProfileId && parentProfileName && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>Creating under: <span className="font-medium text-foreground">{parentProfileName}</span></span>
        </div>
      )}

      {/* Step Content */}
      {currentStep.id === 'level' && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">What level is this profile?</h3>
          <p className="text-xs text-muted-foreground">
            Profiles can represent any level of your organization — regions (APAC, LATAM, EMEA), divisions, business units, franchise groups, or individual locations. Each profile gets its own voice and brand settings.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableLevels.map((lvl) => {
              const config = LEVEL_CONFIG[lvl];
              const isSelected = level === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/30 bg-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{config.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary mt-1" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {currentStep.id === 'identity' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">{LEVEL_CONFIG[level].label} Name *</Label>
            <Input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder={
                level === 'headquarters' ? 'e.g. Valvoline Global'
                : level === 'region' ? 'e.g. North America'
                : level === 'division' ? 'e.g. Quick Lubes'
                : 'e.g. Atlanta Flagship Store'
              }
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Location / Internal Code</Label>
            <Input
              value={locationCode}
              onChange={(e) => setLocationCode(e.target.value)}
              placeholder="e.g. NA-SE-001, EMEA-DACH, Store #1234"
              className="h-9"
            />
            <p className="text-[10px] text-muted-foreground">Optional internal identifier for this profile</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Tagline / Slogan</Label>
            <Input
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="e.g. Driving Innovation Locally"
              className="h-9"
            />
          </div>
        </div>
      )}

      {currentStep.id === 'geography' && (
        <div className="space-y-5">
          {/* Region */}
          <div className="space-y-2">
            <Label className="text-sm">Geographic Region</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select region..." />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country / State / City */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. United States" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">State / Province</Label>
              <Input value={stateProvince} onChange={e => setStateProvince(e.target.value)} placeholder="e.g. Georgia" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">City</Label>
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Atlanta" className="h-9" />
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label className="text-sm">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select timezone..." />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz} value={tz}>{tz.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Language */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5" />
              Primary Language
            </Label>
            <Select value={primaryLanguage} onValueChange={setPrimaryLanguage}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Secondary Languages */}
          <div className="space-y-2">
            <Label className="text-sm">Additional Languages</Label>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.filter(l => l.code !== primaryLanguage).map(lang => {
                const isSelected = secondaryLanguages.includes(lang.code);
                return (
                  <Badge
                    key={lang.code}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer text-[10px] h-6"
                    onClick={() => toggleSecondaryLanguage(lang.code)}
                  >
                    {lang.label}
                    {isSelected && <Check className="w-2.5 h-2.5 ml-0.5" />}
                  </Badge>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">Select any additional languages used in this region's communications</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={step === 0 ? onCancel : () => setStep(step - 1)}
          className="h-8 text-xs"
        >
          <ChevronLeft className="w-3 h-3 mr-1" />
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>

        <Button
          size="sm"
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className="h-8 text-xs"
        >
          {isSubmitting ? (
            'Creating...'
          ) : step === STEPS.length - 1 ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Create {LEVEL_CONFIG[level].label}
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-3 h-3 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}