import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { WaveBackground } from "@/components/WaveBackground";
import { Button } from "@/components/ui/button";
import { useLibraryCollections } from "@/hooks/useLibraryCollections";
import { CollectionCard } from "@/components/library/CollectionCard";
import { CreateCollectionDialog } from "@/components/library/CreateCollectionDialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { useAgencyMode } from "@/hooks/useAgencyMode";
import { CreateTemplateDialog } from "@/components/library/CreateTemplateDialog";
import { AdminApprovalPanel } from "@/components/library/AdminApprovalPanel";
import { SourceBadge } from "@/components/library/SourceBadge";
import type { SharedTemplate, LibraryFilters, LibraryEntryStatus } from "@/types/library";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  ArrowLeft,
  BookOpen,
  FileText,
  Users,
  CheckCircle,
  Clock,
  Send,
  Filter,
  X,
  ShieldCheck,
  ChevronRight,
  Calendar,
  Building2,
  Dna,
  Route,
  Pencil,
  ClipboardCheck,
  LayoutGrid,
  List,
  Folder,
  Plus
} from "lucide-react";

const statusConfig: Record<LibraryEntryStatus, { label: string; icon: typeof CheckCircle; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Draft', icon: FileText, variant: 'outline' },
  submitted: { label: 'Submitted', icon: Send, variant: 'secondary' },
  approved: { label: 'Approved', icon: CheckCircle, variant: 'default' },
  published: { label: 'Published', icon: BookOpen, variant: 'default' },
};

const SharedLibrary = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin, isApprover } = useAuth();
  const { isAgency } = useAgencyMode();
  const { templates, filterTemplates, getPlaybooks, getAllTags, addTemplate, updateTemplateStatus } = useSharedLibrary();
  const { addMessage } = useMessageLibrary();
  const { getProfileHierarchy } = useInstitutionalProfiles();
  const { collections, createCollection } = useLibraryCollections();
  const [filters, setFilters] = useState<LibraryFilters>({ search: '' });
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [adminViewMode, setAdminViewMode] = useState<'browse' | 'admin'>('browse');
  const [topLevelTab, setTopLevelTab] = useState<'playbooks' | 'collections'>(() => {
    return searchParams.get('tab') === 'collections' ? 'collections' : 'playbooks';
  });
  
  // View mode state (persisted in localStorage)
  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => {
    const stored = localStorage.getItem('sharedLibraryViewMode');
    return (stored === 'list' ? 'list' : 'card') as 'card' | 'list';
  });
  
  const toggleViewMode = (mode: 'card' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('sharedLibraryViewMode', mode);
  };

  const playbooks = getPlaybooks();
  const allTags = getAllTags();
  const pendingCount = templates.filter(t => t.status === 'submitted').length;
  const filteredTemplates = filterTemplates({
    ...filters,
    playbook: activeTab !== 'all' ? activeTab : undefined,
  }).filter(t => t.status === 'published' || t.status === 'approved');

  const handleCardClick = (id: string) => {
    navigate(`/shared-library/${id}`);
  };

  const handleCreateTemplate = async (template: Omit<SharedTemplate, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory'>) => {
    const templateWithStatus = {
      ...template,
      status: (isAdmin || isApprover) ? 'published' as const : template.status,
    };
    await addTemplate(templateWithStatus);
    const libraryLabel = isAgency ? 'Template Library' : 'University Library';
    toast({
      title: (isAdmin || isApprover) ? "Playbook published" : "Playbook submitted",
      description: (isAdmin || isApprover) 
        ? `Your playbook has been published to the ${libraryLabel}.`
        : `Your playbook has been saved as a draft for review.`,
    });
  };

  const clearFilters = () => {
    setFilters({ search: '' });
    setActiveTab('all');
  };

  const hasActiveFilters = filters.status || filters.audience || filters.channel || filters.domain || filters.moment || activeTab !== 'all';

  const StatusBadge = ({ status }: { status: LibraryEntryStatus }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header with wave background */}
      <div className="relative overflow-hidden pb-12">
        <WaveBackground variant="amber" />
        
        <div className="relative container mx-auto px-4 pt-10 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
              <span>/</span>
              <span className="text-foreground">{isAgency ? 'Template Library' : 'University Library'}</span>
            </div>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                  <div className="icon-container icon-container-lg bg-secondary/20">
                    <BookOpen className="w-6 h-6 text-secondary" />
                  </div>
                  {isAgency ? 'Template Library' : 'University Library'}
                </h1>
                <p className="text-muted-foreground mt-1 ml-14">
                  Brand-governed content with approval workflows
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {pendingCount > 0 && (
                  <Button 
                    variant={adminViewMode === 'admin' ? 'default' : 'outline'}
                    onClick={() => setAdminViewMode(adminViewMode === 'admin' ? 'browse' : 'admin')}
                    className="flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin Review</span>
                    <Badge variant="destructive" className="ml-1">{pendingCount}</Badge>
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate('/strategy')} className="flex items-center gap-2">
                  <Route className="w-4 h-4" />
                  <span className="hidden sm:inline">Design Journey</span>
                </Button>
                <Button variant="outline" onClick={() => navigate('/build')} className="flex items-center gap-2">
                  <Pencil className="w-4 h-4" />
                  <span className="hidden sm:inline">Build Message</span>
                </Button>
                <Button variant="outline" onClick={() => navigate('/evaluate')} className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Evaluate</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {adminViewMode === 'admin' ? (
            /* Admin Approval View */
            <AdminApprovalPanel 
              templates={templates} 
              onUpdateStatus={updateTemplateStatus}
            />
          ) : (
            /* Browse View */
            <>
              {/* Search & Filters */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search playbooks..."
                          value={filters.search}
                          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                      <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filters
                        {hasActiveFilters && <Badge variant="secondary" className="ml-1">{[filters.status, filters.audience, filters.channel, activeTab !== 'all' ? activeTab : null].filter(Boolean).length}</Badge>}
                      </Button>
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1">
                          <X className="w-4 h-4" />
                          Clear
                        </Button>
                      )}
                    </div>

                    {showFilters && (
                      <div className="flex flex-wrap gap-4 pt-4 border-t">
                        <Select value={filters.channel || 'all'} onValueChange={(v) => setFilters(f => ({ ...f, channel: v === 'all' ? undefined : v }))}>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Channel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Channels</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="portal">Portal</SelectItem>
                            <SelectItem value="landing-page">Landing Page</SelectItem>
                            <SelectItem value="social-media">Social Media</SelectItem>
                            <SelectItem value="direct-mail">Direct Mail</SelectItem>
                            <SelectItem value="phone-call">Phone Script</SelectItem>
                            <SelectItem value="talking-points">Talking Points</SelectItem>
                            <SelectItem value="digital-ad-search">Search Ads</SelectItem>
                            <SelectItem value="digital-ad-social">Social Ads</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={filters.audience || 'all'} onValueChange={(v) => setFilters(f => ({ ...f, audience: v === 'all' ? undefined : v }))}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Audience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Audiences</SelectItem>
                            <SelectItem value="prospective">Prospective</SelectItem>
                            <SelectItem value="first-year">First-Year</SelectItem>
                            <SelectItem value="continuing">Continuing</SelectItem>
                            <SelectItem value="at-risk">At-Risk</SelectItem>
                            <SelectItem value="graduate">Graduate</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={filters.domain || 'all'} onValueChange={(v) => setFilters(f => ({ ...f, domain: v === 'all' ? undefined : v }))}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Domain" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Domains</SelectItem>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="financial">Financial</SelectItem>
                            <SelectItem value="wellbeing">Wellbeing</SelectItem>
                            <SelectItem value="engagement">Engagement</SelectItem>
                            <SelectItem value="behavioral">Behavioral</SelectItem>
                            <SelectItem value="seasonal">Seasonal</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={filters.moment || 'all'} onValueChange={(v) => setFilters(f => ({ ...f, moment: v === 'all' ? undefined : v }))}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Moment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Moments</SelectItem>
                            <SelectItem value="recruitment">Recruitment</SelectItem>
                            <SelectItem value="orientation">Orientation</SelectItem>
                            <SelectItem value="registration">Registration</SelectItem>
                            <SelectItem value="early-term">Early Term</SelectItem>
                            <SelectItem value="midterm">Midterm</SelectItem>
                            <SelectItem value="finals">Finals</SelectItem>
                            <SelectItem value="re-engagement">Re-engagement</SelectItem>
                            <SelectItem value="seasonal">Seasonal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top-level Playbooks / Collections toggle */}
              <Tabs value={topLevelTab} onValueChange={(v) => setTopLevelTab(v as any)} className="mb-6">
                <TabsList>
                  <TabsTrigger value="playbooks" className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    Playbooks
                  </TabsTrigger>
                  <TabsTrigger value="collections" className="flex items-center gap-1">
                    <Folder className="w-4 h-4" />
                    Collections
                    {collections.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-[10px]">{collections.length}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {topLevelTab === 'collections' ? (
                /* Collections View */
                <div>
                  <div className="flex justify-end mb-4">
                    <CreateCollectionDialog
                      onSubmit={async (data) => {
                        const result = await createCollection(data);
                        if (result) {
                          toast({ title: 'Collection created', description: `"${data.name}" is ready to use.` });
                          navigate(`/collections/${result.id}`);
                        }
                        return result;
                      }}
                      trigger={
                        <Button className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          New Collection
                        </Button>
                      }
                    />
                  </div>
                  {collections.length === 0 ? (
                    <Card className="text-center py-12">
                      <CardContent>
                        <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-serif text-lg font-semibold mb-2">No collections yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Group playbooks, messages, and creative assets by campaign, initiative, or program.
                        </p>
                        <CreateCollectionDialog
                          onSubmit={async (data) => {
                            const result = await createCollection(data);
                            if (result) {
                              toast({ title: 'Collection created', description: `"${data.name}" is ready to use.` });
                              navigate(`/collections/${result.id}`);
                            }
                            return result;
                          }}
                          trigger={
                            <Button>
                              <Plus className="w-4 h-4 mr-1" />
                              Create Your First Collection
                            </Button>
                          }
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collections.map(collection => (
                        <CollectionCard
                          key={collection.id}
                          collection={collection}
                          onClick={() => navigate(`/collections/${collection.id}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
              <>
              {/* Playbook Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="flex-wrap h-auto gap-1 p-1">
                  <TabsTrigger value="all" className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    All Playbooks
                  </TabsTrigger>
                  {playbooks.map(playbook => (
                    <TabsTrigger key={playbook} value={playbook}>
                      {playbook}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* View Toggle & Results Count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {filteredTemplates.length} playbook{filteredTemplates.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 ${viewMode === 'card' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => toggleViewMode('card')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => toggleViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Playbooks Grid */}
              {filteredTemplates.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-serif text-lg font-semibold mb-2">No playbooks found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or create a new playbook.
                    </p>
                    <Button onClick={() => setCreateOpen(true)}>Create Playbook</Button>
                  </CardContent>
                </Card>
              ) : viewMode === 'list' ? (
                /* List View */
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Playbook</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Version</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTemplates.map((template) => (
                        <TableRow 
                          key={template.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleCardClick(template.id)}
                        >
                          <TableCell>
                            <span className="font-medium truncate max-w-[200px] block">{template.title}</span>
                          </TableCell>
                          <TableCell>
                            <SourceBadge source={template.source} />
                          </TableCell>
                          <TableCell>{template.playbook || '-'}</TableCell>
                          <TableCell>
                            <StatusBadge status={template.status} />
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {template.owner && <span className="mr-2">{template.owner}</span>}
                            {new Date(template.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="text-muted-foreground">v{template.version}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                /* Card View */
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className="card-elevated cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group"
                      onClick={() => handleCardClick(template.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="font-serif font-semibold text-foreground">
                            {template.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={template.status} />
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {template.intentStatement}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {template.source && <SourceBadge source={template.source} />}
                          {template.requiredFields.audience.slice(0, 2).map(a => (
                            <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                          ))}
                          {template.requiredFields.audience.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{template.requiredFields.audience.length - 2}</Badge>
                          )}
                          {/* Show profile hierarchy if available */}
                          {template.institutionalProfileId && (() => {
                            const hierarchy = getProfileHierarchy(template.institutionalProfileId);
                            if (hierarchy.profiles.length > 0) {
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="default" className="text-xs bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                                      <Building2 className="w-3 h-3" />
                                      {hierarchy.profiles.length > 1 
                                        ? `${hierarchy.profiles[0].name} > ${hierarchy.profiles[hierarchy.profiles.length - 1].name}`
                                        : hierarchy.profiles[0].name
                                      }
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="max-w-xs">
                                    <div className="text-xs">
                                      <p className="font-medium mb-1">Profile Hierarchy</p>
                                      <div className="flex items-center flex-wrap gap-0.5">
                                        {hierarchy.profiles.map((profile, idx) => (
                                          <span key={profile.id} className="flex items-center">
                                            <span>{profile.name}</span>
                                            {idx < hierarchy.profiles.length - 1 && (
                                              <ChevronRight className="w-3 h-3 mx-0.5" />
                                            )}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            }
                            return null;
                          })()}
                          {!template.institutionalProfileId && template.institutionalProfileName && (
                            <Badge variant="default" className="text-xs bg-primary/10 text-primary border-primary/20">
                              <Building2 className="w-3 h-3 mr-1" />
                              {template.institutionalProfileName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {template.owner}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(template.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              v{template.version}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
            )}
            </>
          )}
        </div>
      </main>

      <CreateTemplateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateTemplate}
      />
    </div>
  );
};

export default SharedLibrary;
