import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { InstitutionalConfig } from '@/types/uplaybook';
import {
  Building2,
  Palette,
  Phone,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  Loader2,
  Image as ImageIcon,
  X,
  Mail,
  Globe,
  GraduationCap,
  Dna,
  Users,
  Heart
} from 'lucide-react';

interface ProfileSetupWizardProps {
  onComplete: (name: string, config: InstitutionalConfig) => Promise<void>;
  onCancel: () => void;
  initialName?: string;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: WizardStep[] = [
  {
    id: 'identity',
    title: 'Institution Identity',
    description: 'Name, abbreviation, and mascot',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: 'branding',
    title: 'Visual Branding',
    description: 'Logo and color palette',
    icon: <Palette className="w-5 h-5" />,
  },
  {
    id: 'leadership',
    title: 'Leadership',
    description: 'President, Provost, and key leaders',
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 'advancement',
    title: 'Advancement',
    description: 'Development and giving contacts',
    icon: <Heart className="w-5 h-5" />,
  },
  {
    id: 'contact',
    title: 'Contact & Systems',
    description: 'Contact info and platforms',
    icon: <Phone className="w-5 h-5" />,
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Confirm your setup',
    icon: <Check className="w-5 h-5" />,
  },
];

export function ProfileSetupWizard({ onComplete, onCancel, initialName = '' }: ProfileSetupWizardProps) {
  const { tenant } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Form state
  const [config, setConfig] = useState<InstitutionalConfig>({
    institutionName: initialName,
    institutionAbbreviation: '',
    mascot: '',
    slogans: [],
    logoUrl: '',
    primaryColor: '#1F2A44',
    accentColor: '#2C7A7B',
    emailDomain: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    websiteLinks: [],
    portalName: '',
    lmsName: '',
    advisingSystemName: '',
  });
  
  const [sloganInput, setSloganInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');

  const updateConfig = (updates: Partial<InstitutionalConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenant?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (PNG, JPG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tenant.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('institution-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('institution-logos')
        .getPublicUrl(fileName);

      updateConfig({ logoUrl: publicUrl });
      toast({
        title: 'Logo uploaded',
        description: 'Your institution logo has been saved.',
      });
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload logo',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    updateConfig({ logoUrl: '' });
  };

  const addSlogan = () => {
    if (!sloganInput.trim()) return;
    updateConfig({ slogans: [...(config.slogans || []), sloganInput.trim()] });
    setSloganInput('');
  };

  const removeSlogan = (index: number) => {
    updateConfig({ slogans: (config.slogans || []).filter((_, i) => i !== index) });
  };

  const addWebsite = () => {
    if (!websiteInput.trim()) return;
    updateConfig({ websiteLinks: [...(config.websiteLinks || []), websiteInput.trim()] });
    setWebsiteInput('');
  };

  const removeWebsite = (index: number) => {
    updateConfig({ websiteLinks: (config.websiteLinks || []).filter((_, i) => i !== index) });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!config.institutionName?.trim()) {
      toast({
        title: 'Name required',
        description: 'Please provide an institution name.',
        variant: 'destructive',
      });
      setCurrentStep(0);
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(config.institutionName.trim(), config);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to create profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Identity
        return config.institutionName?.trim();
      default:
        return true;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Identity
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="institutionName" className="text-sm font-medium">
                Institution Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="institutionName"
                placeholder="e.g., Lakewood University"
                value={config.institutionName || ''}
                onChange={(e) => updateConfig({ institutionName: e.target.value })}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                The full official name of your institution
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="abbreviation" className="text-sm font-medium">
                  Abbreviation
                </Label>
                <Input
                  id="abbreviation"
                  placeholder="e.g., LU, LWU"
                  value={config.institutionAbbreviation || ''}
                  onChange={(e) => updateConfig({ institutionAbbreviation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mascot" className="text-sm font-medium">
                  Mascot/Nickname
                </Label>
                <Input
                  id="mascot"
                  placeholder="e.g., Griffins, Falcons"
                  value={config.mascot || ''}
                  onChange={(e) => updateConfig({ mascot: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Spirit Phrases & Slogans</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Go Griffins!"
                  value={sloganInput}
                  onChange={(e) => setSloganInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSlogan())}
                />
                <Button type="button" variant="outline" onClick={addSlogan}>
                  Add
                </Button>
              </div>
              {(config.slogans?.length || 0) > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.slogans?.map((slogan, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {slogan}
                      <button onClick={() => removeSlogan(i)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 1: // Branding
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Institution Logo</Label>
              <div className="flex items-start gap-4">
                {config.logoUrl ? (
                  <div className="relative">
                    <img
                      src={config.logoUrl}
                      alt="Logo preview"
                      className="w-24 h-24 object-contain rounded-lg border border-border bg-white p-2"
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
                  <div
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                  >
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
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 2MB. Square format recommended.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="primaryColor" className="text-sm font-medium">
                  Primary Color
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="primaryColor"
                    value={config.primaryColor || '#1F2A44'}
                    onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                  />
                  <div className="flex-1">
                    <Input
                      value={config.primaryColor || '#1F2A44'}
                      onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                      placeholder="#1F2A44"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Main brand color for headers and buttons
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="accentColor" className="text-sm font-medium">
                  Accent Color
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="accentColor"
                    value={config.accentColor || '#2C7A7B'}
                    onChange={(e) => updateConfig({ accentColor: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                  />
                  <div className="flex-1">
                    <Input
                      value={config.accentColor || '#2C7A7B'}
                      onChange={(e) => updateConfig({ accentColor: e.target.value })}
                      placeholder="#2C7A7B"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Secondary color for highlights and links
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Brand Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {config.logoUrl ? (
                    <img
                      src={config.logoUrl}
                      alt="Preview"
                      className="w-12 h-12 object-contain rounded bg-white p-1 border"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: config.primaryColor || '#1F2A44' }}
                    >
                      {config.institutionName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <h3
                      className="font-bold"
                      style={{ color: config.primaryColor || '#1F2A44' }}
                    >
                      {config.institutionName || 'Institution Name'}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: config.accentColor || '#2C7A7B' }}
                    >
                      {config.mascot ? `${config.mascot} • ` : ''}{config.institutionAbbreviation || 'Abbrev'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2: // Leadership
        return (
          <div className="space-y-6">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Add key leadership contacts that may appear in Case for Support documents and executive communications.
              </p>
            </div>

            {/* President */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                President/Chancellor
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="presidentName">Name</Label>
                  <Input
                    id="presidentName"
                    placeholder="e.g., Dr. John Smith"
                    value={config.presidentName || ''}
                    onChange={(e) => updateConfig({ presidentName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="presidentTitle">Title</Label>
                  <Input
                    id="presidentTitle"
                    placeholder="e.g., President"
                    value={config.presidentTitle || ''}
                    onChange={(e) => updateConfig({ presidentTitle: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Provost */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium text-sm text-muted-foreground">Provost/Chief Academic Officer</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provostName">Name</Label>
                  <Input
                    id="provostName"
                    placeholder="e.g., Dr. Jane Doe"
                    value={config.provostName || ''}
                    onChange={(e) => updateConfig({ provostName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provostTitle">Title</Label>
                  <Input
                    id="provostTitle"
                    placeholder="e.g., Provost and Executive Vice President"
                    value={config.provostTitle || ''}
                    onChange={(e) => updateConfig({ provostTitle: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* CFO */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium text-sm text-muted-foreground">Chief Financial Officer (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cfoName">Name</Label>
                  <Input
                    id="cfoName"
                    placeholder="e.g., Michael Johnson"
                    value={config.cfoName || ''}
                    onChange={(e) => updateConfig({ cfoName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cfoTitle">Title</Label>
                  <Input
                    id="cfoTitle"
                    placeholder="e.g., Senior Vice President for Finance"
                    value={config.cfoTitle || ''}
                    onChange={(e) => updateConfig({ cfoTitle: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Advancement
        return (
          <div className="space-y-6">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Development and advancement contacts for Case for Support documents and donor communications.
              </p>
            </div>

            {/* Development Director */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Development Director
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="devDirectorName">Name</Label>
                  <Input
                    id="devDirectorName"
                    placeholder="e.g., Sarah Williams"
                    value={config.developmentDirectorName || ''}
                    onChange={(e) => updateConfig({ developmentDirectorName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="devDirectorTitle">Title</Label>
                  <Input
                    id="devDirectorTitle"
                    placeholder="e.g., Vice President for University Advancement"
                    value={config.developmentDirectorTitle || ''}
                    onChange={(e) => updateConfig({ developmentDirectorTitle: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="devDirectorEmail">Email</Label>
                  <Input
                    id="devDirectorEmail"
                    type="email"
                    placeholder="e.g., advancement@university.edu"
                    value={config.developmentDirectorEmail || ''}
                    onChange={(e) => updateConfig({ developmentDirectorEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="devDirectorPhone">Phone</Label>
                  <Input
                    id="devDirectorPhone"
                    placeholder="e.g., (555) 123-4567"
                    value={config.developmentDirectorPhone || ''}
                    onChange={(e) => updateConfig({ developmentDirectorPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Major Gifts Officer */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium text-sm text-muted-foreground">Major Gifts Officer (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="majorGiftsName">Name</Label>
                  <Input
                    id="majorGiftsName"
                    placeholder="e.g., Robert Chen"
                    value={config.majorGiftsOfficerName || ''}
                    onChange={(e) => updateConfig({ majorGiftsOfficerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="majorGiftsTitle">Title</Label>
                  <Input
                    id="majorGiftsTitle"
                    placeholder="e.g., Director of Major Gifts"
                    value={config.majorGiftsOfficerTitle || ''}
                    onChange={(e) => updateConfig({ majorGiftsOfficerTitle: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="majorGiftsEmail">Email</Label>
                <Input
                  id="majorGiftsEmail"
                  type="email"
                  placeholder="e.g., majorgifts@university.edu"
                  value={config.majorGiftsOfficerEmail || ''}
                  onChange={(e) => updateConfig({ majorGiftsOfficerEmail: e.target.value })}
                />
              </div>
            </div>

            {/* Alumni Relations */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium text-sm text-muted-foreground">Alumni Relations Director (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alumniDirName">Name</Label>
                  <Input
                    id="alumniDirName"
                    placeholder="e.g., Maria Garcia"
                    value={config.alumniRelationsDirectorName || ''}
                    onChange={(e) => updateConfig({ alumniRelationsDirectorName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alumniDirTitle">Title</Label>
                  <Input
                    id="alumniDirTitle"
                    placeholder="e.g., Director of Alumni Relations"
                    value={config.alumniRelationsDirectorTitle || ''}
                    onChange={(e) => updateConfig({ alumniRelationsDirectorTitle: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alumniDirEmail">Email</Label>
                <Input
                  id="alumniDirEmail"
                  type="email"
                  placeholder="e.g., alumni@university.edu"
                  value={config.alumniRelationsDirectorEmail || ''}
                  onChange={(e) => updateConfig({ alumniRelationsDirectorEmail: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 4: // Contact & Systems
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailDomain" className="text-sm font-medium">
                  Email Domain
                </Label>
                <Input
                  id="emailDomain"
                  placeholder="@university.edu"
                  value={config.emailDomain || ''}
                  onChange={(e) => updateConfig({ emailDomain: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryPhone" className="text-sm font-medium">
                  Primary Phone
                </Label>
                <Input
                  id="primaryPhone"
                  placeholder="(555) 123-4567"
                  value={config.primaryContactPhone || ''}
                  onChange={(e) => updateConfig({ primaryContactPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryEmail" className="text-sm font-medium">
                Primary Contact Email
              </Label>
              <Input
                id="primaryEmail"
                type="email"
                placeholder="info@university.edu"
                value={config.primaryContactEmail || ''}
                onChange={(e) => updateConfig({ primaryContactEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Website Links</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://www.university.edu"
                  value={websiteInput}
                  onChange={(e) => setWebsiteInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWebsite())}
                />
                <Button type="button" variant="outline" onClick={addWebsite}>
                  Add
                </Button>
              </div>
              {(config.websiteLinks?.length || 0) > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.websiteLinks?.map((link, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {link}
                      <button onClick={() => removeWebsite(i)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="portalName" className="text-sm font-medium">
                  Student Portal Name
                </Label>
                <Input
                  id="portalName"
                  placeholder="e.g., MyLakewood, Student Hub"
                  value={config.portalName || ''}
                  onChange={(e) => updateConfig({ portalName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lmsName" className="text-sm font-medium">
                  Learning Management System
                </Label>
                <Input
                  id="lmsName"
                  placeholder="e.g., Canvas, Blackboard"
                  value={config.lmsName || ''}
                  onChange={(e) => updateConfig({ lmsName: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 5: // Review
        return (
          <div className="space-y-6">
            <Card className="bg-muted/30">
              <CardHeader>
                <div className="flex items-center gap-4">
                  {config.logoUrl ? (
                    <img
                      src={config.logoUrl}
                      alt="Logo"
                      className="w-16 h-16 object-contain rounded-lg bg-white p-2 border"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
                      style={{ backgroundColor: config.primaryColor || '#1F2A44' }}
                    >
                      {config.institutionName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-xl">{config.institutionName}</CardTitle>
                    <CardDescription>
                      {[config.institutionAbbreviation, config.mascot].filter(Boolean).join(' • ')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Primary Color</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: config.primaryColor || '#1F2A44' }}
                      />
                      <span>{config.primaryColor || '#1F2A44'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Accent Color</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: config.accentColor || '#2C7A7B' }}
                      />
                      <span>{config.accentColor || '#2C7A7B'}</span>
                    </div>
                  </div>
                </div>

                {(config.presidentName || config.developmentDirectorName) && (
                  <div className="pt-3 border-t">
                    <p className="text-muted-foreground text-sm mb-1">Leadership</p>
                    <p className="text-sm">
                      {[
                        config.presidentName && `${config.presidentName} (${config.presidentTitle || 'President'})`,
                        config.developmentDirectorName && `${config.developmentDirectorName} (${config.developmentDirectorTitle || 'Development'})`
                      ].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                )}

                {(config.primaryContactEmail || config.primaryContactPhone) && (
                  <div className="pt-3 border-t">
                    <p className="text-muted-foreground text-sm mb-1">Contact</p>
                    <p className="text-sm">
                      {[config.primaryContactEmail, config.primaryContactPhone].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                )}

                {(config.portalName || config.lmsName) && (
                  <div className="pt-3 border-t">
                    <p className="text-muted-foreground text-sm mb-1">Systems</p>
                    <p className="text-sm">
                      {[config.portalName, config.lmsName, config.advisingSystemName].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Encouraging next steps message */}
            <Card className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="py-4">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-amber-800 dark:text-amber-300">Great start! There's more to explore</p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                      This gets you started with the essentials. After creation, you can continue to refine your profile by adding:
                    </p>
                    <ul className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-2 space-y-1 ml-4 list-disc">
                      <li>Campus locations, buildings, and support centers</li>
                      <li>Additional staff and advisor information</li>
                      <li>Academic terminology and preferred phrases</li>
                      <li>Calls-to-action and signature templates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Dna className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Content DNA</p>
                    <p className="text-xs text-muted-foreground">
                      After creation, configure your institution's unique voice and communication style by uploading sample content
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground text-center italic">
              The more details you add, the better your AI-generated messages will represent your institution.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-3">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => index <= currentStep && setCurrentStep(index)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                index <= currentStep 
                  ? 'text-primary cursor-pointer' 
                  : 'text-muted-foreground cursor-not-allowed'
              } ${index === currentStep ? 'font-medium' : ''}`}
              disabled={index > currentStep}
            >
              <div className={`p-2 rounded-full ${
                index === currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : index < currentStep 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                {step.icon}
              </div>
              <span className="text-xs hidden md:block">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {STEPS[currentStep].icon}
            {STEPS[currentStep].title}
          </CardTitle>
          <CardDescription>{STEPS[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handleBack}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting || !canProceed()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Create Profile
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
