import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useInstitutionalProfiles, type InstitutionalProfile, type ProfileType } from "@/hooks/useInstitutionalProfiles";
import { ProfileSetupWizard } from "@/components/ProfileSetupWizard";
import { SubUnitSetupWizard } from "@/components/SubUnitSetupWizard";
import { InstitutionalConfig } from "@/components/InstitutionalConfig";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Building2,
  MoreHorizontal,
  Pencil,
  Trash2,
  PauseCircle,
  PlayCircle,
  Archive,
  Sparkles,
  MessageSquare,
  Search,
  CheckCircle,
  Palette,
  GraduationCap,
  Layers,
  Building,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Dna,
  Settings,
  Copy,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import type { InstitutionalConfig as InstitutionalConfigType, ProfileType as ConfigProfileType } from "@/types/campusvoice";

const PROFILE_TYPE_ICONS: Record<ProfileType, React.ReactNode> = {
  university: <Building2 className="w-4 h-4" />,
  college: <GraduationCap className="w-4 h-4" />,
  division: <Layers className="w-4 h-4" />,
  unit: <Building className="w-4 h-4" />,
  department: <Briefcase className="w-4 h-4" />,
};

const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  university: 'Partner Institution',
  college: 'College',
  division: 'Division',
  unit: 'Unit',
  department: 'Department',
};

export default function AgencyClientsPage() {
  const { tenant, profile: userProfile } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { 
    profiles, 
    createProfile, 
    updateProfile, 
    deleteProfile, 
    duplicateProfile,
    getChildProfiles, 
    getRootProfiles,
    refreshProfiles,
    isLoading 
  } = useInstitutionalProfiles();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Wizard states
  const [showWizard, setShowWizard] = useState(false);
  const [showSubUnitWizard, setShowSubUnitWizard] = useState(false);
  const [subUnitParent, setSubUnitParent] = useState<InstitutionalProfile | null>(null);
  
  // Editing/Config states
  const [editingProfile, setEditingProfile] = useState<InstitutionalProfile | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<InstitutionalConfigType | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Delete/Duplicate dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<InstitutionalProfile | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [profileToDuplicate, setProfileToDuplicate] = useState<InstitutionalProfile | null>(null);
  
  // Expanded state for hierarchy view
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());
  
  // DNA stats
  const [dnaStats, setDnaStats] = useState<Record<string, { samples: number; hasAnalysis: boolean }>>({});
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({});

  // Fetch DNA stats and message counts
  useEffect(() => {
    const fetchStats = async () => {
      if (!tenant?.id || profiles.length === 0) return;

      // Fetch DNA stats
      const { data: dnaData } = await supabase
        .from('content_dna_analysis')
        .select('profile_id')
        .eq('tenant_id', tenant.id);

      const { data: samplesData } = await supabase
        .from('content_dna_samples')
        .select('profile_id')
        .eq('tenant_id', tenant.id);

      const stats: Record<string, { samples: number; hasAnalysis: boolean }> = {};
      
      profiles.forEach(p => {
        stats[p.id] = { samples: 0, hasAnalysis: false };
      });

      dnaData?.forEach(d => {
        if (d.profile_id && stats[d.profile_id]) {
          stats[d.profile_id].hasAnalysis = true;
        }
      });

      samplesData?.forEach(s => {
        if (s.profile_id && stats[s.profile_id]) {
          stats[s.profile_id].samples++;
        }
      });

      setDnaStats(stats);

      // Fetch message counts
      const { data: messagesData } = await supabase
        .from('personal_messages')
        .select('institutional_profile_id')
        .eq('tenant_id', tenant.id);

      const counts: Record<string, number> = {};
      messagesData?.forEach(msg => {
        if (msg.institutional_profile_id) {
          counts[msg.institutional_profile_id] = (counts[msg.institutional_profile_id] || 0) + 1;
        }
      });
      setMessageCounts(counts);
    };

    fetchStats();
  }, [tenant?.id, profiles]);

  // Filter root profiles
  const rootProfiles = getRootProfiles();
  const filteredProfiles = rootProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase());
    // For now we don't have client_status on profiles, so skip status filter
    return matchesSearch;
  });

  // Handlers
  const handleCreateClient = async (name: string, config: InstitutionalConfigType) => {
    const profile = await createProfile(name, config, null, 'university');
    setShowWizard(false);
    if (profile) {
      toast({ 
        title: "Institution added", 
        description: `${profile.name} has been added as a partner institution.` 
      });
    }
  };

  const handleCreateSubUnit = async (name: string, config: InstitutionalConfigType, profileType: ConfigProfileType) => {
    if (!subUnitParent) return;
    const profile = await createProfile(name, config, subUnitParent.id, profileType as ProfileType);
    setShowSubUnitWizard(false);
    setSubUnitParent(null);
    if (profile) {
      setExpandedProfiles(prev => new Set([...prev, subUnitParent.id]));
      toast({ 
        title: `${PROFILE_TYPE_LABELS[profileType as ProfileType]} created`, 
        description: `"${name}" is now part of ${subUnitParent.name}.` 
      });
    }
  };

  const handleConfigChange = (config: InstitutionalConfigType) => {
    setPendingConfig(config);
    setHasUnsavedChanges(true);
  };

  const handleSaveConfig = async () => {
    if (!editingProfile || !pendingConfig) return;
    await updateProfile(editingProfile.id, { config: pendingConfig });
    setEditingProfile({ ...editingProfile, config: pendingConfig });
    setHasUnsavedChanges(false);
    toast({ title: "Institution updated", description: "Configuration has been saved." });
  };

  const handleCloseConfigDialog = (open: boolean) => {
    if (!open && hasUnsavedChanges && pendingConfig && editingProfile) {
      // Auto-save on close
      updateProfile(editingProfile.id, { config: pendingConfig });
    }
    setShowConfigDialog(open);
    if (!open) {
      setEditingProfile(null);
      setPendingConfig(null);
      setHasUnsavedChanges(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!profileToDelete) return;
    
    try {
      // Delete associated Content DNA
      await supabase.from('content_dna_samples').delete().eq('profile_id', profileToDelete.id);
      await supabase.from('content_dna_analysis').delete().eq('profile_id', profileToDelete.id);
      await supabase.from('content_dna_adjustments').delete().eq('profile_id', profileToDelete.id);
      
      await deleteProfile(profileToDelete.id);
      
      if (editingProfile?.id === profileToDelete.id) {
        setEditingProfile(null);
        setShowConfigDialog(false);
      }
      
      toast({ title: "Institution removed", description: "Institution and all associated data have been removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to remove institution", variant: "destructive" });
    } finally {
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
      toast({ title: "Client duplicated", description: `"${newProfile.name}" created.` });
    }
  };

  const toggleExpand = (profileId: string) => {
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

  // Recursive profile tree renderer
  const renderProfileTree = (profile: InstitutionalProfile, depth: number = 0) => {
    const children = getChildProfiles(profile.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedProfiles.has(profile.id);
    const stats = dnaStats[profile.id] || { samples: 0, hasAnalysis: false };
    const msgCount = messageCounts[profile.id] || 0;

    return (
      <div key={profile.id}>
        <Card 
          className={`hover:border-primary/30 transition-colors cursor-pointer ${
            editingProfile?.id === profile.id ? 'border-primary ring-1 ring-primary' : ''
          }`}
          style={{ marginLeft: depth * 24 }}
          onClick={() => {
            setEditingProfile(profile);
            setShowConfigDialog(true);
          }}
        >
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(profile.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {!hasChildren && <div className="w-6" />}
                
                {profile.config?.logoUrl ? (
                  <img
                    src={profile.config.logoUrl}
                    alt={profile.name}
                    className="w-10 h-10 object-contain rounded-lg border bg-white p-1 flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: profile.config?.primaryColor || "#1F2A44" }}
                  >
                    {PROFILE_TYPE_ICONS[profile.profileType]}
                    <span className="sr-only">{PROFILE_TYPE_LABELS[profile.profileType]}</span>
                  </div>
                )}
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground truncate">{profile.name}</h3>
                    {profile.profileType !== 'university' && (
                      <Badge variant="outline" className="text-xs">
                        {PROFILE_TYPE_LABELS[profile.profileType]}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {msgCount} messages
                    </span>
                    {stats.hasAnalysis && (
                      <span className="flex items-center gap-1 text-primary">
                        <Dna className="h-3 w-3" />
                        DNA
                      </span>
                    )}
                    {hasChildren && (
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {children.length} sub-units
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setEditingProfile(profile);
                    setShowConfigDialog(true);
                  }}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setSubUnitParent(profile);
                    setShowSubUnitWizard(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sub-unit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setProfileToDuplicate(profile);
                    setDuplicateName(`${profile.name} (Copy)`);
                    setDuplicateDialogOpen(true);
                  }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileToDelete(profile);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
        
        {isExpanded && children.length > 0 && (
          <div className="mt-2 space-y-2">
            {children.map(child => renderProfileTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <SEOHead
        title="Partner Institutions | CampusVoice.AI"
        description="Manage your partner institutions and their content."
      />

      <div className="bg-background">

        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Partner Institutions</h1>
                <p className="text-muted-foreground mt-1">
                  Manage the institutions you serve, their branding, and organizational structure
                </p>
              </div>
              <Button onClick={() => setShowWizard(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Partner Institution
              </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      placeholder="Search institutions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clients List */}
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading institutions...
              </div>
            ) : filteredProfiles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">
                    {searchQuery ? "No matching institutions" : "No partner institutions yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search."
                      : "Add your first partner institution to get started. You'll be able to configure their branding, structure, and Content DNA."}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowWizard(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add First Institution
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredProfiles.map(profile => renderProfileTree(profile))}
              </div>
            )}
          </div>
        </main>

        {/* Profile Setup Wizard - Full wizard for new clients */}
        {showWizard && (
          <Dialog open={showWizard} onOpenChange={setShowWizard}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
              <ProfileSetupWizard
                onComplete={handleCreateClient}
                onCancel={() => setShowWizard(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Sub-Unit Setup Wizard */}
        {showSubUnitWizard && subUnitParent && (
          <Dialog open={showSubUnitWizard} onOpenChange={(open) => {
            setShowSubUnitWizard(open);
            if (!open) setSubUnitParent(null);
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
              <SubUnitSetupWizard
                parentProfile={subUnitParent}
                onComplete={handleCreateSubUnit}
                onCancel={() => {
                  setShowSubUnitWizard(false);
                  setSubUnitParent(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Configuration Dialog */}
        {showConfigDialog && editingProfile && (
          <Dialog open={showConfigDialog} onOpenChange={handleCloseConfigDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {editingProfile.config?.logoUrl ? (
                    <img
                      src={editingProfile.config.logoUrl}
                      alt=""
                      className="w-8 h-8 object-contain rounded border bg-white p-0.5"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: editingProfile.config?.primaryColor || '#1F2A44' }}
                    >
                      {PROFILE_TYPE_ICONS[editingProfile.profileType]}
                    </div>
                  )}
                  Configure: {editingProfile.name}
                </DialogTitle>
              </DialogHeader>
              <InstitutionalConfig
                config={pendingConfig || editingProfile.config}
                onChange={handleConfigChange}
                profileId={editingProfile.id}
              />
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => handleCloseConfigDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveConfig} disabled={!hasUnsavedChanges}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Client</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete <strong>{profileToDelete?.name}</strong>? 
              This will also delete all associated Content DNA, messages, and sub-units. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteProfile}>
                Delete Client
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Duplicate Dialog */}
        <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicate Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="duplicate-name">New Client Name</Label>
                <Input
                  id="duplicate-name"
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  placeholder="Enter new client name"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDuplicateProfile} disabled={!duplicateName.trim()}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
