import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { TemplateDetailDialog } from "@/components/library/TemplateDetailDialog";
import { CreateTemplateDialog } from "@/components/library/CreateTemplateDialog";
import type { SharedTemplate, LibraryFilters, LibraryEntryStatus } from "@/types/library";
import { 
  Search, 
  ArrowLeft,
  BookOpen,
  FileText,
  Users,
  CheckCircle,
  Clock,
  Send,
  Plus,
  Filter,
  X
} from "lucide-react";

const statusConfig: Record<LibraryEntryStatus, { label: string; icon: typeof CheckCircle; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Draft', icon: FileText, variant: 'outline' },
  submitted: { label: 'Submitted', icon: Send, variant: 'secondary' },
  approved: { label: 'Approved', icon: CheckCircle, variant: 'default' },
  published: { label: 'Published', icon: BookOpen, variant: 'default' },
};

const SharedLibrary = () => {
  const { toast } = useToast();
  const { templates, filterTemplates, getPlaybooks, addTemplate } = useSharedLibrary();
  const { addMessage } = useMessageLibrary();
  const [filters, setFilters] = useState<LibraryFilters>({ search: '' });
  const [selectedTemplate, setSelectedTemplate] = useState<SharedTemplate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const playbooks = getPlaybooks();
  const filteredTemplates = filterTemplates({
    ...filters,
    playbook: activeTab !== 'all' ? activeTab : undefined,
  });

  const handlePullTemplate = (template: SharedTemplate, customizedContent?: string) => {
    addMessage({
      title: `${template.title} (from Shared Library)`,
      content: customizedContent || template.content,
      channel: template.requiredFields.channel[0] as any,
      audience: template.requiredFields.audience[0] as any,
      moment: template.requiredFields.moment[0],
      approved: false,
      mode: 'generated',
    });
    toast({
      title: "Template added to Personal Library",
      description: "You can now customize it further in your library.",
    });
    setSelectedTemplate(null);
  };

  const handleCreateTemplate = (template: Omit<SharedTemplate, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory'>) => {
    addTemplate(template);
    toast({
      title: "Template submitted",
      description: "Your template has been saved as a draft for review.",
    });
  };

  const clearFilters = () => {
    setFilters({ search: '' });
    setActiveTab('all');
  };

  const hasActiveFilters = filters.status || filters.audience || filters.channel || filters.domain || activeTab !== 'all';

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
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                  Shared Message Library
                </h1>
                <p className="text-muted-foreground mt-1">
                  Organization-approved templates and playbooks
                </p>
              </div>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Template</span>
            </Button>
          </div>

          {/* Search & Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
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
                    <Select value={filters.status || 'all'} onValueChange={(v) => setFilters(f => ({ ...f, status: v === 'all' ? undefined : v as LibraryEntryStatus }))}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
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
                    <Select value={filters.channel || 'all'} onValueChange={(v) => setFilters(f => ({ ...f, channel: v === 'all' ? undefined : v }))}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Channels</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="portal">Portal</SelectItem>
                        <SelectItem value="landing-page">Landing Page</SelectItem>
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Playbook Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="all" className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                All Templates
              </TabsTrigger>
              {playbooks.map(playbook => (
                <TabsTrigger key={playbook} value={playbook}>
                  {playbook}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-serif text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or create a new template.
                </p>
                <Button onClick={() => setCreateOpen(true)}>Create Template</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className="card-elevated cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-serif font-semibold text-foreground">
                        {template.title}
                      </h3>
                      <StatusBadge status={template.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.intentStatement}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.requiredFields.audience.slice(0, 2).map(a => (
                        <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                      ))}
                      {template.requiredFields.audience.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{template.requiredFields.audience.length - 2}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {template.owner}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        v{template.version}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedTemplate && (
        <TemplateDetailDialog
          template={selectedTemplate}
          open={!!selectedTemplate}
          onOpenChange={(open) => !open && setSelectedTemplate(null)}
          onPull={(customizedContent) => handlePullTemplate(selectedTemplate, customizedContent)}
        />
      )}

      <CreateTemplateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateTemplate}
      />
    </div>
  );
};

export default SharedLibrary;
