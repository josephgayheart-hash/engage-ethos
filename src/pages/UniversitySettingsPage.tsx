import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { InstitutionalConfig } from "@/components/InstitutionalConfig";
import { ProfileSetupWizard } from "@/components/ProfileSetupWizard";
import { SubUnitSetupWizard } from "@/components/SubUnitSetupWizard";
import { useInstitutionalProfiles, type InstitutionalProfile, type ProfileType } from "@/hooks/useInstitutionalProfiles";
import { useIndustry } from "@/contexts/IndustryContext";
import { useAgencyMode } from "@/hooks/useAgencyMode";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { WaveBackground } from "@/components/WaveBackground";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  ArrowLeft,
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  Copy, 
  ChevronRight,
  FolderOpen,
  CheckCircle2,
  Circle,
  Dna,
  GraduationCap,
  Layers,
  Building,
  Briefcase,
  ChevronDown,
  Palette,
  Image,
  Upload,
  Save,
  X,
  Loader2,
  ExternalLink,
  Settings,
  AlertCircle,
  Users,
} from "lucide-react";
import type { InstitutionalConfig as InstitutionalConfigType, ProfileType as ConfigProfileType } from "@/types/campusvoice";

const PROFILE_TYPE_ICONS: Record<ProfileType, React.ReactNode> = {
  university: <Building2 className="w-4 h-4" />,
  college: <GraduationCap className="w-4 h-4" />,
  division: <Layers className="w-4 h-4" />,
  unit: <Building className="w-4 h-4" />,
  department: <Briefcase className="w-4 h-4" />,
};

const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  university: 'University',
  college: 'College',
  division: 'Division',
  unit: 'Unit',
  department: 'Department',
};

const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const MAX_LOGO_DIMENSION = 400;

export default function UniversitySettingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tenant, refreshProfile, isAdmin, isSuperAdmin } = useAuth();
  const { isAgency, labels } = useAgencyMode();
  const { profiles, createProfile, updateProfile, deleteProfile, duplicateProfile, getChildProfiles, getRootProfiles, getParentProfile, refreshProfiles } = useInstitutionalProfiles();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get initial tab from URL or default to branding
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'branding' ? 'branding' : 'profiles');
  
  // Profile management state
  const [editingProfile, setEditingProfile] = useState<InstitutionalProfile | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showSubUnitWizard, setShowSubUnitWizard] = useState(false);
  const [subUnitParent, setSubUnitParent] = useState<InstitutionalProfile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<InstitutionalProfile | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [profileToDuplicate, setProfileToDuplicate] = useState<InstitutionalProfile | null>(null);
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);
  
  // Branding state
  const [isEditingInstitution, setIsEditingInstitution] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [isSavingInstitution, setIsSavingInstitution] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#1F2A44');
  const [accentColor, setAccentColor] = useState('#2C7A7B');
  const [primaryColorInput, setPrimaryColorInput] = useState('#1F2A44');
  const [accentColorInput, setAccentColorInput] = useState('#2C7A7B');
  const [isSavingColors, setIsSavingColors] = useState(false);

  // Content DNA stats per profile
  const [dnaStats, setDnaStats] = useState<Record<string, { samples: number; hasAnalysis: boolean }>>({});

  useEffect(() => {
    if (tenant?.institution_name) {
      setInstitutionName(tenant.institution_name);
    }
    if (tenant?.logo_url) {
      setLogoUrl(tenant.logo_url);
    }
    if (tenant?.primary_color) {
      setPrimaryColor(tenant.primary_color);
      setPrimaryColorInput(tenant.primary_color);
    }
    if (tenant?.accent_color) {
      setAccentColor(tenant.accent_color);
      setAccentColorInput(tenant.accent_color);
    }
  }, [tenant]);

  // Fetch DNA stats for each profile
  useEffect(() => {
    const fetchDnaStats = async () => {
      if (!tenant?.id || profiles.length === 0) return;
      
      const stats: Record<string, { samples: number; hasAnalysis: boolean }> = {};
      
      for (const profile of profiles) {
        const [samplesResult, analysisResult] = await Promise.all([
          supabase.from('content_dna_samples').select('id', { count: 'exact', head: true }).eq('profile_id', profile.id),
          supabase.from('content_dna_analysis').select('id').eq('profile_id', profile.id).maybeSingle(),
        ]);
        
        stats[profile.id] = {
          samples: samplesResult.count || 0,
          hasAnalysis: !!analysisResult.data,
        };
      }
      
      setDnaStats(stats);
    };
    
    fetchDnaStats();
  }, [tenant?.id, profiles]);

  // Auto-expand parents with sub-units when the user opens the Profiles tab (first time only)
  useEffect(() => {
    if (activeTab !== 'profiles') return;
    if (profiles.length === 0) return;
    if (expandedProfiles.size > 0) return;

    const parentIds = new Set<string>();
    for (const p of profiles) {
      if (p.parentProfileId) parentIds.add(p.parentProfileId);
    }

    if (parentIds.size > 0) {
      setExpandedProfiles(new Set(Array.from(parentIds)));
    }
  }, [activeTab, profiles, expandedProfiles.size]);

  const toggleExpanded = (profileId: string) => {
    setExpandedProfiles(prev => {
      const next = new Set(prev);
      if (next.has(profileId)) {
        next.delete(profileId);
      } else {
        next.add(profileId);
      }
      return next;
    });
  };

  // Branding handlers
  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_LOGO_DIMENSION || height > MAX_LOGO_DIMENSION) {
          if (width > height) {
            height = (height / width) * MAX_LOGO_DIMENSION;
            width = MAX_LOGO_DIMENSION;
          } else {
            width = (width / height) * MAX_LOGO_DIMENSION;
            height = MAX_LOGO_DIMENSION;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Failed to resize')),
          'image/png',
          0.9
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSaveInstitution = async () => {
    if (!tenant?.id || !institutionName.trim()) return;
    
    setIsSavingInstitution(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ institution_name: institutionName.trim() })
        .eq('id', tenant.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditingInstitution(false);
      toast({ title: 'Institution Updated', description: 'Your institution name has been saved.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSavingInstitution(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !tenant?.id) return;

    if (file.size > MAX_LOGO_SIZE) {
      toast({ title: 'File too large', description: 'Logo must be less than 2MB', variant: 'destructive' });
      return;
    }

    setIsUploadingLogo(true);
    try {
      const resizedBlob = await resizeImage(file);
      const fileName = `${tenant.id}/logo-${Date.now()}.png`;

      if (tenant.logo_url) {
        const oldPath = tenant.logo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('institution-logos').remove([`${tenant.id}/${oldPath}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('institution-logos')
        .upload(fileName, resizedBlob, { contentType: 'image/png', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('institution-logos').getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('tenants')
        .update({ logo_url: publicUrl })
        .eq('id', tenant.id);

      if (updateError) throw updateError;

      setLogoUrl(publicUrl);
      await refreshProfile();
      toast({ title: 'Logo Uploaded', description: 'Your institution logo has been updated.' });
    } catch (error: any) {
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!tenant?.id || !tenant.logo_url) return;

    setIsUploadingLogo(true);
    try {
      const urlParts = tenant.logo_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from('institution-logos').remove([`${tenant.id}/${fileName}`]);

      const { error } = await supabase.from('tenants').update({ logo_url: null }).eq('id', tenant.id);
      if (error) throw error;

      setLogoUrl(null);
      await refreshProfile();
      toast({ title: 'Logo Removed' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveColors = async () => {
    if (!tenant?.id) return;

    setIsSavingColors(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ primary_color: primaryColorInput, accent_color: accentColorInput })
        .eq('id', tenant.id);

      if (error) throw error;

      setPrimaryColor(primaryColorInput);
      setAccentColor(accentColorInput);
      await refreshProfile();
      toast({ title: 'Colors Saved' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSavingColors(false);
    }
  };

  const handleColorInputChange = (value: string, setter: (v: string) => void) => {
    // Allow empty, or # followed by up to 6 hex characters
    const stripped = value.startsWith('#') ? value.slice(1) : value;
    if (stripped === '' || /^[0-9A-Fa-f]{0,6}$/.test(stripped)) {
      setter(stripped === '' ? '' : '#' + stripped);
    }
  };

  // Profile handlers
  const handleCreateProfile = async (name: string, config: InstitutionalConfigType) => {
    const profile = await createProfile(name, config, null, 'university');
    setShowWizard(false);
    if (profile) {
      setEditingProfile(profile);
      setActiveTab("profiles");
      toast({ title: "Profile created", description: `"${profile.name}" is ready to use.` });
    }
  };

  const handleCreateSubUnit = async (name: string, config: InstitutionalConfigType, profileType: ConfigProfileType) => {
    if (!subUnitParent) return;
    const profile = await createProfile(name, config, subUnitParent.id, profileType as ProfileType);
    setShowSubUnitWizard(false);
    setSubUnitParent(null);
    if (profile) {
      setExpandedProfiles(prev => new Set([...prev, subUnitParent.id]));
      setEditingProfile(profile);
      toast({ title: `${PROFILE_TYPE_LABELS[profileType as ProfileType]} created`, description: `"${name}" is now part of ${subUnitParent.name}.` });
    }
  };

  const handleUpdateConfig = async (config: InstitutionalConfigType) => {
    if (!editingProfile) return;
    await updateProfile(editingProfile.id, { config });
    setEditingProfile({ ...editingProfile, config });
  };

  const handleRenameProfile = async (newName: string) => {
    if (!editingProfile || !newName.trim()) return;
    await updateProfile(editingProfile.id, { name: newName.trim() });
    setEditingProfile({ ...editingProfile, name: newName.trim() });
  };

  const handleDeleteProfile = async () => {
    if (!profileToDelete) return;
    
    setIsDeletingProfile(true);
    try {
      // First delete associated Content DNA samples
      const { error: samplesError } = await supabase
        .from('content_dna_samples')
        .delete()
        .eq('profile_id', profileToDelete.id);
      
      if (samplesError) {
        console.error('Error deleting samples:', samplesError);
      }

      // Delete Content DNA analysis
      const { error: analysisError } = await supabase
        .from('content_dna_analysis')
        .delete()
        .eq('profile_id', profileToDelete.id);
      
      if (analysisError) {
        console.error('Error deleting analysis:', analysisError);
      }

      // Delete Content DNA adjustments
      const { error: adjustmentsError } = await supabase
        .from('content_dna_adjustments')
        .delete()
        .eq('profile_id', profileToDelete.id);
      
      if (adjustmentsError) {
        console.error('Error deleting adjustments:', adjustmentsError);
      }

      // Now delete the profile itself
      await deleteProfile(profileToDelete.id);
      
      if (editingProfile?.id === profileToDelete.id) {
        setEditingProfile(null);
      }
      
      toast({ title: "Profile deleted", description: "Profile and all associated Content DNA have been removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete profile", variant: "destructive" });
    } finally {
      setIsDeletingProfile(false);
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };

  const handleDuplicateProfile = async () => {
    if (!profileToDuplicate || !duplicateName.trim()) return;
    const newProfile = await duplicateProfile(profileToDuplicate.id, duplicateName.trim());
    setDuplicateDialogOpen(false);
    setProfileToDuplicate(null);
    setDuplicateName("");
    if (newProfile) {
      toast({ title: "Profile duplicated", description: `"${newProfile.name}" created.` });
    }
  };

  const getProfileSummary = (profile: InstitutionalProfile) => {
    const parts: string[] = [];
    if (profile.config.institutionName) parts.push(profile.config.institutionName);
    if (profile.config.mascot) parts.push(profile.config.mascot);
    const ctaCount = (profile.config.primaryCTAs?.length || 0) + (profile.config.secondaryCTAs?.length || 0);
    if (ctaCount > 0) parts.push(`${ctaCount} CTAs`);
    return parts.length > 0 ? parts.join(' • ') : 'Empty profile';
  };

  const getProfileCompletion = (config: InstitutionalConfigType) => {
    const checks = [
      { key: 'name', done: !!config.institutionName?.trim() },
      { key: 'abbrev', done: !!config.institutionAbbreviation?.trim() },
      { key: 'logo', done: !!config.logoUrl?.trim() },
      { key: 'primary', done: !!config.primaryColor && config.primaryColor !== '#1F2A44' },
      { key: 'emailDomain', done: !!config.emailDomain?.trim() },
      { key: 'contactEmail', done: !!config.primaryContactEmail?.trim() },
      { key: 'portal', done: !!config.portalName?.trim() },
      { key: 'primaryCTAs', done: (config.primaryCTAs?.length || 0) > 0 },
    ];
    
    const completed = checks.filter(c => c.done).length;
    const percentage = Math.round((completed / checks.length) * 100);
    return { completed, total: checks.length, percentage };
  };

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access University Settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      
      {/* Page Header */}
      <div className="relative overflow-hidden pb-8">
        <WaveBackground variant="default" />
        
        <div className="relative container mx-auto px-4 pt-10 pb-4">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb with quick links */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Home
                </Link>
                <span>/</span>
                <span className="text-foreground">{labels.settingsPageTitle}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Link 
                  to="/build" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-pillar-cognitive/10 text-pillar-cognitive hover:bg-pillar-cognitive/20 transition-colors font-medium"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Message Builder
                </Link>
                <Link 
                  to="/strategy" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-pillar-consensus/10 text-pillar-consensus hover:bg-pillar-consensus/20 transition-colors font-medium"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Journey Designer
                </Link>
              </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isAgency ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                  {logoUrl ? (
                    <img src={logoUrl} alt={tenant?.institution_name || ''} className="w-10 h-10 object-contain rounded" />
                  ) : isAgency ? (
                    <Users className="w-6 h-6 text-amber-600" />
                  ) : (
                    <Building2 className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-2xl md:text-3xl font-bold">
                      {tenant?.institution_name || (isAgency ? 'Agency Settings' : 'University Settings')}
                    </h1>
                    {isAgency && (
                      <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                        Agency Partner
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {isAgency 
                      ? 'Manage your agency branding and partner institution configurations'
                      : labels.settingsPageDescription
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="profiles" className="flex items-center gap-2">
                {isAgency ? <Users className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                {isAgency ? 'Client Accounts' : 'Profiles'} ({profiles.length})
              </TabsTrigger>
              <TabsTrigger value="branding" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                {isAgency ? 'Agency Branding' : 'Branding'}
              </TabsTrigger>
            </TabsList>

            {/* Branding Tab - Dynamic per-profile view */}
            <TabsContent value="branding" className="space-y-6">
              {/* Tenant-level header */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {isAgency ? <Users className="w-5 h-5 text-amber-600" /> : <Building2 className="w-5 h-5" />}
                    {isAgency ? `${tenant?.institution_name || 'Agency'} Branding` : 'Institution Branding'}
                  </CardTitle>
                  <CardDescription>
                    {isAgency 
                      ? 'Your agency\'s visual identity — logo, colors, and brand assets'
                      : 'Your institution identity and per-profile visual branding at a glance'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <div className="relative group">
                        <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded border bg-white p-2" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={handleRemoveLogo}
                          disabled={isUploadingLogo}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded border-2 border-dashed flex items-center justify-center bg-muted/30">
                        <Image className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {isEditingInstitution ? (
                        <div className="space-y-2">
                          <Input
                            value={institutionName}
                            onChange={(e) => setInstitutionName(e.target.value)}
                            placeholder={isAgency ? 'Agency name' : 'Institution name'}
                            className="max-w-xs"
                          />
                          <div className="flex gap-2">
                            <Button onClick={handleSaveInstitution} disabled={isSavingInstitution} size="sm">
                              {isSavingInstitution ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                              Save
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setIsEditingInstitution(false); setInstitutionName(tenant?.institution_name || ''); }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{tenant?.institution_name || 'Not set'}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditingInstitution(true)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isAgency ? 'Agency-level identity' : 'Tenant-level identity'} · {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border" style={{ backgroundColor: primaryColor }} title={`Primary: ${primaryColor}`} />
                        <div className="w-8 h-8 rounded border" style={{ backgroundColor: accentColor }} title={`Accent: ${accentColor}`} />
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploadingLogo}>
                        {isUploadingLogo ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
                        {logoUrl ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                    </div>
                  </div>
                  {/* Tenant color editor */}
                  <div className="flex flex-wrap items-end gap-4 mt-4 pt-4 border-t">
                    <div className="space-y-1">
                      <Label className="text-xs">Primary Color</Label>
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={primaryColorInput.length === 7 ? primaryColorInput : primaryColor} onChange={(e) => setPrimaryColorInput(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                        <Input value={primaryColorInput} onChange={(e) => handleColorInputChange(e.target.value, setPrimaryColorInput)} className="w-24 font-mono text-xs h-8" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Accent Color</Label>
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={accentColorInput.length === 7 ? accentColorInput : accentColor} onChange={(e) => setAccentColorInput(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                        <Input value={accentColorInput} onChange={(e) => handleColorInputChange(e.target.value, setAccentColorInput)} className="w-24 font-mono text-xs h-8" />
                      </div>
                    </div>
                    {(primaryColorInput !== primaryColor || accentColorInput !== accentColor) && (
                      <Button onClick={handleSaveColors} disabled={isSavingColors} size="sm">
                        {isSavingColors ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                        Save Colors
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Per-profile branding cards */}
              {isAgency && profiles.length > 0 && (
                <div className="relative flex items-center gap-4 pt-2">
                  <div className="h-px flex-1 bg-border" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Partner Institutions
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-5">{profiles.length}</Badge>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
              {profiles.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Palette className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      {isAgency 
                        ? 'No partner institutions yet. Add one to manage their branding.'
                        : 'No profiles yet. Create a profile to manage per-profile branding.'
                      }
                    </p>
                    <Button size="sm" variant="outline" onClick={() => { setActiveTab('profiles'); setShowWizard(true); }}>
                      <Plus className="w-3 h-3 mr-1" />
                      {isAgency ? 'Add Partner Institution' : 'Create Profile'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {profiles.map((profile) => {
                    const cfg = profile.config;
                    const hasLogo = !!cfg.logoUrl;
                    const hasSecondary = !!cfg.logoUrlSecondary;
                    const hasAthletic = !!cfg.logoUrlAthletic;
                    const hasPresidential = !!cfg.logoUrlPresidential;
                    const logoCount = [hasLogo, hasSecondary, hasAthletic, hasPresidential].filter(Boolean).length;
                    const parent = getParentProfile(profile.id);

                    return (
                      <Card 
                        key={profile.id} 
                        className="group cursor-pointer hover:border-primary/40 transition-all hover:shadow-sm"
                        onClick={() => { setEditingProfile(profile); setActiveTab('profiles'); }}
                      >
                        <CardContent className="p-4 space-y-3">
                          {/* Profile header */}
                          <div className="flex items-center gap-3">
                            {hasLogo ? (
                              <img src={cfg.logoUrl!} alt={profile.name} className="w-10 h-10 object-contain rounded border bg-white p-1" />
                            ) : (
                              <div 
                                className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-sm"
                                style={{ backgroundColor: cfg.primaryColor || '#1F2A44' }}
                              >
                                {profile.name.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{profile.name}</p>
                              {parent && (
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {PROFILE_TYPE_LABELS[profile.profileType]} of {parent.name}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                              {PROFILE_TYPE_LABELS[profile.profileType]}
                            </Badge>
                          </div>

                          {/* Color swatches */}
                          <div className="flex items-center gap-2">
                            {cfg.primaryColor && (
                              <div className="flex items-center gap-1">
                                <div className="w-5 h-5 rounded border" style={{ backgroundColor: cfg.primaryColor }} />
                                <span className="text-[10px] text-muted-foreground font-mono">{cfg.primaryColor}</span>
                              </div>
                            )}
                            {cfg.secondaryColor && (
                              <div className="flex items-center gap-1">
                                <div className="w-5 h-5 rounded border" style={{ backgroundColor: cfg.secondaryColor }} />
                                <span className="text-[10px] text-muted-foreground font-mono">{cfg.secondaryColor}</span>
                              </div>
                            )}
                            {!cfg.tertiaryColorNA && cfg.tertiaryColor && (
                              <div className="flex items-center gap-1">
                                <div className="w-5 h-5 rounded border" style={{ backgroundColor: cfg.tertiaryColor }} />
                                <span className="text-[10px] text-muted-foreground font-mono">{cfg.tertiaryColor}</span>
                              </div>
                            )}
                            {cfg.tertiaryColorNA && (
                              <Badge variant="outline" className="text-[9px] h-4 px-1">No tertiary</Badge>
                            )}
                          </div>

                          {/* Logo variants summary */}
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-1">
                              {hasLogo && <img src={cfg.logoUrl!} alt="" className="w-6 h-6 rounded border bg-white object-contain" />}
                              {hasSecondary && <img src={cfg.logoUrlSecondary!} alt="" className="w-6 h-6 rounded border bg-white object-contain" />}
                              {hasAthletic && <img src={cfg.logoUrlAthletic!} alt="" className="w-6 h-6 rounded border bg-white object-contain" />}
                              {hasPresidential && <img src={cfg.logoUrlPresidential!} alt="" className="w-6 h-6 rounded border bg-white object-contain" />}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {logoCount}/4 logo variant{logoCount !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Slogans */}
                          {(cfg.slogans?.length || 0) > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {cfg.slogans!.slice(0, 2).map((s, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px] h-5">{s}</Badge>
                              ))}
                              {cfg.slogans!.length > 2 && (
                                <Badge variant="outline" className="text-[10px] h-5">+{cfg.slogans!.length - 2}</Badge>
                              )}
                            </div>
                          )}

                          {/* Edit link */}
                          <div className="flex items-center justify-end pt-1">
                            <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              Edit Profile <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Profiles Tab */}
            <TabsContent value="profiles">
              {showWizard ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Create Institutional Profile
                    </CardTitle>
                    <CardDescription>
                      Set up a new institution profile with branding, contact info, and key systems
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileSetupWizard
                      onComplete={handleCreateProfile}
                      onCancel={() => setShowWizard(false)}
                    />
                  </CardContent>
                </Card>
              ) : showSubUnitWizard && subUnitParent ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Create Sub-Unit
                    </CardTitle>
                    <CardDescription>
                      Create a college, division, unit, or department under {subUnitParent.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SubUnitSetupWizard
                      parentProfile={subUnitParent}
                      onComplete={handleCreateSubUnit}
                      onCancel={() => {
                        setShowSubUnitWizard(false);
                        setSubUnitParent(null);
                      }}
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile List */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Your Profiles
                      </h2>
                      <Button size="sm" className="h-8" onClick={() => setShowWizard(true)}>
                        <Plus className="w-3 h-3 mr-1" />
                        New
                      </Button>
                    </div>

                    {profiles.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                          <FolderOpen className="w-10 h-10 text-muted-foreground/50 mb-3" />
                          <p className="text-sm text-muted-foreground mb-3">
                            No profiles yet. Create one to get started.
                          </p>
                          <Button size="sm" variant="outline" onClick={() => setShowWizard(true)}>
                            <Plus className="w-3 h-3 mr-1" />
                            Create First Profile
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-2">
                        {getRootProfiles().map(profile => {
                          const children = getChildProfiles(profile.id);
                          const hasChildren = children.length > 0;
                          const isExpanded = expandedProfiles.has(profile.id);
                          const isSelected = editingProfile?.id === profile.id;
                          
                          return (
                            <div key={profile.id}>
                              {/* Parent Profile Card - Clean minimal design */}
                              <div 
                                className={`group relative rounded-lg border p-3 cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'border-primary bg-primary/5 shadow-sm' 
                                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                                }`}
                                onClick={() => setEditingProfile(profile)}
                              >
                                <div className="flex items-center gap-3">
                                  {/* Logo/Avatar */}
                                  {profile.config.logoUrl ? (
                                    <img
                                      src={profile.config.logoUrl}
                                      alt={profile.name}
                                      className="w-10 h-10 object-contain rounded-md bg-white border p-0.5 flex-shrink-0"
                                    />
                                  ) : (
                                    <div
                                      className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                      style={{ backgroundColor: profile.config.primaryColor || '#1F2A44' }}
                                    >
                                      {(profile.config.institutionAbbreviation || profile.name)?.charAt(0) || 'U'}
                                    </div>
                                  )}

                                  {/* Profile Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-sm truncate">{profile.name}</h3>
                                      {isSelected && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                          Active
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                      {profile.config.institutionAbbreviation && `${profile.config.institutionAbbreviation} • `}
                                      {profile.config.mascot || PROFILE_TYPE_LABELS[profile.profileType]}
                                    </p>
                                  </div>

                                  {/* Sub-units indicator */}
                                  {hasChildren && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpanded(profile.id);
                                      }}
                                      className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border bg-background hover:bg-muted transition-colors"
                                    >
                                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
                                      <span>{children.length} sub-unit{children.length !== 1 ? 's' : ''}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Child Profiles (Sub-units) */}
                              {hasChildren && isExpanded && (
                                <div className="ml-4 mt-1.5 space-y-1 border-l-2 border-primary/20 pl-3">
                                  {children.map(child => {
                                    const isChildSelected = editingProfile?.id === child.id;
                                    return (
                                      <div 
                                        key={child.id}
                                        className={`group rounded-md border p-2.5 cursor-pointer transition-all ${
                                          isChildSelected 
                                            ? 'border-primary bg-primary/5' 
                                            : 'border-border hover:border-primary/40 hover:bg-muted/30'
                                        }`}
                                        onClick={() => setEditingProfile(child)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-muted-foreground">{PROFILE_TYPE_ICONS[child.profileType]}</span>
                                          <span className="flex-1 text-sm font-medium truncate">{child.config.unitName || child.name}</span>
                                          {isChildSelected && (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                              Active
                                            </span>
                                          )}
                                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 flex-shrink-0">
                                            {PROFILE_TYPE_LABELS[child.profileType]}
                                          </Badge>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Profile Editor */}
                  <div className="lg:col-span-2">
                    {editingProfile ? (
                      <div className="space-y-4">
                        {/* Sticky Action Bar */}
                        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border rounded-lg p-3 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* Left: Editing indicator */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                  Editing
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{PROFILE_TYPE_ICONS[editingProfile.profileType]}</span>
                                <span className="font-semibold text-sm truncate max-w-[200px]">
                                  {editingProfile.config.unitName || editingProfile.name}
                                </span>
                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => navigate(`/admin/content-dna?profileId=${editingProfile.id}`)}
                              >
                                <Dna className="w-3 h-3" />
                                <span className="hidden sm:inline">Content DNA</span>
                                <ExternalLink className="w-3 h-3" />
                              </Button>

                              {editingProfile.profileType === 'university' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1"
                                  onClick={() => {
                                    setSubUnitParent(editingProfile);
                                    setShowSubUnitWizard(true);
                                  }}
                                >
                                  <Plus className="w-3 h-3" />
                                  <span className="hidden sm:inline">Add Sub-Unit</span>
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Duplicate"
                                onClick={() => {
                                  setProfileToDuplicate(editingProfile);
                                  setDuplicateName(`${editingProfile.config.unitName || editingProfile.name} (Copy)`);
                                  setDuplicateDialogOpen(true);
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                title="Delete"
                                onClick={() => {
                                  setProfileToDelete(editingProfile);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Editor Card */}
                        <Card>
                          <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">{PROFILE_TYPE_ICONS[editingProfile.profileType]}</span>
                              <Input
                                value={editingProfile.config.unitName || editingProfile.name}
                                onChange={(e) => {
                                  if (editingProfile.profileType === 'university') {
                                    handleRenameProfile(e.target.value);
                                  } else {
                                    handleUpdateConfig({ ...editingProfile.config, unitName: e.target.value });
                                  }
                                }}
                                className="font-serif text-lg font-bold h-auto py-1 px-2 border-transparent hover:border-border focus:border-border w-full sm:max-w-xs"
                              />
                            </div>
                            <CardDescription className="mt-1">
                              {editingProfile.profileType === 'university' 
                                ? 'Configure Content DNA, terminology, and branding'
                                : `Part of ${getParentProfile(editingProfile.id)?.name || 'parent institution'}`
                              }
                            </CardDescription>
                            <p className="text-xs text-muted-foreground mt-2">
                              Last updated {format(new Date(editingProfile.updatedAt), 'MMM d, yyyy \'at\' h:mm a')}
                            </p>
                          </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Profile Completion */}
                          {(() => {
                            const completion = getProfileCompletion(editingProfile.config);
                            const stats = dnaStats[editingProfile.id];
                            return (
                              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {completion.percentage === 100 ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <Settings className="w-5 h-5 text-secondary" />
                                    )}
                                    <span className="font-medium text-sm">Profile Setup</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {stats && (
                                      <Badge variant={stats.hasAnalysis ? "default" : "secondary"} className="gap-1">
                                        <Dna className="w-3 h-3" />
                                        {stats.hasAnalysis ? 'DNA Active' : `${stats.samples} samples`}
                                      </Badge>
                                    )}
                                    <Badge variant={completion.percentage === 100 ? "default" : "secondary"}>
                                      {completion.percentage}%
                                    </Badge>
                                  </div>
                                </div>
                                <Progress value={completion.percentage} className="h-2" />
                              </div>
                            );
                          })()}
                          
                          <InstitutionalConfig 
                            config={editingProfile.config} 
                            onChange={handleUpdateConfig}
                            profileId={editingProfile.id}
                          />
                        </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                          <Building2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                          <h3 className="font-medium text-lg mb-1">Select a Profile</h3>
                          <p className="text-sm text-muted-foreground max-w-sm">
                            Choose a profile from the list to edit, or create a new one to get started.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{profileToDelete?.name}"? 
              <br /><br />
              <strong>This will also delete:</strong>
              <ul className="list-disc list-inside mt-2 text-left">
                <li>All Content DNA samples ({dnaStats[profileToDelete?.id || '']?.samples || 0} samples)</li>
                <li>Voice analysis and brand platform data</li>
                <li>DNA adjustments and tuning</li>
              </ul>
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingProfile}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProfile} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingProfile}
            >
              {isDeletingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Delete Profile & Content DNA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Profile</DialogTitle>
            <DialogDescription>
              Create a copy of "{profileToDuplicate?.name}" with a new name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duplicate-name">New Profile Name</Label>
              <Input
                id="duplicate-name"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDuplicateProfile()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicateProfile} disabled={!duplicateName.trim()}>
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
