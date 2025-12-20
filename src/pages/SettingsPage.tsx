import { useState } from "react";
import { Header } from "@/components/Header";
import { InstitutionalConfig } from "@/components/InstitutionalConfig";
import { ProfileSetupWizard } from "@/components/ProfileSetupWizard";
import { SubUnitSetupWizard } from "@/components/SubUnitSetupWizard";
import { useInstitutionalProfiles, type InstitutionalProfile, type ProfileType } from "@/hooks/useInstitutionalProfiles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
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
import { 
  ArrowLeft,
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  Copy, 
  ChevronRight,
  FolderOpen,
  Sparkles,
  Palette,
  CheckCircle2,
  Circle,
  Dna,
  GraduationCap,
  Layers,
  Building,
  Briefcase,
  ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { InstitutionalConfig as InstitutionalConfigType, ProfileType as ConfigProfileType } from "@/types/uplaybook";

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

const SettingsPage = () => {
  const { profiles, createProfile, updateProfile, deleteProfile, duplicateProfile, getChildProfiles, getRootProfiles, getParentProfile } = useInstitutionalProfiles();
  const { toast } = useToast();
  
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

  const handleCreateProfile = async (name: string, config: InstitutionalConfigType) => {
    const profile = await createProfile(name, config, null, 'university');
    setShowWizard(false);
    if (profile) {
      setEditingProfile(profile);
      toast({ title: "Profile created", description: `"${profile.name}" is ready to use.` });
    }
  };

  const handleCreateSubUnit = async (name: string, config: InstitutionalConfigType, profileType: ConfigProfileType) => {
    if (!subUnitParent) return;
    const profile = await createProfile(name, config, subUnitParent.id, profileType as ProfileType);
    setShowSubUnitWizard(false);
    setSubUnitParent(null);
    if (profile) {
      // Expand parent to show the new sub-unit
      setExpandedProfiles(prev => new Set([...prev, subUnitParent.id]));
      setEditingProfile(profile);
      toast({ title: `${PROFILE_TYPE_LABELS[profileType as ProfileType]} created`, description: `"${name}" is now part of ${subUnitParent.name}.` });
    }
  };

  const openSubUnitWizard = (parentProfile: InstitutionalProfile) => {
    setSubUnitParent(parentProfile);
    setShowSubUnitWizard(true);
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
    await deleteProfile(profileToDelete.id);
    if (editingProfile?.id === profileToDelete.id) {
      setEditingProfile(null);
    }
    setDeleteDialogOpen(false);
    setProfileToDelete(null);
    toast({ title: "Profile deleted" });
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
    const ctaCount = (profile.config.primaryCTAs?.length || 0) + 
                     (profile.config.secondaryCTAs?.length || 0);
    if (ctaCount > 0) parts.push(`${ctaCount} CTAs`);
    return parts.length > 0 ? parts.join(' • ') : 'Empty profile';
  };

  // Calculate profile completion percentage and missing items - organized by category
  const getProfileCompletion = (config: InstitutionalConfigType) => {
    const checks = [
      // Identity (Essential)
      { key: 'name', label: 'Institution Name', category: 'Identity', priority: 1, done: !!config.institutionName?.trim() },
      { key: 'abbrev', label: 'Abbreviation', category: 'Identity', priority: 1, done: !!config.institutionAbbreviation?.trim() },
      { key: 'mascot', label: 'Mascot', category: 'Identity', priority: 2, done: !!config.mascot?.trim() },
      { key: 'slogans', label: 'Slogans', category: 'Identity', priority: 3, done: (config.slogans?.length || 0) > 0 },
      
      // Visual Branding
      { key: 'logo', label: 'Logo', category: 'Branding', priority: 1, done: !!config.logoUrl?.trim() },
      { key: 'primary', label: 'Primary Color', category: 'Branding', priority: 1, done: !!config.primaryColor && config.primaryColor !== '#1F2A44' },
      { key: 'accent', label: 'Accent Color', category: 'Branding', priority: 2, done: !!config.accentColor && config.accentColor !== '#2C7A7B' },
      
      // Contact Information
      { key: 'emailDomain', label: 'Email Domain', category: 'Contact', priority: 1, done: !!config.emailDomain?.trim() },
      { key: 'contactEmail', label: 'Contact Email', category: 'Contact', priority: 1, done: !!config.primaryContactEmail?.trim() },
      { key: 'contactPhone', label: 'Contact Phone', category: 'Contact', priority: 2, done: !!config.primaryContactPhone?.trim() },
      { key: 'website', label: 'Website Links', category: 'Contact', priority: 2, done: (config.websiteLinks?.length || 0) > 0 },
      
      // Digital Systems
      { key: 'portal', label: 'Student Portal', category: 'Systems', priority: 1, done: !!config.portalName?.trim() },
      { key: 'lms', label: 'LMS Name', category: 'Systems', priority: 2, done: !!config.lmsName?.trim() },
      { key: 'advising', label: 'Advising System', category: 'Systems', priority: 3, done: !!config.advisingSystemName?.trim() },
      
      // Locations & Facilities
      { key: 'buildings', label: 'Building Names', category: 'Locations', priority: 2, done: (config.buildingNames?.length || 0) > 0 },
      { key: 'supportCenters', label: 'Support Centers', category: 'Locations', priority: 2, done: (config.supportCenters?.length || 0) > 0 },
      { key: 'campusTerms', label: 'Campus Terms', category: 'Locations', priority: 3, done: (config.campusTerms?.length || 0) > 0 },
      
      // Offices
      { key: 'registrar', label: 'Registrar Office', category: 'Offices', priority: 2, done: !!config.registrarOffice?.trim() },
      { key: 'finaid', label: 'Financial Aid Office', category: 'Offices', priority: 2, done: !!config.financialAidOffice?.trim() },
      { key: 'admissions', label: 'Admissions Office', category: 'Offices', priority: 2, done: !!config.admissionsOffice?.trim() },
      
      // Academic Terms
      { key: 'academicTerms', label: 'Academic Terms', category: 'Terms', priority: 2, done: (config.academicTerms?.length || 0) > 0 },
      { key: 'currentTerm', label: 'Current Term', category: 'Terms', priority: 2, done: !!config.currentTermName?.trim() },
      { key: 'gradingTerms', label: 'Grading Terms', category: 'Terms', priority: 3, done: (config.gradingTerms?.length || 0) > 0 },
      
      // Style & Tone
      { key: 'toneRules', label: 'Tone Rules', category: 'Style', priority: 2, done: (config.toneRules?.length || 0) > 0 },
      { key: 'wordsToAvoid', label: 'Words to Avoid', category: 'Style', priority: 3, done: (config.wordsToAvoid?.length || 0) > 0 },
      { key: 'preferredPhrases', label: 'Preferred Phrases', category: 'Style', priority: 3, done: (config.preferredPhrases?.length || 0) > 0 },
      
      // CTAs
      { key: 'primaryCTAs', label: 'Primary CTAs', category: 'CTAs', priority: 2, done: (config.primaryCTAs?.length || 0) > 0 },
      { key: 'secondaryCTAs', label: 'Secondary CTAs', category: 'CTAs', priority: 3, done: (config.secondaryCTAs?.length || 0) > 0 },
    ];
    
    const completed = checks.filter(c => c.done).length;
    const total = checks.length;
    const percentage = Math.round((completed / total) * 100);
    
    // Group missing items by category
    const missingByCategory = checks
      .filter(c => !c.done)
      .reduce((acc, check) => {
        if (!acc[check.category]) acc[check.category] = [];
        acc[check.category].push(check);
        return acc;
      }, {} as Record<string, typeof checks>);
    
    // Get priority missing items (priority 1 and 2 first)
    const priorityMissing = checks
      .filter(c => !c.done && c.priority <= 2)
      .sort((a, b) => a.priority - b.priority);
    
    return { checks, completed, total, percentage, missingByCategory, priorityMissing };
  };

  const getEncouragingMessage = (percentage: number, missingCount: number) => {
    if (percentage === 100) return "Profile complete! Your institutional identity is fully configured.";
    if (percentage >= 80) return `Almost there! Just ${missingCount} more items to complete your profile.`;
    if (percentage >= 60) return "Great progress! Add more details to unlock better AI-generated content.";
    if (percentage >= 40) return "Good foundation! Continue adding terms, locations, and style preferences.";
    if (percentage >= 20) return "Getting started! Fill in key details to help generate on-brand content.";
    return "Let's build your institution's identity. The more details you add, the better your AI content.";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header with wave background */}
      <div className="relative overflow-hidden pb-12">
        <WaveBackground variant="default" />
        
        <div className="relative container mx-auto px-4 pt-10 pb-8">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
              <span>/</span>
              <span className="text-foreground">Institutional Profiles</span>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold">Institutional Profiles</h1>
                <p className="text-muted-foreground text-sm">
                  Create and manage institution profiles to generate content as different organizations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {showWizard ? (
            // Profile Setup Wizard (full screen)
            <Card className="col-span-full">
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
            // Sub-Unit Setup Wizard
            <Card className="col-span-full">
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
                  {/* Render profiles hierarchically */}
                  {getRootProfiles().map(profile => {
                    const children = getChildProfiles(profile.id);
                    const hasChildren = children.length > 0;
                    const isExpanded = expandedProfiles.has(profile.id);
                    
                    return (
                      <div key={profile.id}>
                        {/* Parent Profile Card */}
                        <Card 
                          className={`cursor-pointer transition-all hover:border-secondary/50 ${
                            editingProfile?.id === profile.id 
                              ? 'border-secondary bg-secondary/5 shadow-sm' 
                              : ''
                          }`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              {/* Expand/Collapse button for profiles with children */}
                              {hasChildren ? (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpanded(profile.id);
                                  }}
                                  className="mt-2 p-0.5 hover:bg-muted rounded transition-colors"
                                >
                                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                                </button>
                              ) : (
                                <div className="w-5" />
                              )}
                              
                              {/* Profile Icon/Logo */}
                              <div 
                                className="flex-1 flex items-start gap-3"
                                onClick={() => setEditingProfile(profile)}
                              >
                                {profile.config.logoUrl ? (
                                  <img
                                    src={profile.config.logoUrl}
                                    alt={profile.name}
                                    className="w-10 h-10 object-contain rounded bg-white border p-1 flex-shrink-0"
                                  />
                                ) : (
                                  <div
                                    className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                    style={{ backgroundColor: profile.config.primaryColor || '#1F2A44' }}
                                  >
                                    {(profile.config.institutionAbbreviation || profile.name)?.charAt(0) || 'U'}
                                  </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{PROFILE_TYPE_ICONS[profile.profileType]}</span>
                                    <h3 className="font-medium text-sm truncate">{profile.name}</h3>
                                    {editingProfile?.id === profile.id && (
                                      <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                        Editing
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {getProfileSummary(profile)}
                                  </p>
                                  {/* Color swatches and child count */}
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <div className="flex items-center gap-1">
                                      <div
                                        className="w-3 h-3 rounded-full border"
                                        style={{ backgroundColor: profile.config.primaryColor || '#1F2A44' }}
                                      />
                                      <div
                                        className="w-3 h-3 rounded-full border"
                                        style={{ backgroundColor: profile.config.accentColor || '#2C7A7B' }}
                                      />
                                    </div>
                                    {hasChildren && (
                                      <Badge variant="outline" className="text-[10px] h-4 px-1">
                                        {children.length} sub-unit{children.length > 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                    <span className="text-[10px] text-muted-foreground">
                                      {format(new Date(profile.updatedAt), 'MMM d')}
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Child Profiles (Sub-Units) */}
                        {hasChildren && isExpanded && (
                          <div className="ml-6 mt-1 space-y-1 border-l-2 border-muted pl-2">
                            {children.map(child => (
                              <Card 
                                key={child.id}
                                className={`cursor-pointer transition-all hover:border-secondary/50 ${
                                  editingProfile?.id === child.id 
                                    ? 'border-secondary bg-secondary/5 shadow-sm' 
                                    : ''
                                }`}
                                onClick={() => setEditingProfile(child)}
                              >
                                <CardContent className="p-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{PROFILE_TYPE_ICONS[child.profileType]}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm truncate">
                                          {child.config.unitName || child.name}
                                        </h4>
                                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                                          {PROFILE_TYPE_LABELS[child.profileType]}
                                        </Badge>
                                        {editingProfile?.id === child.id && (
                                          <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                            Editing
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
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
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
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
                            className="font-serif text-lg font-bold h-auto py-1 px-2 border-transparent hover:border-border focus:border-border max-w-xs"
                          />
                          {editingProfile.profileType !== 'university' && (
                            <Badge variant="outline">{PROFILE_TYPE_LABELS[editingProfile.profileType]}</Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          {editingProfile.profileType === 'university' 
                            ? 'Configure Content DNA, terminology, and branding for this profile'
                            : `Part of ${getParentProfile(editingProfile.id)?.name || 'parent institution'}`
                          }
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Add Sub-Unit button for university profiles */}
                        {editingProfile.profileType === 'university' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => openSubUnitWizard(editingProfile)}
                          >
                            <Plus className="w-3 h-3" />
                            Add Sub-Unit
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
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
                          onClick={() => {
                            setProfileToDelete(editingProfile);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Completion Progress */}
                    {(() => {
                      const completion = getProfileCompletion(editingProfile.config);
                      return (
                        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {completion.percentage === 100 ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <Dna className="w-5 h-5 text-secondary" />
                              )}
                              <span className="font-medium text-sm">Profile Completion</span>
                            </div>
                            <Badge variant={completion.percentage === 100 ? "default" : "secondary"}>
                              {completion.percentage}%
                            </Badge>
                          </div>
                          <Progress value={completion.percentage} className="h-2" />
                          <p className="text-sm text-muted-foreground">
                            {getEncouragingMessage(completion.percentage, completion.total - completion.completed)}
                          </p>
                          {completion.percentage < 100 && (
                            <div className="space-y-2 pt-1">
                              {/* Show missing items grouped by category */}
                              <div className="flex flex-wrap gap-1.5">
                                {completion.priorityMissing.slice(0, 6).map(check => (
                                  <Badge key={check.key} variant="outline" className="text-xs gap-1">
                                    <Circle className="w-2 h-2" />
                                    {check.label}
                                  </Badge>
                                ))}
                                {(completion.total - completion.completed) > 6 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{(completion.total - completion.completed) - 6} more
                                  </Badge>
                                )}
                              </div>
                              {/* Category breakdown */}
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {Object.entries(completion.missingByCategory).slice(0, 4).map(([cat, items]) => (
                                  <span key={cat} className="flex items-center gap-1">
                                    <span className="font-medium">{cat}:</span> {items.length} missing
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
        </div>
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{profileToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProfile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
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
};

export default SettingsPage;
