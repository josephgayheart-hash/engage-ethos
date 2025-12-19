import { useState } from "react";
import { Header } from "@/components/Header";
import { InstitutionalConfig } from "@/components/InstitutionalConfig";
import { ProfileSetupWizard } from "@/components/ProfileSetupWizard";
import { useInstitutionalProfiles, type InstitutionalProfile } from "@/hooks/useInstitutionalProfiles";
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
  Dna
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { InstitutionalConfig as InstitutionalConfigType } from "@/types/uplaybook";

const SettingsPage = () => {
  const { profiles, createProfile, updateProfile, deleteProfile, duplicateProfile } = useInstitutionalProfiles();
  const { toast } = useToast();
  
  const [editingProfile, setEditingProfile] = useState<InstitutionalProfile | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<InstitutionalProfile | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [profileToDuplicate, setProfileToDuplicate] = useState<InstitutionalProfile | null>(null);

  const handleCreateProfile = async (name: string, config: InstitutionalConfigType) => {
    const profile = await createProfile(name, config);
    setShowWizard(false);
    if (profile) {
      setEditingProfile(profile);
      toast({ title: "Profile created", description: `"${profile.name}" is ready to use.` });
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

  // Calculate profile completion percentage and missing items
  const getProfileCompletion = (config: InstitutionalConfigType) => {
    const checks = [
      { key: 'name', label: 'Institution Name', done: !!config.institutionName?.trim() },
      { key: 'abbrev', label: 'Abbreviation', done: !!config.institutionAbbreviation?.trim() },
      { key: 'logo', label: 'Logo', done: !!config.logoUrl?.trim() },
      { key: 'primary', label: 'Primary Color', done: !!config.primaryColor && config.primaryColor !== '#1F2A44' },
      { key: 'accent', label: 'Accent Color', done: !!config.accentColor && config.accentColor !== '#2C7A7B' },
      { key: 'email', label: 'Email Domain', done: !!config.emailDomain?.trim() },
      { key: 'contact', label: 'Contact Email', done: !!config.primaryContactEmail?.trim() },
      { key: 'website', label: 'Website Links', done: (config.websiteLinks?.length || 0) > 0 },
    ];
    
    const completed = checks.filter(c => c.done).length;
    const total = checks.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { checks, completed, total, percentage };
  };

  const getEncouragingMessage = (percentage: number) => {
    if (percentage === 100) return "Profile complete! Your institutional identity is fully configured.";
    if (percentage >= 75) return "Almost there! Just a few more details to complete your profile.";
    if (percentage >= 50) return "Great progress! Continue adding details to strengthen your brand identity.";
    if (percentage >= 25) return "Good start! Keep going to unlock the full power of branded content generation.";
    return "Let's build your institution's identity. Complete more fields to get better AI-generated content.";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Institutional Profiles</span>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold">Institutional Profiles</h1>
                <p className="text-muted-foreground text-sm">
                  Create and manage institution profiles to generate content as different organizations
                </p>
              </div>
            </div>
          </div>

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
                  {profiles.map(profile => (
                    <Card 
                      key={profile.id}
                      className={`cursor-pointer transition-all hover:border-secondary/50 ${
                        editingProfile?.id === profile.id 
                          ? 'border-secondary bg-secondary/5 shadow-sm' 
                          : ''
                      }`}
                      onClick={() => setEditingProfile(profile)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {/* Profile Icon/Logo */}
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
                            {/* Color swatches */}
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
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(profile.updatedAt), 'MMM d')}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                          <Input
                            value={editingProfile.name}
                            onChange={(e) => handleRenameProfile(e.target.value)}
                            className="font-serif text-lg font-bold h-auto py-1 px-2 border-transparent hover:border-border focus:border-border max-w-xs"
                          />
                          <Sparkles className="w-4 h-4 text-secondary" />
                        </div>
                        <CardDescription className="mt-1">
                          Configure Content DNA, terminology, and branding for this profile
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setProfileToDuplicate(editingProfile);
                            setDuplicateName(`${editingProfile.name} (Copy)`);
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
                            {getEncouragingMessage(completion.percentage)}
                          </p>
                          {completion.percentage < 100 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {completion.checks.filter(c => !c.done).slice(0, 4).map(check => (
                                <Badge key={check.key} variant="outline" className="text-xs gap-1">
                                  <Circle className="w-2 h-2" />
                                  {check.label}
                                </Badge>
                              ))}
                              {completion.checks.filter(c => !c.done).length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{completion.checks.filter(c => !c.done).length - 4} more
                                </Badge>
                              )}
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
