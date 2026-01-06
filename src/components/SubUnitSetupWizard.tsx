import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { InstitutionalConfig, ProfileType } from '@/types/uplaybook';
import type { InstitutionalProfile } from '@/hooks/useInstitutionalProfiles';
import {
  Building2,
  Users,
  Phone,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  Loader2,
  Image as ImageIcon,
  X,
  GraduationCap,
  Briefcase,
  Building,
  Layers
} from 'lucide-react';

interface SubUnitSetupWizardProps {
  parentProfile: InstitutionalProfile;
  onComplete: (name: string, config: InstitutionalConfig, profileType: ProfileType) => Promise<void>;
  onCancel: () => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const UNIT_TYPE_LABELS: Record<ProfileType, { label: string; icon: React.ReactNode; description: string }> = {
  university: { label: 'University', icon: <Building2 className="w-4 h-4" />, description: 'Top-level institution' },
  college: { label: 'College', icon: <GraduationCap className="w-4 h-4" />, description: 'e.g., College of Arts & Sciences, School of Business' },
  division: { label: 'Division', icon: <Layers className="w-4 h-4" />, description: 'e.g., Division of Student Life, Academic Affairs' },
  unit: { label: 'Unit/Center', icon: <Building className="w-4 h-4" />, description: 'e.g., Griffin Career Center, Academic Success Center' },
  department: { label: 'Department', icon: <Briefcase className="w-4 h-4" />, description: 'e.g., Department of Biology, Communications Office' },
};

const STEPS: WizardStep[] = [
  {
    id: 'type',
    title: 'Unit Type',
    description: 'Select what type of organizational unit',
    icon: <Layers className="w-5 h-5" />,
  },
  {
    id: 'identity',
    title: 'Unit Identity',
    description: 'Name and basic information',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: 'leadership',
    title: 'Leadership',
    description: 'Dean, Director, or leadership details',
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 'contact',
    title: 'Contact Info',
    description: 'Unit-specific contact details',
    icon: <Phone className="w-5 h-5" />,
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Confirm your setup',
    icon: <Check className="w-5 h-5" />,
  },
];

export function SubUnitSetupWizard({ parentProfile, onComplete, onCancel }: SubUnitSetupWizardProps) {
  const { tenant } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Form state - inherit from parent profile
  const [profileType, setProfileType] = useState<ProfileType>('college');
  const [config, setConfig] = useState<InstitutionalConfig>({
    // Inherit key values from parent
    ...parentProfile.config,
    // Unit-specific overrides
    unitType: 'college',
    unitName: '',
    unitAbbreviation: '',
    unitSlogan: '',
    unitWebsite: '',
    unitMainPhone: '',
    unitMainEmail: '',
    unitLocation: '',
    // Leadership fields (start empty)
    deanName: '',
    deanTitle: '',
    deanEmail: '',
    associateDeans: [],
    directorName: '',
    directorTitle: '',
    directorEmail: '',
    vicePresidentName: '',
    vicePresidentTitle: '',
    vicePresidentEmail: '',
    departmentChairName: '',
    departmentChairTitle: '',
    departmentChairEmail: '',
    executiveAssistantName: '',
    executiveAssistantEmail: '',
  });

  const updateConfig = (updates: Partial<InstitutionalConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenant?.id) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (PNG, JPG, etc.)',
        variant: 'destructive',
      });
      return;
    }

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
      const fileName = `${tenant.id}/subunit-${Date.now()}.${fileExt}`;

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
        description: 'Your unit logo has been saved.',
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
    if (!config.unitName?.trim()) {
      toast({
        title: 'Name required',
        description: 'Please provide a unit name.',
        variant: 'destructive',
      });
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(config.unitName.trim(), { ...config, unitType: profileType }, profileType);
    } catch (error) {
      console.error('Error creating sub-unit:', error);
      toast({
        title: 'Error',
        description: 'Failed to create sub-unit. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Type
        return profileType !== 'university';
      case 1: // Identity
        return config.unitName?.trim();
      default:
        return true;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Get leadership title based on unit type
  const getLeadershipTitle = () => {
    switch (profileType) {
      case 'college': return 'Dean';
      case 'division': return 'Vice President';
      case 'unit': return 'Director';
      case 'department': return 'Department Chair';
      default: return 'Leader';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Unit Type
        return (
          <div className="space-y-6">
            <div className="p-4 bg-muted/30 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                Creating a sub-unit under <span className="font-medium text-foreground">{parentProfile.name}</span>
              </p>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Unit Type</Label>
              <div className="grid gap-3">
                {(['college', 'division', 'unit', 'department'] as ProfileType[]).map((type) => {
                  const info = UNIT_TYPE_LABELS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setProfileType(type);
                        updateConfig({ unitType: type });
                      }}
                      className={`flex items-center gap-4 p-4 rounded-lg border text-left transition-all ${
                        profileType === type 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${profileType === type ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{info.label}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                      {profileType === type && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 1: // Identity
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="unitName" className="text-sm font-medium">
                {UNIT_TYPE_LABELS[profileType].label} Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unitName"
                placeholder={`e.g., ${profileType === 'college' ? 'College of Arts & Sciences' : profileType === 'division' ? 'Division of Student Life' : profileType === 'department' ? 'Department of Biology' : 'Griffin Career Center'}`}
                value={config.unitName || ''}
                onChange={(e) => updateConfig({ unitName: e.target.value })}
                className="text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitAbbreviation" className="text-sm font-medium">
                  Abbreviation
                </Label>
                <Input
                  id="unitAbbreviation"
                  placeholder="e.g., CAS, DSL, BIO"
                  value={config.unitAbbreviation || ''}
                  onChange={(e) => updateConfig({ unitAbbreviation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitLocation" className="text-sm font-medium">
                  Building/Location
                </Label>
                <Input
                  id="unitLocation"
                  placeholder="e.g., Lakewood Hall, Suite 200"
                  value={config.unitLocation || ''}
                  onChange={(e) => updateConfig({ unitLocation: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">{UNIT_TYPE_LABELS[profileType].label} Logo (Optional)</Label>
              <div className="flex items-start gap-4">
                {config.logoUrl && config.logoUrl !== parentProfile.config.logoUrl ? (
                  <div className="relative">
                    <img
                      src={config.logoUrl}
                      alt="Logo preview"
                      className="w-20 h-20 object-contain rounded-lg border border-border bg-white p-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => updateConfig({ logoUrl: parentProfile.config.logoUrl })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
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
                    Leave blank to use the parent institution's logo
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Leadership
        return (
          <div className="space-y-6">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Enter leadership information for your {UNIT_TYPE_LABELS[profileType].label.toLowerCase()}
              </p>
            </div>

            {/* Primary Leader */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {getLeadershipTitle()} Information
              </h4>
              
              {profileType === 'college' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deanName">Dean Name</Label>
                      <Input
                        id="deanName"
                        placeholder="e.g., Dr. Margaret Chen"
                        value={config.deanName || ''}
                        onChange={(e) => updateConfig({ deanName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deanTitle">Title</Label>
                      <Input
                        id="deanTitle"
                        placeholder="e.g., Dean of Arts & Sciences"
                        value={config.deanTitle || ''}
                        onChange={(e) => updateConfig({ deanTitle: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deanEmail">Email</Label>
                    <Input
                      id="deanEmail"
                      type="email"
                      placeholder="e.g., dean.cas@lakewood.edu"
                      value={config.deanEmail || ''}
                      onChange={(e) => updateConfig({ deanEmail: e.target.value })}
                    />
                  </div>
                </>
              )}

              {profileType === 'division' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vpName">Vice President Name</Label>
                      <Input
                        id="vpName"
                        placeholder="e.g., Dr. Robert Martinez"
                        value={config.vicePresidentName || ''}
                        onChange={(e) => updateConfig({ vicePresidentName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vpTitle">Title</Label>
                      <Input
                        id="vpTitle"
                        placeholder="e.g., VP for Student Life"
                        value={config.vicePresidentTitle || ''}
                        onChange={(e) => updateConfig({ vicePresidentTitle: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vpEmail">Email</Label>
                    <Input
                      id="vpEmail"
                      type="email"
                      placeholder="e.g., vp.studentlife@lakewood.edu"
                      value={config.vicePresidentEmail || ''}
                      onChange={(e) => updateConfig({ vicePresidentEmail: e.target.value })}
                    />
                  </div>
                </>
              )}

              {profileType === 'unit' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="directorName">Director Name</Label>
                      <Input
                        id="directorName"
                        placeholder="e.g., Sarah Thompson"
                        value={config.directorName || ''}
                        onChange={(e) => updateConfig({ directorName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="directorTitle">Title</Label>
                      <Input
                        id="directorTitle"
                        placeholder="e.g., Director of Career Services"
                        value={config.directorTitle || ''}
                        onChange={(e) => updateConfig({ directorTitle: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="directorEmail">Email</Label>
                    <Input
                      id="directorEmail"
                      type="email"
                      placeholder="e.g., careers@lakewood.edu"
                      value={config.directorEmail || ''}
                      onChange={(e) => updateConfig({ directorEmail: e.target.value })}
                    />
                  </div>
                </>
              )}

              {profileType === 'department' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chairName">Department Chair Name</Label>
                      <Input
                        id="chairName"
                        placeholder="e.g., Dr. Lisa Park"
                        value={config.departmentChairName || ''}
                        onChange={(e) => updateConfig({ departmentChairName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chairTitle">Title</Label>
                      <Input
                        id="chairTitle"
                        placeholder="e.g., Chair, Department of Biology"
                        value={config.departmentChairTitle || ''}
                        onChange={(e) => updateConfig({ departmentChairTitle: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chairEmail">Email</Label>
                    <Input
                      id="chairEmail"
                      type="email"
                      placeholder="e.g., biology@lakewood.edu"
                      value={config.departmentChairEmail || ''}
                      onChange={(e) => updateConfig({ departmentChairEmail: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Executive Assistant */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium text-sm text-muted-foreground">Executive Assistant (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eaName">Name</Label>
                  <Input
                    id="eaName"
                    placeholder="e.g., Jamie Rodriguez"
                    value={config.executiveAssistantName || ''}
                    onChange={(e) => updateConfig({ executiveAssistantName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eaEmail">Email</Label>
                  <Input
                    id="eaEmail"
                    type="email"
                    placeholder="e.g., admin.cas@lakewood.edu"
                    value={config.executiveAssistantEmail || ''}
                    onChange={(e) => updateConfig({ executiveAssistantEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Contact
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPhone" className="text-sm font-medium">
                  Main Phone
                </Label>
                <Input
                  id="unitPhone"
                  placeholder="(555) 123-4567"
                  value={config.unitMainPhone || ''}
                  onChange={(e) => updateConfig({ unitMainPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitEmail" className="text-sm font-medium">
                  Main Email
                </Label>
                <Input
                  id="unitEmail"
                  type="email"
                  placeholder="e.g., artsci@lakewood.edu"
                  value={config.unitMainEmail || ''}
                  onChange={(e) => updateConfig({ unitMainEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitWebsite" className="text-sm font-medium">
                Website
              </Label>
              <Input
                id="unitWebsite"
                placeholder="e.g., artsci.lakewood.edu"
                value={config.unitWebsite || ''}
                onChange={(e) => updateConfig({ unitWebsite: e.target.value })}
              />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This {UNIT_TYPE_LABELS[profileType].label.toLowerCase()} inherits other contact information from{' '}
                <span className="font-medium text-foreground">{parentProfile.name}</span>. 
                You can customize additional details after creation.
              </p>
            </div>
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-6">
            <Card className="bg-muted/30">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    {UNIT_TYPE_LABELS[profileType].icon}
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-1">{UNIT_TYPE_LABELS[profileType].label}</Badge>
                    <CardTitle className="text-xl">{config.unitName}</CardTitle>
                    <CardDescription>
                      Part of {parentProfile.name}
                      {config.unitAbbreviation && ` • ${config.unitAbbreviation}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(config.unitLocation) && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Location</p>
                    <p>{config.unitLocation}</p>
                  </div>
                )}

                {(profileType === 'college' && config.deanName) && (
                  <div className="pt-3 border-t">
                    <p className="text-muted-foreground text-sm">Leadership</p>
                    <p className="text-sm font-medium">{config.deanName}</p>
                    <p className="text-sm text-muted-foreground">{config.deanTitle || 'Dean'}</p>
                  </div>
                )}

                {(profileType === 'division' && config.vicePresidentName) && (
                  <div className="pt-3 border-t">
                    <p className="text-muted-foreground text-sm">Leadership</p>
                    <p className="text-sm font-medium">{config.vicePresidentName}</p>
                    <p className="text-sm text-muted-foreground">{config.vicePresidentTitle || 'Vice President'}</p>
                  </div>
                )}

                {(profileType === 'unit' && config.directorName) && (
                  <div className="pt-3 border-t">
                    <p className="text-muted-foreground text-sm">Leadership</p>
                    <p className="text-sm font-medium">{config.directorName}</p>
                    <p className="text-sm text-muted-foreground">{config.directorTitle || 'Director'}</p>
                  </div>
                )}

                {(profileType === 'department' && config.departmentChairName) && (
                  <div className="pt-3 border-t">
                    <p className="text-muted-foreground text-sm">Leadership</p>
                    <p className="text-sm font-medium">{config.departmentChairName}</p>
                    <p className="text-sm text-muted-foreground">{config.departmentChairTitle || 'Department Chair'}</p>
                  </div>
                )}

                {(config.unitMainEmail || config.unitMainPhone) && (
                  <div className="pt-3 border-t">
                    <p className="text-muted-foreground text-sm">Contact</p>
                    <p className="text-sm">
                      {[config.unitMainEmail, config.unitMainPhone].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground text-center">
              This {UNIT_TYPE_LABELS[profileType].label.toLowerCase()} will inherit settings from {parentProfile.name} 
              and can be further customized after creation.
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
                Create {UNIT_TYPE_LABELS[profileType].label}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}