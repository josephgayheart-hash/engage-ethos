import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useAgencyMode } from "@/hooks/useAgencyMode";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Activity,
  Loader2,
  Building2,
  Calendar,
  Download,
  RefreshCw,
  PieChart,
  Sparkles,
  MessageSquare,
  Library,
} from "lucide-react";

interface ClientStats {
  id: string;
  name: string;
  userCount: number;
  messageCount: number;
  templateCount: number;
  contentDNAConfigured: boolean;
  lastActivity: string | null;
  status: string;
}

interface OverallStats {
  totalClients: number;
  totalUsers: number;
  totalMessages: number;
  totalTemplates: number;
  clientsWithDNA: number;
  activeClientsThisMonth: number;
}

export default function AgencyAnalyticsPage() {
  const { tenant, isSuperAdmin } = useAuth();
  const { isAgency, labels } = useAgencyMode();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [clientStats, setClientStats] = useState<ClientStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [dateRange, setDateRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const fetchAnalytics = async () => {
    if (!tenant?.id) return;
    
    setIsLoading(true);
    try {
      // Fetch all clients (institutional profiles)
      const { data: clients } = await supabase
        .from('institutional_profiles')
        .select('*')
        .eq('tenant_id', tenant.id)
        .is('parent_profile_id', null);

      // Fetch personal messages per client
      const { data: messages } = await supabase
        .from('personal_messages')
        .select('institutional_profile_id, created_at')
        .eq('tenant_id', tenant.id);

      // Fetch templates per client
      const { data: templates } = await supabase
        .from('shared_templates')
        .select('id, created_at')
        .eq('tenant_id', tenant.id);

      // Fetch Content DNA analyses
      const { data: dnaAnalyses } = await supabase
        .from('content_dna_analysis')
        .select('profile_id')
        .eq('tenant_id', tenant.id);

      // Fetch user count
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('tenant_id', tenant.id);

      const clientsData = clients || [];
      const messagesData = messages || [];
      const templatesData = templates || [];
      const dnaData = dnaAnalyses || [];
      const usersData = users || [];

      // Calculate per-client stats
      const stats: ClientStats[] = clientsData.map(client => {
        const clientMessages = messagesData.filter(m => m.institutional_profile_id === client.id);
        const hasDNA = dnaData.some(d => d.profile_id === client.id);
        const lastMessage = clientMessages.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        return {
          id: client.id,
          name: client.name,
          userCount: 0, // Would need to track user-profile associations
          messageCount: clientMessages.length,
          templateCount: 0, // Templates are tenant-level, not profile-level
          contentDNAConfigured: hasDNA,
          lastActivity: lastMessage?.created_at || client.updated_at,
          status: (client as any).client_status || 'active',
        };
      });

      setClientStats(stats);

      // Calculate overall stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeClients = stats.filter(c => 
        c.lastActivity && new Date(c.lastActivity) > thirtyDaysAgo
      ).length;

      setOverallStats({
        totalClients: clientsData.length,
        totalUsers: usersData.length,
        totalMessages: messagesData.length,
        totalTemplates: templatesData.length,
        clientsWithDNA: dnaData.length,
        activeClientsThisMonth: activeClients,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [tenant?.id, dateRange]);

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  if (!isAgency && !isSuperAdmin) {
    return null;
  }

  return (
    <div className="bg-background">
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/agency/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              {labels.dashboard}
            </Link>
            <span>/</span>
            <span className="text-foreground">Analytics</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                Analytics & Insights
              </h1>
              <p className="text-muted-foreground mt-1">
                Performance metrics across all {labels.profiles.toLowerCase()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchAnalytics} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Overall Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{overallStats?.totalClients || 0}</p>
                        <p className="text-xs text-muted-foreground">{labels.profiles}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{overallStats?.totalUsers || 0}</p>
                        <p className="text-xs text-muted-foreground">Team Members</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{overallStats?.totalMessages || 0}</p>
                        <p className="text-xs text-muted-foreground">Messages</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Library className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{overallStats?.totalTemplates || 0}</p>
                        <p className="text-xs text-muted-foreground">Templates</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <Sparkles className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{overallStats?.clientsWithDNA || 0}</p>
                        <p className="text-xs text-muted-foreground">With DNA</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-500/10">
                        <Activity className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{overallStats?.activeClientsThisMonth || 0}</p>
                        <p className="text-xs text-muted-foreground">Active (30d)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Client Performance Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {labels.profile} Performance
                  </CardTitle>
                  <CardDescription>
                    Activity breakdown by {labels.profile.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {clientStats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No {labels.profiles.toLowerCase()} yet</p>
                      <Link to="/agency/clients">
                        <Button variant="link" className="mt-2">Add your first {labels.profile.toLowerCase()}</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clientStats.map((client) => (
                        <div key={client.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{client.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                  {client.status}
                                </Badge>
                                {client.contentDNAConfigured && (
                                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    DNA
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <p className="font-semibold">{client.messageCount}</p>
                              <p className="text-xs text-muted-foreground">Messages</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground text-xs">{formatDate(client.lastActivity)}</p>
                              <p className="text-xs text-muted-foreground">Last Active</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
