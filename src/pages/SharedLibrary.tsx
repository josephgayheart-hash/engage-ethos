import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { TemplateDetailDialog } from "@/components/library/TemplateDetailDialog";
import type { SharedTemplate, LibraryFilters, LibraryEntryStatus } from "@/types/library";
import { 
  Search, 
  ArrowLeft,
  BookOpen,
  FileText,
  Users,
  CheckCircle,
  Clock,
  Send
} from "lucide-react";

const statusConfig: Record<LibraryEntryStatus, { label: string; icon: typeof CheckCircle; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Draft', icon: FileText, variant: 'outline' },
  submitted: { label: 'Submitted', icon: Send, variant: 'secondary' },
  approved: { label: 'Approved', icon: CheckCircle, variant: 'default' },
  published: { label: 'Published', icon: BookOpen, variant: 'default' },
};

const SharedLibrary = () => {
  const { toast } = useToast();
  const { templates, filterTemplates, getPlaybooks, updateTemplateStatus } = useSharedLibrary();
  const { addMessage } = useMessageLibrary();
  const [filters, setFilters] = useState<LibraryFilters>({ search: '' });
  const [selectedTemplate, setSelectedTemplate] = useState<SharedTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const playbooks = getPlaybooks();
  const filteredTemplates = filterTemplates({
    ...filters,
    playbook: activeTab !== 'all' ? activeTab : undefined,
  });

  const handlePullTemplate = (template: SharedTemplate) => {
    addMessage({
      title: `${template.title} (from Shared Library)`,
      content: template.content,
      channel: template.requiredFields.channel[0] as any,
      audience: template.requiredFields.audience[0] as any,
      moment: template.requiredFields.moment[0],
      approved: false,
      mode: 'generated',
    });
    toast({
      title: "Template added to Personal Library",
      description: "You can now customize it in your library.",
    });
    setSelectedTemplate(null);
  };

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
          <div className="flex items-center gap-4 mb-8">
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

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
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
                <Select value={filters.status || 'all'} onValueChange={(v) => setFilters(f => ({ ...f, status: v === 'all' ? undefined : v as LibraryEntryStatus }))}>
                  <SelectTrigger className="w-full md:w-[150px]">
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
                  <SelectTrigger className="w-full md:w-[150px]">
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
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms.
                </p>
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
          onPull={() => handlePullTemplate(selectedTemplate)}
        />
      )}
    </div>
  );
};

export default SharedLibrary;
