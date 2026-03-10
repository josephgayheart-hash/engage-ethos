import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAgencyMode } from '@/hooks/useAgencyMode';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Shield,
  Home,
  ChevronRight,
  Building2,
  Activity,
  Clock,
  Library,
  TrendingUp,
  Loader2,
  Save,
  Pencil,
  X,
  Upload,
  Image,
  Palette,
  Trash2,
  Dna,
  FolderTree,
  FileText,
  MessageSquare,
  FileSignature
} from 'lucide-react';

interface UserStats {
  total: number;
  active: number;
  pending: number;
  recentLogins: number;
}

interface OnboardingStats {
  pending: number;
  approved: number;
  rejected: number;
}

interface ContentStats {
  institutionalProfiles: number;
  contentDNASamples: number;
  personalMessages: number;
  sharedTemplates: number;
}

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_LOGO_DIMENSION = 400; // Max width/height in pixels

export default function AdminConsolePage() {
  const { tenant, profile, isSuperAdmin, refreshProfile } = useAuth();
  const { activeWorkspace, canSwitch, refreshWorkspaces } = useWorkspace();
  const { labels } = useAgencyMode();
  const { toast } = useToast();

  // Use active workspace when super admin is switching, otherwise own tenant
  const effectiveTenant = canSwitch ? activeWorkspace : tenant;
  
  // Derive workspace-aware labels from the effective tenant, not the logged-in user's tenant
  const isOwnTenant = effectiveTenant?.id === tenant?.id;
  const effectiveTenantType = (effectiveTenant as any)?.tenant_type as 'university' | 'agency' | null;
  const isEffectiveAgency = effectiveTenantType === 'agency';
  
  // Platform Owner = super admin viewing their own (CampusVoice) workspace
  const isPlatformOwner = isSuperAdmin && isOwnTenant;
  
  const adminLabel = isPlatformOwner
    ? 'Platform Admin'
    : isEffectiveAgency
      ? 'Agency Partner Admin'
      : 'Institution Admin';
  
  const adminDescription = isPlatformOwner
    ? 'Manage platform-wide settings and operations'
    : isEffectiveAgency
      ? "Manage your agency's platform settings and partner institutions"
      : "Manage your institution's platform settings";
  
  const brandingLabel = isPlatformOwner
    ? 'Platform Branding'
    : isEffectiveAgency
      ? 'Agency Partner Branding'
      : 'Institution Branding';
  
  const entityTerm = isPlatformOwner ? 'platform' : isEffectiveAgency ? 'agency' : 'institution';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userStats, setUserStats] = useState<UserStats>({ total: 0, active: 0, pending: 0, recentLogins: 0 });
  const [onboardingStats, setOnboardingStats] = useState<OnboardingStats>({ pending: 0, approved: 0, rejected: 0 });
  const [contentStats, setContentStats] = useState<ContentStats>({ institutionalProfiles: 0, contentDNASamples: 0, personalMessages: 0, sharedTemplates: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Institution editing state
  const [isEditingInstitution, setIsEditingInstitution] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [isSavingInstitution, setIsSavingInstitution] = useState(false);
  
  // Logo state
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Color picker state
  const [primaryColor, setPrimaryColor] = useState('#1F2A44');
  const [accentColor, setAccentColor] = useState('#2C7A7B');
  const [primaryColorInput, setPrimaryColorInput] = useState('#1F2A44');
  const [accentColorInput, setAccentColorInput] = useState('#2C7A7B');
  const [isSavingColors, setIsSavingColors] = useState(false);

  useEffect(() => {
    if (effectiveTenant?.institution_name) {
      setInstitutionName(effectiveTenant.institution_name);
    } else {
      setInstitutionName('');
    }
    if (effectiveTenant?.logo_url) {
      setLogoUrl(effectiveTenant.logo_url);
    } else {
      setLogoUrl(null);
    }
    if (effectiveTenant?.primary_color) {
      setPrimaryColor(effectiveTenant.primary_color);
      setPrimaryColorInput(effectiveTenant.primary_color);
    } else {
      setPrimaryColor('#1F2A44');
      setPrimaryColorInput('#1F2A44');
    }
    if (effectiveTenant?.accent_color) {
      setAccentColor(effectiveTenant.accent_color);
      setAccentColorInput(effectiveTenant.accent_color);
    } else {
      setAccentColor('#2C7A7B');
      setAccentColorInput('#2C7A7B');
    }
  }, [effectiveTenant]);

  const handleSaveInstitution = async () => {
    if (!effectiveTenant?.id || !institutionName.trim()) return;
    
    setIsSavingInstitution(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ institution_name: institutionName.trim() })
        .eq('id', effectiveTenant.id);

      if (error) throw error;

      await refreshProfile();
      await refreshWorkspaces();
      setIsEditingInstitution(false);
      
      toast({
        title: 'Institution Updated',
        description: 'Your institution name has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update institution name',
        variant: 'destructive',
      });
    } finally {
      setIsSavingInstitution(false);
    }
  };

  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        let { width, height } = img;
        
        // Scale down if needed
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
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to resize image'));
          },
          'image/png',
          0.9
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !effectiveTenant?.id) return;

    if (file.size > MAX_LOGO_SIZE) {
      toast({
        title: 'File too large',
        description: 'Logo must be less than 2MB',
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingLogo(true);
    try {
      // Resize the image
      const resizedBlob = await resizeImage(file);
      const fileName = `${effectiveTenant.id}/logo-${Date.now()}.png`;

      // Delete old logo if exists
      if (effectiveTenant.logo_url) {
        const oldPath = effectiveTenant.logo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('institution-logos')
            .remove([`${effectiveTenant.id}/${oldPath}`]);
        }
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from('institution-logos')
        .upload(fileName, resizedBlob, { 
          contentType: 'image/png',
          upsert: true 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('institution-logos')
        .getPublicUrl(fileName);

      // Update tenant with logo URL
      const { error: updateError } = await supabase
        .from('tenants')
        .update({ logo_url: publicUrl })
        .eq('id', effectiveTenant.id);

      if (updateError) throw updateError;

      setLogoUrl(publicUrl);
      await refreshProfile();
      await refreshWorkspaces();

      toast({
        title: 'Logo Uploaded',
        description: 'Your institution logo has been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload logo',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!effectiveTenant?.id || !effectiveTenant.logo_url) return;

    setIsUploadingLogo(true);
    try {
      // Extract filename from URL and delete
      const urlParts = effectiveTenant.logo_url!.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      await supabase.storage
        .from('institution-logos')
        .remove([`${effectiveTenant.id}/${fileName}`]);

      // Update tenant to remove logo URL
      const { error } = await supabase
        .from('tenants')
        .update({ logo_url: null })
        .eq('id', effectiveTenant.id);

      if (error) throw error;

      setLogoUrl(null);
      await refreshProfile();
      await refreshWorkspaces();

      toast({
        title: 'Logo Removed',
        description: 'Your institution logo has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove logo',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveColors = async () => {
    if (!effectiveTenant?.id) return;

    setIsSavingColors(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ 
          primary_color: primaryColorInput,
          accent_color: accentColorInput 
        })
        .eq('id', effectiveTenant.id);

      if (error) throw error;

      setPrimaryColor(primaryColorInput);
      setAccentColor(accentColorInput);
      await refreshProfile();
      await refreshWorkspaces();

      toast({
        title: 'Colors Saved',
        description: 'Your institution colors have been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save colors',
        variant: 'destructive',
      });
    } finally {
      setIsSavingColors(false);
    }
  };

  const handleColorInputChange = (value: string, setter: (v: string) => void) => {
    // Allow typing partial hex codes
    if (value === '' || /^#?[0-9A-Fa-f]{0,6}$/.test(value)) {
      // Add # prefix if not present
      if (value && !value.startsWith('#')) {
        value = '#' + value;
      }
      setter(value);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!effectiveTenant?.id) return;
      
      try {
        // Fetch users in tenant
        const { data: users } = await supabase
          .from('profiles')
          .select('*')
          .eq('tenant_id', effectiveTenant.id)
          .order('last_login_at', { ascending: false });

        if (users) {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          
          setUserStats({
            total: users.length,
            active: users.filter(u => u.status === 'active').length,
            pending: users.filter(u => u.status === 'pending' || u.status === 'invited').length,
            recentLogins: users.filter(u => u.last_login_at && new Date(u.last_login_at) > weekAgo).length
          });
          setRecentUsers(users.slice(0, 5));
        }

        // Fetch onboarding requests (only for super admins)
        if (isSuperAdmin) {
          const { data: requests } = await supabase
            .from('onboarding_requests')
            .select('request_status');

          if (requests) {
            setOnboardingStats({
              pending: requests.filter(r => r.request_status === 'submitted').length,
              approved: requests.filter(r => r.request_status === 'approved').length,
              rejected: requests.filter(r => r.request_status === 'rejected').length
            });
          }
        }

        // Fetch content stats for the tenant
        const [profilesResult, dnaSamplesResult, messagesResult, templatesResult] = await Promise.all([
          supabase.from('institutional_profiles').select('id').eq('tenant_id', effectiveTenant.id),
          supabase.from('content_dna_samples').select('id').eq('tenant_id', effectiveTenant.id),
          supabase.from('personal_messages').select('id').eq('tenant_id', effectiveTenant.id),
          supabase.from('shared_templates').select('id').eq('tenant_id', effectiveTenant.id),
        ]);

        setContentStats({
          institutionalProfiles: profilesResult.data?.length || 0,
          contentDNASamples: dnaSamplesResult.data?.length || 0,
          personalMessages: messagesResult.data?.length || 0,
          sharedTemplates: templatesResult.data?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [effectiveTenant?.id, isSuperAdmin]);

  const formatLastLogin = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const adminLinks = [
    {
      title: 'User Management',
      description: isSuperAdmin ? 'Create, edit, and manage user accounts' : `View users in your ${entityTerm}`,
      icon: Users,
      href: '/admin/users',
      color: 'bg-[hsl(222,47%,14%)]',
      stat: `${userStats.total} users`
    },
    // Only show onboarding requests to super admins
    ...(isSuperAdmin ? [{
      title: 'Onboarding Requests',
      description: 'Review and approve access requests',
      icon: UserPlus,
      href: '/admin/onboarding',
      color: 'bg-[hsl(173,58%,39%)]',
      stat: onboardingStats.pending > 0 ? `${onboardingStats.pending} pending` : 'No pending'
    },
    {
      title: 'NDA Links',
      description: 'Create and manage demo confidentiality agreements',
      icon: FileSignature,
      href: '/admin/nda-links',
      color: 'bg-[hsl(250,52%,47%)]',
      stat: 'Manage'
    },
    {
      title: 'Security & QA',
      description: 'Security events, rate limits, and QA diagnostics',
      icon: Shield,
      href: '/admin/qa',
      color: 'bg-[hsl(0,72%,51%)]',
      stat: 'Monitor'
    }] : []),
    {
      title: isEffectiveAgency ? 'Partner Institutions' : 'Institution Settings',
      description: isEffectiveAgency ? 'Manage partner institution profiles and branding' : 'Branding, profiles, and Content DNA management',
      icon: Building2,
      href: isEffectiveAgency ? '/agency/clients' : '/university-settings',
      color: 'bg-[hsl(262,52%,47%)]',
      stat: contentStats.institutionalProfiles > 0 ? `${contentStats.institutionalProfiles} profiles` : 'Configure'
    },
    {
      title: 'Content DNA Studio',
      description: 'Upload samples, tune voice dimensions, and manage your content library',
      icon: Dna,
      href: '/admin/content-dna',
      color: 'bg-[hsl(173,58%,39%)]',
      stat: contentStats.contentDNASamples > 0 ? `${contentStats.contentDNASamples} samples` : 'Add samples'
    },
    {
      title: 'Content Library',
      description: 'Personal and shared content, images, and templates',
      icon: MessageSquare,
      href: '/personal-library',
      color: 'bg-[hsl(210,70%,50%)]',
      stat: `${contentStats.personalMessages} messages`
    },
    {
      title: 'Library Approvals',
      description: 'Review submitted templates and playbooks',
      icon: Library,
      href: '/approvals',
      color: 'bg-[hsl(45,93%,47%)]',
      stat: 'Review queue'
    },
  ];

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]">
      {/* Header */}
      <div className="border-b border-[hsl(220,13%,88%)] bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-[hsl(220,14%,46%)] mb-2">
            <Link to="/dashboard" className="hover:text-[hsl(222,47%,11%)]">
              <Home className="w-4 h-4" />
            </Link>
            <span>/</span>
            <span className="text-[hsl(222,47%,11%)]">{adminLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-[hsl(222,47%,11%)]">{adminLabel}</h1>
              <p className="text-[hsl(220,14%,46%)]">{adminDescription}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {effectiveTenant?.institution_name || 'Loading...'}
              </Badge>
              <Badge className="bg-[hsl(222,47%,14%)]">
                <Shield className="w-3 h-3 mr-1" />
                {isPlatformOwner ? 'Platform Owner' : 'Admin'}
              </Badge>
            </div>
          </div>
        </div>
        {/* Accent color bar */}
        {effectiveTenant?.accent_color && (
          <div 
            className="h-1 w-full" 
            style={{ backgroundColor: effectiveTenant.accent_color }}
          />
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-6 border-[hsl(220,13%,88%)] bg-gradient-to-r from-[hsl(222,47%,14%)] to-[hsl(222,47%,20%)] text-white">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt={effectiveTenant?.institution_name || 'Institution'} 
                  className="h-16 w-auto object-contain bg-white/10 rounded-lg p-2"
                  style={{ maxWidth: '150px' }}
                />
              )}
              <div>
                <h2 className="font-serif text-xl font-bold mb-2">
                  Welcome, {profile?.first_name}
                </h2>
                <p className="text-white/80">
                  {isPlatformOwner 
                    ? `Welcome to the CampusVoice platform admin. Manage workspaces, users, and platform-wide configuration.`
                    : `As an administrator for ${effectiveTenant?.institution_name || 'your organization'}, you can manage users, review access requests, and configure ${isEffectiveAgency ? 'partner institution' : 'institutional'} settings.`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Institution Branding */}
        <Card className="mb-6 border-[hsl(220,13%,88%)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-[hsl(222,47%,11%)]">
                  <Building2 className="w-5 h-5" />
                   {brandingLabel}
                 </CardTitle>
                 <CardDescription>Manage your {entityTerm}'s name, logo, and colors</CardDescription>
              </div>
              {!isEditingInstitution && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingInstitution(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditingInstitution ? (
              <div className="space-y-6">
                {/* Institution Name */}
                <div className="space-y-2">
                  <Label htmlFor="institutionName">{isPlatformOwner ? 'Platform Name' : isEffectiveAgency ? 'Agency Name' : 'Institution Name'}</Label>
                  <Input
                    id="institutionName"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder={`Enter ${entityTerm} name`}
                    className="max-w-md"
                  />
                </div>

                {/* Logo Upload */}
                <div className="space-y-3">
                  <Label>{isPlatformOwner ? 'Platform Logo' : isEffectiveAgency ? 'Agency Logo' : 'Institution Logo'}</Label>
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <div className="relative">
                        <img 
                          src={logoUrl} 
                          alt="Institution logo" 
                          className="h-20 w-auto object-contain border rounded-lg p-2 bg-muted/30"
                          style={{ maxWidth: '200px' }}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={handleRemoveLogo}
                          disabled={isUploadingLogo}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-20 w-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30">
                        <Image className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        variant="outline"
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
                            {logoUrl ? 'Change Logo' : 'Upload Logo'}
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 2MB. Will be resized if larger than 400px.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Brand Colors
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor" className="text-xs text-muted-foreground">Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="primaryColor"
                          value={primaryColorInput}
                          onChange={(e) => setPrimaryColorInput(e.target.value)}
                          className="h-10 w-14 rounded border cursor-pointer"
                        />
                        <Input
                          value={primaryColorInput}
                          onChange={(e) => handleColorInputChange(e.target.value, setPrimaryColorInput)}
                          placeholder="#1F2A44"
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accentColor" className="text-xs text-muted-foreground">Accent Color (Header Bar)</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="accentColor"
                          value={accentColorInput}
                          onChange={(e) => setAccentColorInput(e.target.value)}
                          className="h-10 w-14 rounded border cursor-pointer"
                        />
                        <Input
                          value={accentColorInput}
                          onChange={(e) => handleColorInputChange(e.target.value, setAccentColorInput)}
                          placeholder="#2C7A7B"
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Preview:</span>
                    <div 
                      className="h-4 w-24 rounded" 
                      style={{ backgroundColor: accentColorInput }}
                    />
                  </div>
                </div>

                {/* Save Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={async () => {
                      await handleSaveInstitution();
                      await handleSaveColors();
                    }} 
                    disabled={isSavingInstitution || isSavingColors || !institutionName.trim()}
                    className="bg-[hsl(222,47%,14%)] hover:bg-[hsl(222,47%,20%)]"
                  >
                    {(isSavingInstitution || isSavingColors) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save All Changes
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingInstitution(false);
                      setInstitutionName(effectiveTenant?.institution_name || '');
                      setPrimaryColorInput(effectiveTenant?.primary_color || '#1F2A44');
                      setAccentColorInput(effectiveTenant?.accent_color || '#2C7A7B');
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt={effectiveTenant?.institution_name || 'Institution'} 
                      className="h-16 w-auto object-contain border rounded-lg p-2 bg-muted/30"
                      style={{ maxWidth: '150px' }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[hsl(222,47%,14%)]/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[hsl(222,47%,14%)]" />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-[hsl(222,47%,11%)]">
                      {effectiveTenant?.institution_name || 'Loading...'}
                    </p>
                    <p className="text-sm text-[hsl(220,14%,46%)]">Your {entityTerm}'s display name</p>
                  </div>
                </div>
                {effectiveTenant?.accent_color && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Header accent:</span>
                    <div 
                      className="h-4 w-24 rounded" 
                      style={{ backgroundColor: effectiveTenant.accent_color }}
                    />
                    <span className="text-xs text-muted-foreground font-mono">{effectiveTenant.accent_color}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <Card className="border-[hsl(220,13%,88%)]">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[hsl(222,47%,14%)]/10">
                  <Users className="w-4 h-4 text-[hsl(222,47%,14%)]" />
                </div>
                <div>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[hsl(220,14%,46%)]" />
                  ) : (
                    <p className="text-xl font-bold text-[hsl(222,47%,11%)]">{userStats.total}</p>
                  )}
                  <p className="text-[10px] text-[hsl(220,14%,46%)]">Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(220,13%,88%)]">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[hsl(158,64%,42%)]/10">
                  <Activity className="w-4 h-4 text-[hsl(158,64%,42%)]" />
                </div>
                <div>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[hsl(220,14%,46%)]" />
                  ) : (
                    <p className="text-xl font-bold text-[hsl(222,47%,11%)]">{userStats.active}</p>
                  )}
                  <p className="text-[10px] text-[hsl(220,14%,46%)]">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(220,13%,88%)]">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[hsl(262,52%,47%)]/10">
                  <FolderTree className="w-4 h-4 text-[hsl(262,52%,47%)]" />
                </div>
                <div>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[hsl(220,14%,46%)]" />
                  ) : (
                    <p className="text-xl font-bold text-[hsl(222,47%,11%)]">{contentStats.institutionalProfiles}</p>
                  )}
                  <p className="text-[10px] text-[hsl(220,14%,46%)]">Profiles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(220,13%,88%)]">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[hsl(173,58%,39%)]/10">
                  <Dna className="w-4 h-4 text-[hsl(173,58%,39%)]" />
                </div>
                <div>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[hsl(220,14%,46%)]" />
                  ) : (
                    <p className="text-xl font-bold text-[hsl(222,47%,11%)]">{contentStats.contentDNASamples}</p>
                  )}
                  <p className="text-[10px] text-[hsl(220,14%,46%)]">DNA Samples</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(220,13%,88%)]">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[hsl(210,70%,50%)]/10">
                  <MessageSquare className="w-4 h-4 text-[hsl(210,70%,50%)]" />
                </div>
                <div>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[hsl(220,14%,46%)]" />
                  ) : (
                    <p className="text-xl font-bold text-[hsl(222,47%,11%)]">{contentStats.personalMessages}</p>
                  )}
                  <p className="text-[10px] text-[hsl(220,14%,46%)]">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(220,13%,88%)]">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[hsl(45,93%,47%)]/10">
                  <Library className="w-4 h-4 text-[hsl(45,93%,47%)]" />
                </div>
                <div>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[hsl(220,14%,46%)]" />
                  ) : (
                    <p className="text-xl font-bold text-[hsl(222,47%,11%)]">{contentStats.sharedTemplates}</p>
                  )}
                  <p className="text-[10px] text-[hsl(220,14%,46%)]">Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Admin Links */}
          <div className="md:col-span-2">
            <h2 className="font-serif text-lg font-semibold text-[hsl(222,47%,11%)] mb-4">Administration</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adminLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Card className="h-full border-[hsl(220,13%,88%)] hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className={`p-2.5 rounded-lg ${link.color} text-white`}>
                          <link.icon className="w-5 h-5" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-[hsl(220,14%,46%)] group-hover:text-[hsl(222,47%,11%)] transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardTitle className="text-base mb-1 text-[hsl(222,47%,11%)]">{link.title}</CardTitle>
                      <CardDescription className="text-xs text-[hsl(220,14%,46%)] mb-2">{link.description}</CardDescription>
                      <Badge variant="secondary" className="text-xs">{link.stat}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="font-serif text-lg font-semibold text-[hsl(222,47%,11%)] mb-4">Recent Users</h2>
            <Card className="border-[hsl(220,13%,88%)]">
              <CardContent className="pt-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[hsl(220,14%,46%)]" />
                  </div>
                ) : recentUsers.length === 0 ? (
                  <div className="text-center py-8 text-[hsl(220,14%,46%)]">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No users yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[280px]">
                    <div className="space-y-3">
                      {recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[hsl(210,20%,94%)] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[hsl(222,47%,14%)] flex items-center justify-center text-white text-xs font-medium">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[hsl(222,47%,11%)]">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-xs text-[hsl(220,14%,46%)]">{user.department || 'No department'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={user.status === 'active' ? 'default' : 'secondary'}
                              className={`text-xs ${user.status === 'active' ? 'bg-[hsl(158,64%,42%)]' : ''}`}
                            >
                              {user.status}
                            </Badge>
                            <p className="text-xs text-[hsl(220,14%,46%)] mt-1 flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3" />
                              {formatLastLogin(user.last_login_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
