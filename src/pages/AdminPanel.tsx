import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft,
  Users, 
  UserPlus,
  Building2,
  ChevronRight,
  Trash2,
  RefreshCw,
  Activity,
  BarChart3,
  Library,
  FolderOpen,
  Clock,
  TrendingUp,
  AlertTriangle,
  Loader2,
  FileText,
  MessageSquare,
  Compass,
  Phone,
  Sparkles,
  Upload,
  Settings,
  Shield,
  Cpu,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
  Database,
  Mic,
  ArrowRight,
  GraduationCap,
  MessageSquarePlus,
  Star
} from "lucide-react";

// Mock Ivy League user data
const mockIvyLeagueUsers = [
  { id: '1', first_name: 'Sarah', last_name: 'Mitchell', email: 'smitchell@harvard.edu', institution: 'Harvard University', status: 'active', last_login_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), created_at: '2024-09-15' },
  { id: '2', first_name: 'James', last_name: 'Chen', email: 'jchen@yale.edu', institution: 'Yale University', status: 'active', last_login_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), created_at: '2024-08-22' },
  { id: '3', first_name: 'Emily', last_name: 'Rodriguez', email: 'erodriguez@princeton.edu', institution: 'Princeton University', status: 'active', last_login_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), created_at: '2024-10-01' },
  { id: '4', first_name: 'Michael', last_name: 'Thompson', email: 'mthompson@columbia.edu', institution: 'Columbia University', status: 'active', last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), created_at: '2024-07-18' },
  { id: '5', first_name: 'Jessica', last_name: 'Kim', email: 'jkim@upenn.edu', institution: 'University of Pennsylvania', status: 'active', last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), created_at: '2024-11-02' },
  { id: '6', first_name: 'David', last_name: 'Brown', email: 'dbrown@brown.edu', institution: 'Brown University', status: 'active', last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), created_at: '2024-06-30' },
  { id: '7', first_name: 'Amanda', last_name: 'Wilson', email: 'awilson@dartmouth.edu', institution: 'Dartmouth College', status: 'active', last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), created_at: '2024-09-08' },
  { id: '8', first_name: 'Robert', last_name: 'Garcia', email: 'rgarcia@cornell.edu', institution: 'Cornell University', status: 'active', last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), created_at: '2024-10-15' },
  { id: '9', first_name: 'Jennifer', last_name: 'Lee', email: 'jlee@harvard.edu', institution: 'Harvard University', status: 'pending', last_login_at: null, created_at: '2024-12-01' },
  { id: '10', first_name: 'William', last_name: 'Davis', email: 'wdavis@yale.edu', institution: 'Yale University', status: 'active', last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), created_at: '2024-08-05' },
  { id: '11', first_name: 'Maria', last_name: 'Martinez', email: 'mmartinez@columbia.edu', institution: 'Columbia University', status: 'active', last_login_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), created_at: '2024-11-20' },
  { id: '12', first_name: 'Christopher', last_name: 'Anderson', email: 'canderson@princeton.edu', institution: 'Princeton University', status: 'locked', last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), created_at: '2024-05-12' },
];

// Mock institution breakdown data
const mockInstitutionData = [
  { 
    name: 'Harvard University', 
    users: 2, 
    sharedTemplates: 45,
    personalMessages: 234,
    journeys: 12,
    contentDNAProfiles: 3,
    filesUploaded: 28,
    topTools: ['Message Builder', 'Strategy Mapper', 'Evaluator'],
    recentActivity: '15 min ago'
  },
  { 
    name: 'Yale University', 
    users: 2, 
    sharedTemplates: 38,
    personalMessages: 189,
    journeys: 8,
    contentDNAProfiles: 2,
    filesUploaded: 15,
    topTools: ['Evaluator', 'Message Builder', 'Call Script'],
    recentActivity: '45 min ago'
  },
  { 
    name: 'Princeton University', 
    users: 2, 
    sharedTemplates: 52,
    personalMessages: 312,
    journeys: 15,
    contentDNAProfiles: 4,
    filesUploaded: 42,
    topTools: ['Strategy Mapper', 'Message Builder', 'BYOC'],
    recentActivity: '2 hours ago'
  },
  { 
    name: 'Columbia University', 
    users: 2, 
    sharedTemplates: 29,
    personalMessages: 156,
    journeys: 6,
    contentDNAProfiles: 2,
    filesUploaded: 19,
    topTools: ['Message Builder', 'Evaluator', 'Playground'],
    recentActivity: '30 min ago'
  },
  { 
    name: 'University of Pennsylvania', 
    users: 1, 
    sharedTemplates: 33,
    personalMessages: 98,
    journeys: 4,
    contentDNAProfiles: 1,
    filesUploaded: 11,
    topTools: ['Evaluator', 'Call Script', 'Message Builder'],
    recentActivity: '8 hours ago'
  },
  { 
    name: 'Brown University', 
    users: 1, 
    sharedTemplates: 21,
    personalMessages: 67,
    journeys: 3,
    contentDNAProfiles: 1,
    filesUploaded: 8,
    topTools: ['Message Builder', 'Strategy Mapper'],
    recentActivity: '1 day ago'
  },
  { 
    name: 'Dartmouth College', 
    users: 1, 
    sharedTemplates: 18,
    personalMessages: 45,
    journeys: 2,
    contentDNAProfiles: 1,
    filesUploaded: 5,
    topTools: ['Evaluator', 'Message Builder'],
    recentActivity: '2 days ago'
  },
  { 
    name: 'Cornell University', 
    users: 1, 
    sharedTemplates: 27,
    personalMessages: 112,
    journeys: 5,
    contentDNAProfiles: 2,
    filesUploaded: 14,
    topTools: ['Strategy Mapper', 'BYOC', 'Evaluator'],
    recentActivity: '3 days ago'
  },
];

// Shared Library breakdown by type
const mockSharedLibraryBreakdown = {
  byType: [
    { type: 'Email Templates', count: 89, institutions: 8 },
    { type: 'SMS Templates', count: 54, institutions: 7 },
    { type: 'Journey Playbooks', count: 45, institutions: 6 },
    { type: 'Call Scripts', count: 32, institutions: 5 },
    { type: 'Social Media', count: 28, institutions: 4 },
    { type: 'Landing Pages', count: 15, institutions: 3 },
  ],
  byAudience: [
    { audience: 'Prospective Students', count: 78 },
    { audience: 'First-Year Students', count: 65 },
    { audience: 'At-Risk Students', count: 52 },
    { audience: 'Continuing Students', count: 41 },
    { audience: 'Graduate Students', count: 27 },
  ],
  byStatus: { published: 156, draft: 67, submitted: 23, approved: 17 }
};

// Personal Library aggregate stats
const mockPersonalLibraryStats = {
  totalMessages: 1213,
  totalUsers: 12,
  avgPerUser: 101,
  byChannel: [
    { channel: 'Email', count: 534 },
    { channel: 'SMS', count: 298 },
    { channel: 'Phone Script', count: 187 },
    { channel: 'Social Media', count: 112 },
    { channel: 'Portal', count: 82 },
  ],
  topContributors: [
    { name: 'Emily Rodriguez', institution: 'Princeton', count: 312 },
    { name: 'Sarah Mitchell', institution: 'Harvard', count: 234 },
    { name: 'James Chen', institution: 'Yale', count: 189 },
    { name: 'Michael Thompson', institution: 'Columbia', count: 156 },
  ]
};

interface RealUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
  department: string | null;
  tenant_id: string;
  institution_name?: string;
}

interface TenantWithStats {
  id: string;
  institution_name: string;
  status: string;
  userCount: number;
  toolUsageCount: number;
  contentDNACount: number;
  byocCount: number;
  recentActivity: string | null;
  users: RealUser[];
}

interface ToolUsageEvent {
  id: string;
  tenant_id: string;
  user_id: string;
  tool_name: string;
  action: string;
  created_at: string;
}

interface ContentDNASample {
  id: string;
  tenant_id: string;
  user_id: string;
  profile_id: string | null;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  content_text: string | null;
  source_type: string;
  created_at: string;
}

interface BYOCUpload {
  id: string;
  tenant_id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  tags: string[];
  created_at: string;
  user_id: string;
}

interface BetaFeedback {
  id: string;
  tenant_id: string;
  user_id: string;
  feature_area: string;
  page_path: string | null;
  feedback_type: string;
  feedback_text: string;
  rating: number | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  user_name?: string;
  institution_name?: string;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const { tenant, isSuperAdmin } = useAuth();
  const { templates, clearAllTemplates, resetToDefaults } = useSharedLibrary();
  const { messages, clearAllMessages } = useMessageLibrary();
  const { profiles } = useInstitutionalProfiles();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<RealUser[]>([]);
  const [tenants, setTenants] = useState<TenantWithStats[]>([]);
  const [toolUsage, setToolUsage] = useState<ToolUsageEvent[]>([]);
  const [contentDNASamples, setContentDNASamples] = useState<ContentDNASample[]>([]);
  const [byocUploads, setBYOCUploads] = useState<BYOCUpload[]>([]);
  const [betaFeedback, setBetaFeedback] = useState<BetaFeedback[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [clearPersonalOpen, setClearPersonalOpen] = useState(false);
  const [clearSharedOpen, setClearSharedOpen] = useState(false);

  // Fetch real users, tenants, and activity data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingUsers(true);
      try {
        // Fetch all tenants
        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenants')
          .select('*')
          .neq('id', '00000000-0000-0000-0000-000000000000') // Exclude PERSIST System tenant
          .order('institution_name');

        if (tenantsError) throw tenantsError;

        // Fetch all users with their roles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .neq('tenant_id', '00000000-0000-0000-0000-000000000000') // Exclude PERSIST system users
          .order('last_login_at', { ascending: false, nullsFirst: false });

        if (profilesError) throw profilesError;

        // Fetch tool usage events
        const { data: toolUsageData } = await supabase
          .from('tool_usage_events')
          .select('*')
          .order('created_at', { ascending: false });
        
        setToolUsage(toolUsageData || []);

        // Fetch Content DNA samples
        const { data: contentDNAData } = await supabase
          .from('content_dna_samples')
          .select('*')
          .order('created_at', { ascending: false });
        
        setContentDNASamples(contentDNAData || []);

        // Fetch BYOC uploads
        const { data: byocData } = await supabase
          .from('byoc_uploads')
          .select('*')
          .order('created_at', { ascending: false });
        
        setBYOCUploads(byocData || []);

        // Fetch beta feedback
        const { data: feedbackData } = await supabase
          .from('beta_feedback')
          .select('*')
          .order('created_at', { ascending: false });
        
        // Enrich feedback with user and institution names
        const enrichedFeedback = (feedbackData || []).map(fb => {
          const user = profilesData?.find(p => p.id === fb.user_id);
          const feedbackTenant = tenantsData?.find(t => t.id === fb.tenant_id);
          return {
            ...fb,
            user_name: user ? `${user.first_name} ${user.last_name}` : 'Unknown User',
            institution_name: feedbackTenant?.institution_name || 'Unknown Institution'
          };
        });
        setBetaFeedback(enrichedFeedback);

        // Fetch audit log for recent activity
        const { data: auditData } = await supabase
          .from('audit_log')
          .select('*')
          .order('created_at', { ascending: false });

        // Map users with institution names
        const usersWithInstitution = (profilesData || []).map(profile => {
          const userTenant = tenantsData?.find(t => t.id === profile.tenant_id);
          return {
            ...profile,
            institution_name: userTenant?.institution_name || 'Unknown'
          };
        });

        setUsers(usersWithInstitution);

        // Calculate comprehensive stats per tenant
        const tenantsWithStats: TenantWithStats[] = (tenantsData || []).map(t => {
          const tenantUsers = (profilesData || []).filter(p => p.tenant_id === t.id);
          const tenantToolUsage = (toolUsageData || []).filter(tu => tu.tenant_id === t.id);
          const tenantContentDNA = (contentDNAData || []).filter(cd => cd.tenant_id === t.id);
          const tenantBYOC = (byocData || []).filter(b => b.tenant_id === t.id);
          const tenantAudit = (auditData || []).filter(a => a.tenant_id === t.id);
          
          // Get most recent activity
          const recentActivityDate = tenantUsers
            .filter(u => u.last_login_at)
            .sort((a, b) => new Date(b.last_login_at!).getTime() - new Date(a.last_login_at!).getTime())[0]?.last_login_at || null;

          return {
            id: t.id,
            institution_name: t.institution_name,
            status: t.status,
            userCount: tenantUsers.length,
            toolUsageCount: tenantToolUsage.length,
            contentDNACount: tenantContentDNA.length,
            byocCount: tenantBYOC.length,
            recentActivity: recentActivityDate,
            users: tenantUsers.map(u => ({
              ...u,
              institution_name: t.institution_name
            }))
          };
        });

        setTenants(tenantsWithStats);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users and institutions',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin, toast]);

  const handleClearPersonalLibrary = () => {
    clearAllMessages();
    setClearPersonalOpen(false);
    toast({ title: "Personal Library cleared", description: "All personal messages have been removed." });
  };

  const handleClearSharedLibrary = () => {
    clearAllTemplates();
    setClearSharedOpen(false);
    toast({ title: "Shared Library cleared", description: "All shared templates have been removed." });
  };

  const handleResetSharedToDefaults = () => {
    resetToDefaults();
    toast({ title: "Shared Library reset", description: "Default templates have been restored." });
  };

  const activeUsers = users.filter(u => u.status === 'active').length;
  const recentLogins = users.filter(u => {
    if (!u.last_login_at) return false;
    const lastLogin = new Date(u.last_login_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastLogin > weekAgo;
  }).length;

  const formatLastLogin = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  // Tool usage stats
  const toolUsageStats = [
    { name: 'Message Builder', icon: MessageSquare, usage: 456, trend: '+12%' },
    { name: 'Message Evaluator', icon: FileText, usage: 389, trend: '+8%' },
    { name: 'Strategy Mapper', icon: Compass, usage: 234, trend: '+23%' },
    { name: 'Call Script Generator', icon: Phone, usage: 156, trend: '+5%' },
    { name: 'AI Playground', icon: Sparkles, usage: 98, trend: '+34%' },
    { name: 'BYOC', icon: Upload, usage: 67, trend: '+18%' },
  ];

  // AI function stats - showing the data flow
  const aiFunctionStats = [
    { name: 'evaluate-message', description: 'Message evaluation & refinement', calls: 423, success: 418, errors: 5, avgTime: '1.2s', contentDNAUsed: 312 },
    { name: 'generate-message', description: 'Multi-channel message generation', calls: 512, success: 506, errors: 6, avgTime: '2.1s', contentDNAUsed: 489 },
    { name: 'playground-chat', description: 'Interactive strategy chat', calls: 156, success: 154, errors: 2, avgTime: '1.8s', contentDNAUsed: 78 },
    { name: 'analyze-voice', description: 'Content DNA extraction', calls: 45, success: 43, errors: 2, avgTime: '3.2s', contentDNAUsed: 0 },
  ];

  const totalContentDNAInjections = aiFunctionStats.reduce((sum, fn) => sum + fn.contentDNAUsed, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Super Admin</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                PERSIST Super Admin
              </h1>
              <p className="text-muted-foreground mt-1">
                Cross-institution analytics and system administration
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link to="/admin/qa">
                  <Shield className="w-4 h-4 mr-2" />
                  QA Diagnostics
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/seed">
                  <Database className="w-4 h-4 mr-2" />
                  Seed Data
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/onboarding">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Onboarding
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/users">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-primary/10">
                    <GraduationCap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{isLoadingUsers ? '...' : tenants.length}</p>
                    <p className="text-[10px] text-muted-foreground">Institutions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-blue-500/10">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{users.length}</p>
                    <p className="text-[10px] text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-green-500/10">
                    <Activity className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{activeUsers}</p>
                    <p className="text-[10px] text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-purple-500/10">
                    <Library className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{templates.length}</p>
                    <p className="text-[10px] text-muted-foreground">Shared Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-orange-500/10">
                    <Mic className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{isLoadingUsers ? '...' : contentDNASamples.length}</p>
                    <p className="text-[10px] text-muted-foreground">Content DNA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-cyan-500/10">
                    <Cpu className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{isLoadingUsers ? '...' : toolUsage.length}</p>
                    <p className="text-[10px] text-muted-foreground">Tool Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="institutions">Institutions</TabsTrigger>
              <TabsTrigger value="libraries">Libraries</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Recent User Activity */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {users.slice(0, 6).map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {user.first_name[0]}{user.last_name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                              <p className="text-[10px] text-muted-foreground">{user.institution_name}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatLastLogin(user.last_login_at)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tool Usage */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Tool Usage (30 days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {toolUsageStats.map((tool, index) => (
                      <div key={tool.name} className="flex items-center gap-3">
                        <div className="w-5 text-center text-muted-foreground text-xs">
                          #{index + 1}
                        </div>
                        <div className="p-1 rounded bg-muted">
                          <tool.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium">{tool.name}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold">{tool.usage}</span>
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {tool.trend}
                              </Badge>
                            </div>
                          </div>
                          <Progress value={(tool.usage / toolUsageStats[0].usage) * 100} className="h-1" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Institutions Tab */}
            <TabsContent value="institutions" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Institution Breakdown</CardTitle>
                  <CardDescription>Detailed analytics per institution including users, activity, and file uploads</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : tenants.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No institutions found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tenants.map(inst => {
                        const isExpanded = expandedTenant === inst.id;
                        const tenantToolUsage = toolUsage.filter(tu => tu.tenant_id === inst.id);
                        const tenantContentDNA = contentDNASamples.filter(cd => cd.tenant_id === inst.id);
                        const tenantBYOC = byocUploads.filter(b => b.tenant_id === inst.id);
                        
                        // Aggregate tool usage by tool name
                        const toolUsageByName = tenantToolUsage.reduce((acc, tu) => {
                          acc[tu.tool_name] = (acc[tu.tool_name] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        
                        return (
                          <Card key={inst.id} className={`border ${isExpanded ? 'border-primary/50' : ''}`}>
                            <div 
                              className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                              onClick={() => setExpandedTenant(isExpanded ? null : inst.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-primary/10">
                                    <GraduationCap className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{inst.institution_name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                      {inst.recentActivity ? `Last active ${formatLastLogin(inst.recentActivity)}` : 'No recent activity'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      <Users className="w-3 h-3 mr-1" />
                                      {inst.userCount}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      <Activity className="w-3 h-3 mr-1" />
                                      {inst.toolUsageCount}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      <Mic className="w-3 h-3 mr-1" />
                                      {inst.contentDNACount}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      <Upload className="w-3 h-3 mr-1" />
                                      {inst.byocCount}
                                    </Badge>
                                  </div>
                                  <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                </div>
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="px-4 pb-4 border-t">
                                <div className="pt-4 grid md:grid-cols-3 gap-4">
                                  {/* Users Section */}
                                  <div className="space-y-3">
                                    <h4 className="font-medium text-sm flex items-center gap-2">
                                      <Users className="w-4 h-4" />
                                      Users ({inst.users.length})
                                    </h4>
                                    <ScrollArea className="h-48">
                                      <div className="space-y-2">
                                        {inst.users.length === 0 ? (
                                          <p className="text-xs text-muted-foreground">No users</p>
                                        ) : inst.users.map(user => (
                                          <div key={user.id} className="flex items-center justify-between p-2 rounded bg-muted/30">
                                            <div>
                                              <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                                              <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                            <div className="text-right">
                                              <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                                                {user.status}
                                              </Badge>
                                              <p className="text-[10px] text-muted-foreground mt-1">
                                                {formatLastLogin(user.last_login_at)}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                  
                                  {/* Tool Activity Section */}
                                  <div className="space-y-3">
                                    <h4 className="font-medium text-sm flex items-center gap-2">
                                      <Activity className="w-4 h-4" />
                                      Tool Activity
                                    </h4>
                                    {Object.keys(toolUsageByName).length === 0 ? (
                                      <div className="h-48 flex items-center justify-center">
                                        <p className="text-xs text-muted-foreground">No tool usage recorded yet</p>
                                      </div>
                                    ) : (
                                      <ScrollArea className="h-48">
                                        <div className="space-y-2">
                                          {Object.entries(toolUsageByName)
                                            .sort(([,a], [,b]) => b - a)
                                            .map(([tool, count]) => (
                                              <div key={tool} className="flex items-center justify-between p-2 rounded bg-muted/30">
                                                <span className="text-sm">{tool}</span>
                                                <Badge variant="secondary">{count}</Badge>
                                              </div>
                                            ))}
                                        </div>
                                      </ScrollArea>
                                    )}
                                  </div>
                                  
                                  {/* Files Section */}
                                  <div className="space-y-3">
                                    <h4 className="font-medium text-sm flex items-center gap-2">
                                      <FolderOpen className="w-4 h-4" />
                                      Uploaded Files
                                    </h4>
                                    <ScrollArea className="h-48">
                                      <div className="space-y-2">
                                        {tenantContentDNA.length === 0 && tenantBYOC.length === 0 ? (
                                          <p className="text-xs text-muted-foreground">No files uploaded</p>
                                        ) : (
                                          <>
                                            {tenantContentDNA.map(file => (
                                              <div key={file.id} className="flex items-center justify-between p-2 rounded bg-orange-500/10">
                                                <div className="flex items-center gap-2">
                                                  <Mic className="w-3 h-3 text-orange-600" />
                                                  <div>
                                                    <p className="text-xs font-medium truncate max-w-[120px]">{file.file_name}</p>
                                                    <p className="text-[10px] text-muted-foreground">Content DNA</p>
                                                  </div>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">
                                                  {new Date(file.created_at).toLocaleDateString()}
                                                </span>
                                              </div>
                                            ))}
                                            {tenantBYOC.map(file => (
                                              <div key={file.id} className="flex items-center justify-between p-2 rounded bg-blue-500/10">
                                                <div className="flex items-center gap-2">
                                                  <Upload className="w-3 h-3 text-blue-600" />
                                                  <div>
                                                    <p className="text-xs font-medium truncate max-w-[120px]">{file.file_name}</p>
                                                    <p className="text-[10px] text-muted-foreground">BYOC</p>
                                                  </div>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">
                                                  {new Date(file.created_at).toLocaleDateString()}
                                                </span>
                                              </div>
                                            ))}
                                          </>
                                        )}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-4 pt-4 border-t">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link to={`/admin/users?tenant=${inst.id}`}>
                                      <Users className="w-4 h-4 mr-2" />
                                      Manage Users
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Libraries Tab */}
            <TabsContent value="libraries" className="mt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Shared Library Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Library className="w-4 h-4" />
                      Shared Library Breakdown
                    </CardTitle>
                    <CardDescription>263 total items across 8 institutions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground uppercase mb-2">By Content Type</h5>
                      <div className="space-y-2">
                        {mockSharedLibraryBreakdown.byType.map(item => (
                          <div key={item.type} className="flex items-center justify-between">
                            <span className="text-sm">{item.type}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{item.count}</Badge>
                              <span className="text-xs text-muted-foreground">{item.institutions} inst.</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h5 className="text-xs font-medium text-muted-foreground uppercase mb-2">By Audience</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {mockSharedLibraryBreakdown.byAudience.map(item => (
                          <Badge key={item.audience} variant="outline" className="text-xs">
                            {item.audience}: {item.count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h5 className="text-xs font-medium text-muted-foreground uppercase mb-2">By Status</h5>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center p-2 bg-green-500/10 rounded">
                          <p className="text-lg font-bold text-green-600">{mockSharedLibraryBreakdown.byStatus.published}</p>
                          <p className="text-[10px] text-muted-foreground">Published</p>
                        </div>
                        <div className="text-center p-2 bg-yellow-500/10 rounded">
                          <p className="text-lg font-bold text-yellow-600">{mockSharedLibraryBreakdown.byStatus.submitted}</p>
                          <p className="text-[10px] text-muted-foreground">Pending</p>
                        </div>
                        <div className="text-center p-2 bg-blue-500/10 rounded">
                          <p className="text-lg font-bold text-blue-600">{mockSharedLibraryBreakdown.byStatus.approved}</p>
                          <p className="text-[10px] text-muted-foreground">Approved</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-lg font-bold">{mockSharedLibraryBreakdown.byStatus.draft}</p>
                          <p className="text-[10px] text-muted-foreground">Draft</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Library Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      Personal Libraries (Aggregate)
                    </CardTitle>
                    <CardDescription>{mockPersonalLibraryStats.totalMessages} messages from {mockPersonalLibraryStats.totalUsers} users</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground uppercase mb-2">By Channel</h5>
                      <div className="space-y-2">
                        {mockPersonalLibraryStats.byChannel.map(item => (
                          <div key={item.channel} className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm">{item.channel}</span>
                                <span className="text-sm font-medium">{item.count}</span>
                              </div>
                              <Progress value={(item.count / mockPersonalLibraryStats.byChannel[0].count) * 100} className="h-1.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h5 className="text-xs font-medium text-muted-foreground uppercase mb-2">Top Contributors</h5>
                      <div className="space-y-2">
                        {mockPersonalLibraryStats.topContributors.map((user, i) => (
                          <div key={user.name} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                              <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-[10px] text-muted-foreground">{user.institution}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">{user.count} msgs</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI & Content DNA Tab */}
            <TabsContent value="ai" className="mt-4 space-y-4">
              {/* Content DNA → AI Flow Explanation */}
              <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    How Content DNA Flows Into Message Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 overflow-x-auto pb-2">
                    <div className="flex-shrink-0 p-3 bg-background rounded-lg border text-center min-w-[120px]">
                      <Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs font-medium">User Uploads</p>
                      <p className="text-[10px] text-muted-foreground">Files & Samples</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-shrink-0 p-3 bg-background rounded-lg border text-center min-w-[120px]">
                      <Sparkles className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                      <p className="text-xs font-medium">analyze-voice</p>
                      <p className="text-[10px] text-muted-foreground">Extracts Content DNA</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-shrink-0 p-3 bg-background rounded-lg border text-center min-w-[120px]">
                      <Database className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-xs font-medium">Stored in Profile</p>
                      <p className="text-[10px] text-muted-foreground">contentDNA object</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-shrink-0 p-3 bg-background rounded-lg border text-center min-w-[120px]">
                      <MessageSquare className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      <p className="text-xs font-medium">Injected into AI</p>
                      <p className="text-[10px] text-muted-foreground">Every generation call</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg border border-primary/30 text-center min-w-[120px]">
                      <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">DNA-Matched</p>
                      <p className="text-[10px] text-muted-foreground">Output Messages</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    <strong>{totalContentDNAInjections} messages</strong> have been generated with Content DNA injection in the last 30 days.
                  </p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {/* AI Function Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      Edge Function Performance
                    </CardTitle>
                    <CardDescription>Last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Function</TableHead>
                          <TableHead className="text-right">Calls</TableHead>
                          <TableHead className="text-right">Success</TableHead>
                          <TableHead className="text-right">DNA Used</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aiFunctionStats.map(fn => (
                          <TableRow key={fn.name}>
                            <TableCell>
                              <div>
                                <p className="font-mono text-xs">{fn.name}</p>
                                <p className="text-[10px] text-muted-foreground">{fn.description}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">{fn.calls}</TableCell>
                            <TableCell className="text-right">
                              <span className="text-green-600">{Math.round((fn.success / fn.calls) * 100)}%</span>
                            </TableCell>
                            <TableCell className="text-right">
                              {fn.contentDNAUsed > 0 ? (
                                <Badge className="bg-orange-500/20 text-orange-700 text-[10px]">
                                  {fn.contentDNAUsed}
                                </Badge>
                              ) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Voice Profiles by Institution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      Content DNA Profiles by Institution
                    </CardTitle>
                    <CardDescription>16 active Content DNA profiles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockInstitutionData.filter(i => i.contentDNAProfiles > 0).map(inst => (
                        <div key={inst.name} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{inst.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {inst.contentDNAProfiles} profile{inst.contentDNAProfiles > 1 ? 's' : ''}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {inst.filesUploaded} files
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-green-700 dark:text-green-400">
                          All Content DNA profiles are being injected into AI prompts for institution-specific message generation.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-serif">All Users</CardTitle>
                    <CardDescription>{users.length} users across {tenants.length} institutions</CardDescription>
                  </div>
                  <Button asChild>
                    <Link to="/admin/users">
                      <Users className="w-4 h-4 mr-2" />
                      Full Management
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No users found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Institution</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Member Since</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map(user => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                  {user.first_name[0]}{user.last_name[0]}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{user.first_name} {user.last_name}</p>
                                  <p className="text-[10px] text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{user.institution_name}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={user.status === 'active' ? 'default' : 'secondary'}
                                className={user.status === 'active' ? 'bg-green-500' : user.status === 'locked' ? 'bg-red-500' : ''}
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatLastLogin(user.last_login_at)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admin Functions Tab */}
            <TabsContent value="admin" className="mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Data Management
                    </CardTitle>
                    <CardDescription>Purge and reset library content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Shared Library</p>
                        <p className="text-xs text-muted-foreground">{templates.length} local templates</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleResetSharedToDefaults}>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reset
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setClearSharedOpen(true)}>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Purge
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Personal Library</p>
                        <p className="text-xs text-muted-foreground">{messages.length} your messages</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => setClearPersonalOpen(true)}>
                        <Trash2 className="w-3 h-3 mr-1" />
                        Purge
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Quick Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                      <Link to="/admin/users">
                        <Users className="w-4 h-4 mr-2" />
                        User Management
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                      <Link to="/admin/onboarding">
                        <Activity className="w-4 h-4 mr-2" />
                        Access Requests
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                      <Link to="/approvals">
                        <FileText className="w-4 h-4 mr-2" />
                        Library Approvals
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                      <Link to="/settings">
                        <Building2 className="w-4 h-4 mr-2" />
                        Institutional Profiles
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </main>

      {/* Dialogs */}
      <AlertDialog open={clearPersonalOpen} onOpenChange={setClearPersonalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Purge Personal Library
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {messages.length} messages. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearPersonalLibrary} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearSharedOpen} onOpenChange={setClearSharedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Purge Shared Library
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {templates.length} templates. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearSharedLibrary} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;