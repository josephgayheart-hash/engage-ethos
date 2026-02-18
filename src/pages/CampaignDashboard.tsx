import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Plus, 
  FolderKanban, 
  Mail, 
  MessageSquare, 
  Users, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  MoreHorizontal,
  Trash2,
  Edit
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  audience: string[];
  startDate: string;
  endDate: string;
  messageIds: string[];
  createdAt: string;
}

const CampaignDashboard = () => {
  const { toast } = useToast();
  const { messages } = useMessageLibrary();
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('uplaybook_campaigns');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    audience: [] as string[],
    startDate: '',
    endDate: '',
  });

  const saveCampaigns = (updated: Campaign[]) => {
    setCampaigns(updated);
    localStorage.setItem('uplaybook_campaigns', JSON.stringify(updated));
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name) {
      toast({ variant: "destructive", title: "Name required" });
      return;
    }

    const campaign: Campaign = {
      id: crypto.randomUUID(),
      ...newCampaign,
      status: 'draft',
      messageIds: [],
      createdAt: new Date().toISOString(),
    };

    saveCampaigns([...campaigns, campaign]);
    setShowCreateDialog(false);
    setNewCampaign({ name: '', description: '', audience: [], startDate: '', endDate: '' });
    toast({ title: "Campaign created" });
  };

  const handleDeleteCampaign = (id: string) => {
    saveCampaigns(campaigns.filter(c => c.id !== id));
    toast({ title: "Campaign deleted" });
  };

  const handleUpdateStatus = (id: string, status: Campaign['status']) => {
    saveCampaigns(campaigns.map(c => c.id === id ? { ...c, status } : c));
    toast({ title: `Campaign ${status}` });
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (activeTab === 'all') return true;
    return c.status === activeTab;
  });

  const getAudienceOverlap = () => {
    const audienceCounts: Record<string, number> = {};
    campaigns.filter(c => c.status === 'active').forEach(c => {
      c.audience.forEach(a => {
        audienceCounts[a] = (audienceCounts[a] || 0) + 1;
      });
    });
    return Object.entries(audienceCounts).filter(([_, count]) => count > 1);
  };

  const audienceOverlap = getAudienceOverlap();

  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
    active: { label: 'Active', color: 'bg-green-500/10 text-green-600' },
    completed: { label: 'Completed', color: 'bg-blue-500/10 text-blue-600' },
    paused: { label: 'Paused', color: 'bg-yellow-500/10 text-yellow-600' },
  };

  const audienceOptions = ['prospective', 'first-year', 'continuing', 'at-risk', 'graduate'];

  return (
    <div className="bg-background">
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                  <FolderKanban className="w-7 h-7 text-primary" />
                  Campaign Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Organize messages into campaigns and track audience overlap
                </p>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FolderKanban className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaigns.length}</p>
                    <p className="text-xs text-muted-foreground">Total Campaigns</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaigns.reduce((acc, c) => acc + c.messageIds.length, 0)}</p>
                    <p className="text-xs text-muted-foreground">Total Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{audienceOverlap.length}</p>
                    <p className="text-xs text-muted-foreground">Audience Overlaps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audience Overlap Warning */}
          {audienceOverlap.length > 0 && (
            <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-700">Audience Overlap Detected</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      The following audiences are targeted by multiple active campaigns, which may cause message fatigue:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {audienceOverlap.map(([audience, count]) => (
                        <Badge key={audience} variant="outline" className="bg-yellow-500/10">
                          {audience}: {count} campaigns
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaigns Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All ({campaigns.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({campaigns.filter(c => c.status === 'active').length})</TabsTrigger>
              <TabsTrigger value="draft">Draft ({campaigns.filter(c => c.status === 'draft').length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({campaigns.filter(c => c.status === 'completed').length})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Campaigns List */}
          {filteredCampaigns.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-serif text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first campaign to start organizing your messages.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>Create Campaign</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-serif font-semibold text-lg">{campaign.name}</h3>
                          <Badge className={statusConfig[campaign.status].color}>
                            {statusConfig[campaign.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {campaign.audience.length > 0 ? campaign.audience.join(', ') : 'No audience'}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'No date'} 
                            {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString()}`}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {campaign.messageIds.length} messages
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {campaign.status === 'draft' && (
                          <Button size="sm" onClick={() => handleUpdateStatus(campaign.id, 'active')}>
                            Activate
                          </Button>
                        )}
                        {campaign.status === 'active' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(campaign.id, 'paused')}>
                              Pause
                            </Button>
                            <Button size="sm" onClick={() => handleUpdateStatus(campaign.id, 'completed')}>
                              Complete
                            </Button>
                          </>
                        )}
                        {campaign.status === 'paused' && (
                          <Button size="sm" onClick={() => handleUpdateStatus(campaign.id, 'active')}>
                            Resume
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteCampaign(campaign.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Create New Campaign</DialogTitle>
            <DialogDescription>
              Group related messages together to track and manage your outreach.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                placeholder="e.g., Fall 2025 Registration"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this campaign..."
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Audiences</Label>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map((audience) => (
                  <Badge
                    key={audience}
                    variant={newCampaign.audience.includes(audience) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const updated = newCampaign.audience.includes(audience)
                        ? newCampaign.audience.filter(a => a !== audience)
                        : [...newCampaign.audience, audience];
                      setNewCampaign({ ...newCampaign, audience: updated });
                    }}
                  >
                    {audience}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newCampaign.startDate}
                  onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newCampaign.endDate}
                  onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCampaign}>Create Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignDashboard;
