import { useState } from "react";
import { Header } from "@/components/Header";
import { InstitutionalConfig } from "@/components/InstitutionalConfig";
import { useInstitutionalProfiles, type InstitutionalProfile } from "@/hooks/useInstitutionalProfiles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { InstitutionalConfig as InstitutionalConfigType } from "@/types/persist";

const SettingsPage = () => {
  const { profiles, createProfile, updateProfile, deleteProfile, duplicateProfile } = useInstitutionalProfiles();
  const { toast } = useToast();
  
  const [editingProfile, setEditingProfile] = useState<InstitutionalProfile | null>(null);
  const [newProfileName, setNewProfileName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<InstitutionalProfile | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [profileToDuplicate, setProfileToDuplicate] = useState<InstitutionalProfile | null>(null);

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return;
    const profile = createProfile(newProfileName.trim());
    setNewProfileName("");
    setCreateDialogOpen(false);
    setEditingProfile(profile);
    toast({ title: "Profile created", description: `"${profile.name}" is ready to configure.` });
  };

  const handleUpdateConfig = (config: InstitutionalConfigType) => {
    if (!editingProfile) return;
    updateProfile(editingProfile.id, { config });
    setEditingProfile({ ...editingProfile, config });
  };

  const handleRenameProfile = (newName: string) => {
    if (!editingProfile || !newName.trim()) return;
    updateProfile(editingProfile.id, { name: newName.trim() });
    setEditingProfile({ ...editingProfile, name: newName.trim() });
  };

  const handleDeleteProfile = () => {
    if (!profileToDelete) return;
    deleteProfile(profileToDelete.id);
    if (editingProfile?.id === profileToDelete.id) {
      setEditingProfile(null);
    }
    setDeleteDialogOpen(false);
    setProfileToDelete(null);
    toast({ title: "Profile deleted" });
  };

  const handleDuplicateProfile = () => {
    if (!profileToDuplicate || !duplicateName.trim()) return;
    const newProfile = duplicateProfile(profileToDuplicate.id, duplicateName.trim());
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Your Profiles
                </h2>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-8">
                      <Plus className="w-3 h-3 mr-1" />
                      New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Profile</DialogTitle>
                      <DialogDescription>
                        Give your profile a name. You can configure the settings after creation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="profile-name">Profile Name</Label>
                        <Input
                          id="profile-name"
                          placeholder="e.g., Lakewood University, Spring Campaign"
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleCreateProfile()}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateProfile} disabled={!newProfileName.trim()}>
                        Create Profile
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {profiles.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <FolderOpen className="w-10 h-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      No profiles yet. Create one to get started.
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
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
                        <div className="flex items-start justify-between gap-2">
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
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Updated {format(new Date(profile.updatedAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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
                          Configure voice, terminology, and branding for this profile
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
                  <CardContent>
                    <InstitutionalConfig 
                      config={editingProfile.config} 
                      onChange={handleUpdateConfig} 
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
