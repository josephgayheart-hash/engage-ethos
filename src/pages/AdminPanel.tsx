import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Plus, 
  Send, 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  X,
  Megaphone,
  Building2,
  Calendar,
  Eye,
  Edit,
  Trash2,
  ChevronRight
} from "lucide-react";
import type { SharedTemplate, LibraryEntryStatus } from "@/types/library";

const AdminPanel = () => {
  const { toast } = useToast();
  const { templates, addTemplate, updateTemplateStatus, isLoading } = useSharedLibrary();
  const [activeTab, setActiveTab] = useState("overview");
  const [createOpen, setCreateOpen] = useState(false);
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SharedTemplate | null>(null);
  
  // Form state for quick create
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [quickPlaybook, setQuickPlaybook] = useState('');
  const [quickCollegeName, setQuickCollegeName] = useState('');
  const [quickDepartmentName, setQuickDepartmentName] = useState('');
  const [quickChannels, setQuickChannels] = useState<string[]>([]);
  const [quickAudiences, setQuickAudiences] = useState<string[]>([]);

  const channelOptions = ['email', 'sms', 'portal', 'landing-page', 'social-media'];
  const audienceOptions = ['prospective', 'first-year', 'continuing', 'at-risk', 'graduate'];

  const draftTemplates = templates.filter(t => t.status === 'draft');
  const submittedTemplates = templates.filter(t => t.status === 'submitted');
  const approvedTemplates = templates.filter(t => t.status === 'approved');
  const publishedTemplates = templates.filter(t => t.status === 'published');

  const toggleArrayItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    if (arr.includes(item)) {
      setArr(arr.filter(i => i !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  const handleQuickCreate = () => {
    if (!quickTitle || !quickContent) {
      toast({ variant: "destructive", title: "Missing fields", description: "Title and content are required." });
      return;
    }

    const placeholderMatches = quickContent.match(/\{\{([^}]+)\}\}/g) || [];
    const placeholders = placeholderMatches.map(match => {
      const key = match.replace(/\{\{|\}\}/g, '');
      return {
        key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `Value for ${key}`,
        required: true,
      };
    });

    addTemplate({
      title: quickTitle,
      intentStatement: `Quick-created playbook: ${quickTitle}`,
      content: quickContent,
      playbook: quickPlaybook || 'General',
      collegeName: quickCollegeName || undefined,
      departmentName: quickDepartmentName || undefined,
      owner: 'Admin',
      maintainer: 'Admin',
      status: 'draft',
      version: '1.0',
      placeholders,
      requiredFields: {
        audience: quickAudiences.length > 0 ? quickAudiences : ['first-year'],
        channel: quickChannels.length > 0 ? quickChannels : ['email'],
        moment: ['seasonal'],
      },
      useCases: { whenToUse: [], whenNotToUse: [] },
      ethicalGuardrails: ['Review before distribution'],
    });

    toast({ title: "Playbook created", description: "New playbook saved as draft." });
    setQuickTitle('');
    setQuickContent('');
    setQuickPlaybook('');
    setQuickCollegeName('');
    setQuickDepartmentName('');
    setQuickChannels([]);
    setQuickAudiences([]);
    setCreateOpen(false);
  };

  const handleDistribute = (template: SharedTemplate) => {
    updateTemplateStatus(template.id, 'published', 'Distributed by admin');
    toast({ 
      title: "Playbook distributed", 
      description: `"${template.title}" is now available to all users.` 
    });
    setDistributeOpen(false);
    setSelectedTemplate(null);
  };

  const handleApprove = (template: SharedTemplate) => {
    updateTemplateStatus(template.id, 'approved', 'Approved by admin');
    toast({ title: "Template approved", description: `"${template.title}" has been approved.` });
  };

  const handleReject = (template: SharedTemplate) => {
    updateTemplateStatus(template.id, 'draft', 'Returned for revision');
    toast({ title: "Template returned", description: `"${template.title}" has been returned for revision.` });
  };

  const getStatusBadge = (status: LibraryEntryStatus) => {
    const variants: Record<LibraryEntryStatus, { variant: "default" | "secondary" | "outline"; icon: React.ReactNode }> = {
      draft: { variant: "outline", icon: <FileText className="w-3 h-3" /> },
      submitted: { variant: "secondary", icon: <Clock className="w-3 h-3" /> },
      approved: { variant: "default", icon: <CheckCircle className="w-3 h-3" /> },
      published: { variant: "default", icon: <Megaphone className="w-3 h-3" /> },
    };
    const { variant, icon } = variants[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Admin Panel</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                Admin Panel
              </h1>
              <p className="text-muted-foreground mt-1">
                Create, approve, and distribute playbooks across your institution
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/settings" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Institutional Profiles
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Playbook
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{draftTemplates.length}</p>
                    <p className="text-xs text-muted-foreground">Drafts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{submittedTemplates.length}</p>
                    <p className="text-xs text-muted-foreground">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{approvedTemplates.length}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Megaphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{publishedTemplates.length}</p>
                    <p className="text-xs text-muted-foreground">Published</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Playbook Management */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending Review
                {submittedTemplates.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full">
                    {submittedTemplates.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="ready">Ready to Distribute</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Recent Activity</CardTitle>
                  <CardDescription>Latest playbook updates and submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {templates.slice(0, 5).map(template => (
                      <div key={template.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{template.title}</h4>
                            {getStatusBadge(template.status)}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {template.collegeName && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {template.collegeName}
                              </span>
                            )}
                            {template.departmentName && (
                              <span>{template.departmentName}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(template.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {template.status === 'approved' && (
                            <Button 
                              size="sm" 
                              onClick={() => { setSelectedTemplate(template); setDistributeOpen(true); }}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Distribute
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {submittedTemplates.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No templates pending review</p>
                  </CardContent>
                </Card>
              ) : (
                submittedTemplates.map(template => (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-serif font-semibold">{template.title}</h3>
                            {getStatusBadge(template.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{template.intentStatement}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {template.collegeName && <Badge variant="outline"><Building2 className="w-3 h-3 mr-1" />{template.collegeName}</Badge>}
                            {template.departmentName && <Badge variant="outline">{template.departmentName}</Badge>}
                            {template.requiredFields.channel.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                            {template.content.slice(0, 200)}...
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button onClick={() => handleApprove(template)} className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button variant="outline" onClick={() => handleReject(template)} className="flex items-center gap-1">
                            <X className="w-4 h-4" />
                            Return
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="ready" className="space-y-4 mt-4">
              {approvedTemplates.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No templates ready for distribution</p>
                  </CardContent>
                </Card>
              ) : (
                approvedTemplates.map(template => (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-serif font-semibold">{template.title}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            {template.collegeName && <span>{template.collegeName}</span>}
                            {template.departmentName && <span>• {template.departmentName}</span>}
                          </div>
                        </div>
                        <Button onClick={() => { setSelectedTemplate(template); setDistributeOpen(true); }}>
                          <Send className="w-4 h-4 mr-2" />
                          Distribute Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="published" className="space-y-4 mt-4">
              {publishedTemplates.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No published playbooks yet</p>
                  </CardContent>
                </Card>
              ) : (
                publishedTemplates.map(template => (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-semibold">{template.title}</h3>
                            {getStatusBadge(template.status)}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            {template.collegeName && <span>{template.collegeName}</span>}
                            {template.departmentName && <span>• {template.departmentName}</span>}
                            <span>• Published {new Date(template.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Quick Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Create New Playbook</DialogTitle>
            <DialogDescription>
              Quickly create a new messaging playbook to distribute to your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="quick-title">Title *</Label>
              <Input id="quick-title" value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} placeholder="e.g., Fall Registration Reminder" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quick-college">College Name</Label>
                <Input id="quick-college" value={quickCollegeName} onChange={(e) => setQuickCollegeName(e.target.value)} placeholder="e.g., College of Education" />
              </div>
              <div>
                <Label htmlFor="quick-department">Department Name</Label>
                <Input id="quick-department" value={quickDepartmentName} onChange={(e) => setQuickDepartmentName(e.target.value)} placeholder="e.g., Registrar's Office" />
              </div>
            </div>
            <div>
              <Label htmlFor="quick-playbook">Playbook Category</Label>
              <Input id="quick-playbook" value={quickPlaybook} onChange={(e) => setQuickPlaybook(e.target.value)} placeholder="e.g., Registration Support" />
            </div>
            <div>
              <Label>Channels</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {channelOptions.map(c => (
                  <Badge 
                    key={c} 
                    variant={quickChannels.includes(c) ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(quickChannels, setQuickChannels, c)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Target Audiences</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {audienceOptions.map(a => (
                  <Badge 
                    key={a} 
                    variant={quickAudiences.includes(a) ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(quickAudiences, setQuickAudiences, a)}
                  >
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="quick-content">Message Content *</Label>
              <Textarea 
                id="quick-content" 
                value={quickContent} 
                onChange={(e) => setQuickContent(e.target.value)} 
                placeholder="Use {{placeholder}} for variables like {{student_name}}, {{deadline_date}}..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleQuickCreate}>Create Playbook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Distribute Confirmation Dialog */}
      <Dialog open={distributeOpen} onOpenChange={setDistributeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Distribute Playbook</DialogTitle>
            <DialogDescription>
              This will make the playbook available to all users in the Shared Library.
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="py-4">
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-semibold mb-1">{selectedTemplate.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedTemplate.intentStatement}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  {selectedTemplate.collegeName && <span>{selectedTemplate.collegeName}</span>}
                  {selectedTemplate.departmentName && <span>• {selectedTemplate.departmentName}</span>}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDistributeOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedTemplate && handleDistribute(selectedTemplate)}>
              <Megaphone className="w-4 h-4 mr-2" />
              Distribute to All Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
