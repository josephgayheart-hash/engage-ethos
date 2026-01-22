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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SendEmailDialog } from "@/components/admin/SendEmailDialog";
import { EmailTemplatesTab } from "@/components/admin/EmailTemplatesTab";
import { BrandRadarTab } from "@/components/admin/BrandRadarTab";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import {
  AnalyticsKPICards,
  UsageTrendChart,
  EngagementFunnelCard,
  FeatureAdoptionCard,
  TenantHealthTable,
  AlertsInsightsCard,
  ToolUsageBreakdownCard
} from "@/components/admin/analytics";
import { 
  ArrowLeft,
  Users, 
  UserPlus,
  Building2,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Activity,
  BarChart3,
  Library,
  FolderOpen,
  TrendingUp,
  AlertTriangle,
  Loader2,
  FileText,
  MessageSquare,
  Sparkles,
  Upload,
  Settings,
  Shield,
  Database,
  Mic,
  GraduationCap,
  Eye,
  FolderTree,
  Dna,
  Mail,
  Send,
  Share2,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Target,
  Layers,
  BookOpen,
  Heart,
  Zap,
  ArrowRight,
  Radar,
  Briefcase,
  Filter,
  LayoutDashboard,
} from "lucide-react";

// Types
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

interface InstitutionalProfile {
  id: string;
  tenant_id: string;
  name: string;
  profile_type: string;
  parent_profile_id: string | null;
  config: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  created_by_user_id: string | null;
  institution_name?: string;
  children?: InstitutionalProfile[];
}

interface TenantWithStats {
  id: string;
  institution_name: string;
  status: string;
  tenant_type: 'university' | 'agency';
  userCount: number;
  contentDNACount: number;
  personalMessagesCount: number;
  sharedTemplatesCount: number;
  institutionalProfilesCount: number;
  recentActivity: string | null;
  users: RealUser[];
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
  sample_type: string | null;
  title: string | null;
  created_at: string;
  institution_name?: string;
  profile_name?: string;
}

interface ContentDNAAnalysis {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  voice_analysis: Record<string, any>;
  brand_platform: Record<string, any> | null;
  custom_instructions: string | null;
  sample_count: number;
  last_analyzed_at: string | null;
  created_at: string;
  institution_name?: string;
  profile_name?: string;
}

interface EmailNudge {
  id: string;
  tenant_id: string;
  user_id: string;
  nudge_type: string;
  email_count: number;
  sent_at: string;
  created_at: string;
  recipient_email?: string;
  recipient_name?: string;
  subject?: string;
  email_type?: string;
  status?: string;
  metadata?: Record<string, any>;
  user_name?: string;
  user_email?: string;
  institution_name?: string;
  // Delivery tracking fields
  provider?: string;
  provider_message_id?: string;
  delivery_status?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
}

interface Referral {
  id: string;
  referrer_user_id: string;
  referrer_tenant_id: string;
  referee_name: string | null;
  referee_email: string;
  referral_type: string;
  personal_message: string | null;
  status: string;
  created_at: string;
  joined_at: string | null;
  referrer_name?: string;
  referrer_institution?: string;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const { isSuperAdmin } = useAuth();
  const { templates, clearAllTemplates, resetToDefaults } = useSharedLibrary();
  const { messages, clearAllMessages } = useMessageLibrary();
  
  const [activeTab, setActiveTab] = useState("command-center");
  const [users, setUsers] = useState<RealUser[]>([]);
  const [tenants, setTenants] = useState<TenantWithStats[]>([]);
  const [institutionalProfiles, setInstitutionalProfiles] = useState<InstitutionalProfile[]>([]);
  const [contentDNASamples, setContentDNASamples] = useState<ContentDNASample[]>([]);
  const [contentDNAAnalyses, setContentDNAAnalyses] = useState<ContentDNAAnalysis[]>([]);
  const [emailNudges, setEmailNudges] = useState<EmailNudge[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set());
  const [clearPersonalOpen, setClearPersonalOpen] = useState(false);
  const [clearSharedOpen, setClearSharedOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [tenantTypeFilter, setTenantTypeFilter] = useState<'all' | 'university' | 'agency'>('all');

  // Analytics hook for new Command Center
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useAdminAnalytics();

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all tenants (excluding system tenant)
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .order('institution_name');
      if (tenantsError) throw tenantsError;

      // Fetch all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('tenant_id', '00000000-0000-0000-0000-000000000000')
        .order('last_login_at', { ascending: false, nullsFirst: false });
      if (profilesError) throw profilesError;

      // Fetch institutional profiles with hierarchy
      const { data: instProfilesData } = await supabase
        .from('institutional_profiles')
        .select('*')
        .order('created_at', { ascending: true });

      // Fetch Content DNA samples
      const { data: dnaSamplesData } = await supabase
        .from('content_dna_samples')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch Content DNA analyses
      const { data: dnaAnalysesData } = await supabase
        .from('content_dna_analysis')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch email nudges
      const { data: nudgesData } = await supabase
        .from('email_nudges')
        .select('*')
        .order('sent_at', { ascending: false });

      // Fetch referrals
      const { data: referralsData } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch personal messages count per tenant
      const { data: personalMessagesData } = await supabase
        .from('personal_messages')
        .select('id, tenant_id');

      // Fetch shared templates count per tenant
      const { data: sharedTemplatesData } = await supabase
        .from('shared_templates')
        .select('id, tenant_id');

      // Fetch pending onboarding requests count
      const { data: pendingRequestsData, error: pendingError } = await supabase
        .from('onboarding_requests')
        .select('id')
        .eq('request_status', 'submitted');
      
      if (!pendingError) {
        setPendingRequestsCount(pendingRequestsData?.length || 0);
      }

      // Map users with institution names
      const usersWithInstitution = (profilesData || []).map(profile => {
        const userTenant = tenantsData?.find(t => t.id === profile.tenant_id);
        return {
          ...profile,
          institution_name: userTenant?.institution_name || 'Unknown'
        };
      });
      setUsers(usersWithInstitution);

      // Map institutional profiles with institution names
      const profilesWithInstitution: InstitutionalProfile[] = (instProfilesData || []).map(ip => {
        const ipTenant = tenantsData?.find(t => t.id === ip.tenant_id);
        return {
          ...ip,
          config: ip.config as Record<string, any> | null,
          institution_name: ipTenant?.institution_name || 'Unknown'
        };
      });
      setInstitutionalProfiles(profilesWithInstitution);

      // Map Content DNA samples with names
      const samplesWithNames: ContentDNASample[] = (dnaSamplesData || []).map(s => {
        const sTenant = tenantsData?.find(t => t.id === s.tenant_id);
        const sProfile = profilesWithInstitution.find(p => p.id === s.profile_id);
        return {
          ...s,
          institution_name: sTenant?.institution_name || 'Unknown',
          profile_name: sProfile?.name || null
        };
      });
      setContentDNASamples(samplesWithNames);

      // Map Content DNA analyses with names
      const analysesWithNames: ContentDNAAnalysis[] = (dnaAnalysesData || []).map(a => {
        const aTenant = tenantsData?.find(t => t.id === a.tenant_id);
        const aProfile = profilesWithInstitution.find(p => p.id === a.profile_id);
        return {
          ...a,
          voice_analysis: a.voice_analysis as Record<string, any>,
          brand_platform: a.brand_platform as Record<string, any> | null,
          institution_name: aTenant?.institution_name || 'Unknown',
          profile_name: aProfile?.name || null
        };
      });
      setContentDNAAnalyses(analysesWithNames);

      // Map email nudges with user info
      const nudgesWithNames: EmailNudge[] = (nudgesData || []).map(n => {
        const nUser = usersWithInstitution.find(u => u.id === n.user_id);
        const nTenant = tenantsData?.find(t => t.id === n.tenant_id);
        return {
          ...n,
          metadata: n.metadata as Record<string, any> | undefined,
          user_name: nUser ? `${nUser.first_name} ${nUser.last_name}` : 'Unknown',
          user_email: nUser?.email || 'Unknown',
          institution_name: nTenant?.institution_name || 'Unknown'
        };
      });
      setEmailNudges(nudgesWithNames);

      // Map referrals with referrer info
      const referralsWithNames: Referral[] = (referralsData || []).map(r => {
        const rUser = usersWithInstitution.find(u => u.id === r.referrer_user_id);
        const rTenant = tenantsData?.find(t => t.id === r.referrer_tenant_id);
        return {
          ...r,
          referrer_name: rUser ? `${rUser.first_name} ${rUser.last_name}` : 'Unknown',
          referrer_institution: rTenant?.institution_name || 'Unknown'
        };
      });
      setReferrals(referralsWithNames);

      // Calculate comprehensive stats per tenant
      const tenantsWithStats: TenantWithStats[] = (tenantsData || []).map(t => {
        const tenantUsers = usersWithInstitution.filter(p => p.tenant_id === t.id);
        const tenantContentDNA = (dnaSamplesData || []).filter(cd => cd.tenant_id === t.id);
        const tenantPersonalMessages = (personalMessagesData || []).filter(pm => pm.tenant_id === t.id);
        const tenantSharedTemplates = (sharedTemplatesData || []).filter(st => st.tenant_id === t.id);
        const tenantInstProfiles = (instProfilesData || []).filter(ip => ip.tenant_id === t.id);

        const recentActivityDate = tenantUsers
          .filter(u => u.last_login_at)
          .sort((a, b) => new Date(b.last_login_at!).getTime() - new Date(a.last_login_at!).getTime())[0]?.last_login_at || null;

        return {
          id: t.id,
          institution_name: t.institution_name,
          status: t.status,
          tenant_type: (t as any).tenant_type || 'university',
          userCount: tenantUsers.length,
          contentDNACount: tenantContentDNA.length,
          personalMessagesCount: tenantPersonalMessages.length,
          sharedTemplatesCount: tenantSharedTemplates.length,
          institutionalProfilesCount: tenantInstProfiles.length,
          recentActivity: recentActivityDate,
          users: tenantUsers
        };
      });
      setTenants(tenantsWithStats);
      setLastRefresh(new Date());

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin]);

  // Realtime subscription for email_nudges
  useEffect(() => {
    if (!isSuperAdmin) return;

    const channel = supabase
      .channel('email-nudges-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_nudges'
        },
        (payload) => {
          console.log('Email nudge realtime update:', payload);
          // Refetch data on any change
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSuperAdmin]);

  const handleClearPersonalLibrary = () => {
    clearAllMessages();
    setClearPersonalOpen(false);
    toast({ title: "Personal Library cleared" });
  };

  const handleClearSharedLibrary = () => {
    clearAllTemplates();
    setClearSharedOpen(false);
    toast({ title: "Shared Library cleared" });
  };

  const formatTime = (date: string | null) => {
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

  const toggleTenantExpand = (tenantId: string) => {
    setExpandedTenants(prev => {
      const next = new Set(prev);
      if (next.has(tenantId)) {
        next.delete(tenantId);
      } else {
        next.add(tenantId);
      }
      return next;
    });
  };

  // Build hierarchical profile structure for a tenant
  const buildProfileHierarchy = (tenantId: string): InstitutionalProfile[] => {
    const tenantProfiles = institutionalProfiles.filter(p => p.tenant_id === tenantId);
    const rootProfiles = tenantProfiles.filter(p => !p.parent_profile_id);
    
    const attachChildren = (profile: InstitutionalProfile): InstitutionalProfile => {
      const children = tenantProfiles.filter(p => p.parent_profile_id === profile.id);
      return {
        ...profile,
        children: children.map(attachChildren)
      };
    };

    return rootProfiles.map(attachChildren);
  };

  // Get configuration status
  const getConfigStatus = (profile: InstitutionalProfile): 'configured' | 'partial' | 'inactive' => {
    const config = profile.config || {};
    const importantFields = ['institutionName', 'portalName', 'primaryCTAs', 'leaderNames'];
    const filledCount = importantFields.filter(f => {
      const val = config[f];
      if (Array.isArray(val)) return val.length > 0;
      return val && val.toString().trim() !== '';
    }).length;
    
    if (filledCount >= 3) return 'configured';
    if (filledCount >= 1) return 'partial';
    return 'inactive';
  };

  // Render profile hierarchy recursively
  const renderProfileHierarchy = (profiles: InstitutionalProfile[], depth = 0) => {
    return profiles.map(profile => {
      const status = getConfigStatus(profile);
      const hasDNA = contentDNASamples.some(s => s.profile_id === profile.id);
      const dnaAnalysis = contentDNAAnalyses.find(a => a.profile_id === profile.id);
      
      return (
        <div key={profile.id} style={{ marginLeft: depth * 24 }}>
          <div className="flex items-center justify-between p-3 border rounded-lg mb-2 bg-card hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {depth === 0 ? (
                <GraduationCap className="w-5 h-5 text-primary" />
              ) : (
                <FolderTree className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{profile.name}</p>
                  <Badge variant="outline" className="text-[10px]">{profile.profile_type}</Badge>
                </div>
                {depth === 0 && (
                  <p className="text-[10px] text-muted-foreground">{profile.institution_name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasDNA && (
                <Badge className="text-[10px] bg-orange-100 text-orange-700 border-orange-200">
                  <Dna className="w-3 h-3 mr-1" />
                  DNA
                </Badge>
              )}
              {dnaAnalysis?.brand_platform && (
                <Badge className="text-[10px] bg-purple-100 text-purple-700 border-purple-200">
                  <Target className="w-3 h-3 mr-1" />
                  Brand
                </Badge>
              )}
              <Badge 
                variant={status === 'configured' ? 'default' : status === 'partial' ? 'secondary' : 'outline'}
                className="text-[10px]"
              >
                {status === 'configured' ? 'Configured' : status === 'partial' ? 'Partial' : 'Not Set'}
              </Badge>
            </div>
          </div>
          {profile.children && profile.children.length > 0 && (
            <div className="border-l-2 border-muted ml-3">
              {renderProfileHierarchy(profile.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalDNASamples = contentDNASamples.length;
  const totalAnalyses = contentDNAAnalyses.length;
  const totalEmails = emailNudges.length;
  const totalReferrals = referrals.length;
  const universityCount = tenants.filter(t => t.tenant_type === 'university').length;
  const agencyCount = tenants.filter(t => t.tenant_type === 'agency').length;

  // Filter tenants by type
  const filteredTenants = tenants.filter(t => 
    tenantTypeFilter === 'all' || t.tenant_type === tenantTypeFilter
  );

  // Filter data based on search
  const filteredNudges = emailNudges.filter(n => 
    !searchTerm || 
    n.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.institution_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.nudge_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReferrals = referrals.filter(r =>
    !searchTerm ||
    r.referrer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.referee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.referee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.referrer_institution?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
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
                CampusVoice.ai Super Admin
              </h1>
              <p className="text-muted-foreground mt-1">
                Platform governance, brand integrity & content lineage
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={fetchData}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {lastRefresh ? `Updated ${formatTime(lastRefresh.toISOString())}` : 'Refresh'}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/qa">
                  <Shield className="w-4 h-4 mr-2" />
                  QA
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/users">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </Link>
              </Button>
              <Button variant="outline" asChild className="relative">
                <Link to="/admin/onboarding">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Requests
                  {pendingRequestsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold px-1.5">
                      {pendingRequestsCount > 99 ? '99+' : pendingRequestsCount}
                    </span>
                  )}
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-primary/10">
                    <GraduationCap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{isLoading ? '...' : universityCount}</p>
                    <p className="text-[10px] text-muted-foreground">Universities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-purple-500/10">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{isLoading ? '...' : agencyCount}</p>
                    <p className="text-[10px] text-muted-foreground">Agencies</p>
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
                    <p className="text-[10px] text-muted-foreground">Users</p>
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
                  <div className="p-1.5 rounded bg-indigo-500/10">
                    <FolderTree className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{institutionalProfiles.length}</p>
                    <p className="text-[10px] text-muted-foreground">Profiles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-orange-500/10">
                    <Dna className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{totalDNASamples}</p>
                    <p className="text-[10px] text-muted-foreground">DNA Files</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-purple-500/10">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{totalAnalyses}</p>
                    <p className="text-[10px] text-muted-foreground">DNA Analyses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-cyan-500/10">
                    <Mail className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{totalEmails}</p>
                    <p className="text-[10px] text-muted-foreground">Emails Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-pink-500/10">
                    <Share2 className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{totalReferrals}</p>
                    <p className="text-[10px] text-muted-foreground">Referrals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full">
              <TabsTrigger value="command-center" className="gap-1">
                <LayoutDashboard className="w-3 h-3 hidden md:block" />
                Command
              </TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="institutions">Institutions</TabsTrigger>
              <TabsTrigger value="emails">Email Activity</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="radar" className="gap-1">
                <Radar className="w-3 h-3" />
                Radar
              </TabsTrigger>
              <TabsTrigger value="libraries">Libraries</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            {/* NEW: Command Center Tab - Analytics Dashboard */}
            <TabsContent value="command-center" className="space-y-6 mt-4">
              {/* KPI Cards */}
              {analytics && <AnalyticsKPICards data={analytics} isLoading={analyticsLoading} />}

              {/* Main Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Trends */}
                <div className="lg:col-span-2 space-y-6">
                  <UsageTrendChart data={analytics?.dailyUsage || []} isLoading={analyticsLoading} />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FeatureAdoptionCard data={analytics?.featureAdoption || []} isLoading={analyticsLoading} />
                    <ToolUsageBreakdownCard data={analytics?.toolUsage || []} isLoading={analyticsLoading} />
                  </div>
                </div>

                {/* Right Column - Health & Alerts */}
                <div className="space-y-6">
                  <AlertsInsightsCard 
                    atRiskTenants={analytics?.atRiskTenants || []}
                    noDNATenants={analytics?.noDNATenants || []}
                    inactiveUsers={analytics?.inactiveUsers || 0}
                    totalUsers={analytics?.totalUsers || 0}
                    isLoading={analyticsLoading}
                  />
                  {analytics?.engagementFunnel && (
                    <EngagementFunnelCard data={analytics.engagementFunnel} isLoading={analyticsLoading} />
                  )}
                </div>
              </div>

              {/* Tenant Health Overview */}
              <TenantHealthTable 
                data={analytics?.tenantHealth || []} 
                isLoading={analyticsLoading} 
                maxItems={5}
              />
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Recent User Activity */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[280px]">
                      <div className="space-y-2">
                        {users.slice(0, 10).map(user => (
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
                            <span className="text-xs text-muted-foreground">{formatTime(user.last_login_at)}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Institution Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Institution Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[280px]">
                      <div className="space-y-2">
                        {tenants.map(inst => (
                          <div key={inst.id} className="p-2 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{inst.institution_name}</p>
                              <Badge variant={inst.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                                {inst.status}
                              </Badge>
                            </div>
                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                              <span>{inst.userCount} users</span>
                              <span>{inst.institutionalProfilesCount} profiles</span>
                              <span>{inst.contentDNACount} DNA</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Quick Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                      <Link to="/admin/content-dna">
                        <Dna className="w-4 h-4 mr-2" />
                        Content DNA Center
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                      <Link to="/settings">
                        <FolderTree className="w-4 h-4 mr-2" />
                        Institutional Profiles
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
                      <Link to="/admin/users">
                        <Users className="w-4 h-4 mr-2" />
                        User Management
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                      <Link to="/admin/seed">
                        <Database className="w-4 h-4 mr-2" />
                        Seed Data
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Institutions Tab - University & Subunit Hierarchy */}
            <TabsContent value="institutions" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    University & Subunit Management
                  </CardTitle>
                  <CardDescription>
                    Hierarchical view of institutions with their colleges, divisions, and subunits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : tenants.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No institutions found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tenants.map(inst => {
                        const hierarchy = buildProfileHierarchy(inst.id);
                        const isExpanded = expandedTenants.has(inst.id);
                        
                        return (
                          <Collapsible key={inst.id} open={isExpanded} onOpenChange={() => toggleTenantExpand(inst.id)}>
                            <Card className="border-2">
                              <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <GraduationCap className="w-6 h-6 text-primary" />
                                      <div>
                                        <CardTitle className="text-lg">{inst.institution_name}</CardTitle>
                                        <CardDescription className="flex items-center gap-4 mt-1">
                                          <span>{inst.userCount} users</span>
                                          <span>{inst.institutionalProfilesCount} profiles</span>
                                          <span>{inst.contentDNACount} DNA samples</span>
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={inst.status === 'active' ? 'default' : 'secondary'}>
                                        {inst.status}
                                      </Badge>
                                      {isExpanded ? (
                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent className="border-t pt-4">
                                  {hierarchy.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                      No profiles configured yet
                                    </p>
                                  ) : (
                                    <div className="space-y-2">
                                      {renderProfileHierarchy(hierarchy)}
                                    </div>
                                  )}
                                  
                                  {/* Users Section */}
                                  <div className="mt-4 pt-4 border-t">
                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                      <Users className="w-4 h-4" />
                                      Users ({inst.users.length})
                                    </h4>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {inst.users.slice(0, 6).map(user => (
                                        <Link 
                                          key={user.id}
                                          to={`/admin/user/${user.id}`}
                                          className="flex items-center gap-2 p-2 rounded border hover:bg-muted/50 transition-colors"
                                        >
                                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
                                            {user.first_name[0]}{user.last_name[0]}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{user.first_name} {user.last_name}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                                          </div>
                                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                                            {user.status}
                                          </Badge>
                                        </Link>
                                      ))}
                                    </div>
                                    {inst.users.length > 6 && (
                                      <Button variant="link" size="sm" asChild className="mt-2">
                                        <Link to={`/admin/users?tenant=${inst.id}`}>
                                          View all {inst.users.length} users →
                                        </Link>
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content DNA Tab */}
            <TabsContent value="content-dna" className="mt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* DNA Samples */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Uploaded Files & Samples
                    </CardTitle>
                    <CardDescription>
                      {contentDNASamples.length} files uploaded across all institutions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {contentDNASamples.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No Content DNA samples uploaded</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {contentDNASamples.map(sample => (
                            <div key={sample.id} className="p-3 border rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-2">
                                  <FileText className="w-4 h-4 text-orange-600 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium">{sample.title || sample.file_name}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {sample.institution_name}
                                      {sample.profile_name && ` → ${sample.profile_name}`}
                                    </p>
                                    <div className="flex gap-2 mt-1">
                                      <Badge variant="outline" className="text-[10px]">{sample.sample_type || 'other'}</Badge>
                                      <Badge variant="outline" className="text-[10px]">{sample.source_type || 'upload'}</Badge>
                                      {sample.file_type && (
                                        <Badge variant="outline" className="text-[10px]">{sample.file_type}</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                  {formatTime(sample.created_at)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* DNA Analyses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Generated DNA Elements
                    </CardTitle>
                    <CardDescription>
                      {contentDNAAnalyses.length} voice analyses created
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {contentDNAAnalyses.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Dna className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No DNA analyses generated</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {contentDNAAnalyses.map(analysis => {
                            const voice = analysis.voice_analysis || {};
                            const hasBrand = !!analysis.brand_platform;
                            
                            return (
                              <div key={analysis.id} className="p-3 border rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="text-sm font-medium">{analysis.profile_name || 'Institution Level'}</p>
                                    <p className="text-[10px] text-muted-foreground">{analysis.institution_name}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <Badge className="text-[10px] bg-orange-100 text-orange-700">
                                      {analysis.sample_count} samples
                                    </Badge>
                                    {hasBrand && (
                                      <Badge className="text-[10px] bg-purple-100 text-purple-700">
                                        Brand Layer
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {voice.voiceAttributes && Array.isArray(voice.voiceAttributes) && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {voice.voiceAttributes.slice(0, 4).map((attr: any, i: number) => (
                                      <Badge key={i} variant="secondary" className="text-[10px]">
                                        {typeof attr === 'string' ? attr : attr?.name || 'Attribute'}
                                      </Badge>
                                    ))}
                                    {voice.voiceAttributes.length > 4 && (
                                      <Badge variant="outline" className="text-[10px]">
                                        +{voice.voiceAttributes.length - 4} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                <p className="text-[10px] text-muted-foreground mt-2">
                                  Analyzed: {analysis.last_analyzed_at ? formatTime(analysis.last_analyzed_at) : 'Never'}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Content Lineage Flow */}
              <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Content Lineage: How DNA Flows Into Outputs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 overflow-x-auto pb-2">
                    <div className="flex-shrink-0 p-3 bg-background rounded-lg border text-center min-w-[120px]">
                      <Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs font-medium">User Uploads</p>
                      <p className="text-[10px] text-muted-foreground">{contentDNASamples.length} files</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-shrink-0 p-3 bg-background rounded-lg border text-center min-w-[120px]">
                      <Sparkles className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                      <p className="text-xs font-medium">Voice Analysis</p>
                      <p className="text-[10px] text-muted-foreground">Extracts DNA</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-shrink-0 p-3 bg-background rounded-lg border text-center min-w-[120px]">
                      <Database className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-xs font-medium">Stored in Profile</p>
                      <p className="text-[10px] text-muted-foreground">{contentDNAAnalyses.length} analyses</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-shrink-0 p-3 bg-background rounded-lg border text-center min-w-[120px]">
                      <MessageSquare className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      <p className="text-xs font-medium">Injected into AI</p>
                      <p className="text-[10px] text-muted-foreground">Every generation</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg border border-primary/30 text-center min-w-[120px]">
                      <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">Brand-Aligned</p>
                      <p className="text-[10px] text-muted-foreground">Output Messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Brand Layer Tab */}
            <TabsContent value="brand" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Brand Layer Governance
                  </CardTitle>
                  <CardDescription>
                    Brand promise, pillars, and proof points across institutions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {tenants.map(inst => {
                        // Get all analyses for this tenant - both at tenant level and profile level
                        const tenantProfiles = institutionalProfiles.filter(p => p.tenant_id === inst.id);
                        const tenantProfileIds = tenantProfiles.map(p => p.id);
                        
                        const instAnalyses = contentDNAAnalyses.filter(a => 
                          a.tenant_id === inst.id || tenantProfileIds.includes(a.profile_id || '')
                        );
                        const hasBrandLayer = instAnalyses.some(a => a.brand_platform);
                        
                        // Show tenant if it has ANY analyses (voice or brand), not just brand
                        if (instAnalyses.length === 0) return null;
                        
                        return (
                          <Card key={inst.id} className="border-l-4 border-l-primary">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4" />
                                  {inst.institution_name}
                                </CardTitle>
                                <Badge variant={hasBrandLayer ? 'default' : 'outline'}>
                                  {hasBrandLayer ? 'Brand Layer Active' : 'Voice Only'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {instAnalyses.map(analysis => {
                                  const brand = analysis.brand_platform;
                                  const voice = analysis.voice_analysis;
                                  
                                  return (
                                    <div key={analysis.id} className="p-4 border rounded-lg bg-muted/30">
                                      <div className="flex items-center justify-between mb-3">
                                        <p className="font-medium text-sm">
                                          {analysis.profile_name || 'Institution Level'}
                                        </p>
                                        <div className="flex gap-1">
                                          {brand && <Badge className="text-[10px] bg-purple-100 text-purple-700">Brand Platform</Badge>}
                                          {voice && <Badge className="text-[10px] bg-orange-100 text-orange-700">Voice DNA</Badge>}
                                        </div>
                                      </div>
                                      
                                      {brand && (
                                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                                          {/* Brand Promise */}
                                          <div className="p-3 bg-background rounded border">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Heart className="w-4 h-4 text-pink-600" />
                                              <p className="text-xs font-medium text-muted-foreground">Brand Promise</p>
                                            </div>
                                            <p className="text-sm">
                                              {typeof brand.promise === 'string' ? brand.promise : 
                                               typeof brand.brandPromise === 'string' ? brand.brandPromise : 
                                               'Not defined'}
                                            </p>
                                          </div>
                                          
                                          {/* Pillars */}
                                          <div className="p-3 bg-background rounded border">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Layers className="w-4 h-4 text-blue-600" />
                                              <p className="text-xs font-medium text-muted-foreground">Brand Pillars</p>
                                            </div>
                                            {brand.pillars || brand.brandPillars ? (
                                              <div className="flex flex-wrap gap-1">
                                                {(brand.pillars || brand.brandPillars || []).map((pillar: any, i: number) => (
                                                  <Badge key={i} variant="secondary" className="text-[10px]">
                                                    {typeof pillar === 'string' ? pillar : pillar?.name || 'Pillar'}
                                                  </Badge>
                                                ))}
                                              </div>
                                            ) : (
                                              <p className="text-sm text-muted-foreground">Not defined</p>
                                            )}
                                          </div>
                                          
                                          {/* Proof Points */}
                                          <div className="p-3 bg-background rounded border">
                                            <div className="flex items-center gap-2 mb-2">
                                              <BookOpen className="w-4 h-4 text-green-600" />
                                              <p className="text-xs font-medium text-muted-foreground">Proof Points</p>
                                            </div>
                                            {brand.proofPoints || brand.foundations ? (
                                              <div className="flex flex-wrap gap-1">
                                                {(brand.proofPoints || brand.foundations || []).slice(0, 3).map((point: any, i: number) => (
                                                  <Badge key={i} variant="outline" className="text-[10px]">
                                                    {typeof point === 'string' ? point : point?.name || 'Point'}
                                                  </Badge>
                                                ))}
                                              </div>
                                            ) : (
                                              <p className="text-sm text-muted-foreground">Not defined</p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {voice?.voiceAttributes && Array.isArray(voice.voiceAttributes) && (
                                        <div>
                                          <p className="text-xs font-medium text-muted-foreground mb-2">Voice Attributes</p>
                                          <div className="flex flex-wrap gap-1">
                                            {voice.voiceAttributes.map((attr: any, i: number) => (
                                              <Badge key={i} variant="secondary" className="text-[10px]">
                                                {typeof attr === 'string' ? attr : attr?.name || 'Attribute'}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                      
                      {contentDNAAnalyses.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No brand layers configured yet</p>
                          <p className="text-sm mt-1">Upload content samples to generate brand DNA</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Activity Tab */}
            <TabsContent value="emails" className="mt-4 space-y-4">
              {/* Email Analytics Summary */}
              {emailNudges.length > 0 && (() => {
                const totalSent = emailNudges.length;
                const delivered = emailNudges.filter(n => n.delivered_at).length;
                const opened = emailNudges.filter(n => n.opened_at).length;
                const clicked = emailNudges.filter(n => n.clicked_at).length;
                const bounced = emailNudges.filter(n => n.bounced_at).length;
                
                const deliveryRate = totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(1) : '0';
                const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : '0';
                const clickRate = opened > 0 ? ((clicked / opened) * 100).toFixed(1) : '0';
                const bounceRate = totalSent > 0 ? ((bounced / totalSent) * 100).toFixed(1) : '0';
                
                return (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Send className="w-4 h-4 text-blue-500" />
                          <p className="text-xs text-muted-foreground">Total Sent</p>
                        </div>
                        <p className="text-2xl font-bold">{totalSent}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <p className="text-xs text-muted-foreground">Delivery Rate</p>
                        </div>
                        <p className="text-2xl font-bold">{deliveryRate}%</p>
                        <p className="text-[10px] text-muted-foreground">{delivered} of {totalSent}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className="w-4 h-4 text-purple-500" />
                          <p className="text-xs text-muted-foreground">Open Rate</p>
                        </div>
                        <p className="text-2xl font-bold">{openRate}%</p>
                        <p className="text-[10px] text-muted-foreground">{opened} of {delivered} delivered</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <ExternalLink className="w-4 h-4 text-indigo-500" />
                          <p className="text-xs text-muted-foreground">Click Rate</p>
                        </div>
                        <p className="text-2xl font-bold">{clickRate}%</p>
                        <p className="text-[10px] text-muted-foreground">{clicked} of {opened} opened</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <p className="text-xs text-muted-foreground">Bounce Rate</p>
                        </div>
                        <p className="text-2xl font-bold">{bounceRate}%</p>
                        <p className="text-[10px] text-muted-foreground">{bounced} bounced</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Email Activity Log
                      </CardTitle>
                      <CardDescription>
                        {emailNudges.length} system emails sent
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button onClick={() => setSendEmailOpen(true)} size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                      <div className="w-64">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search emails..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {emailNudges.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No emails sent yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Recipient</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Institution</TableHead>
                            <TableHead>Sent</TableHead>
                            <TableHead>Delivery</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredNudges.slice(0, 50).map(nudge => (
                            <TableRow key={nudge.id}>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {nudge.email_type || nudge.nudge_type.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{nudge.recipient_name || nudge.user_name}</p>
                                  <p className="text-[10px] text-muted-foreground">{nudge.recipient_email || nudge.user_email}</p>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                <p className="text-sm truncate" title={nudge.subject || '-'}>
                                  {nudge.subject || '-'}
                                </p>
                              </TableCell>
                              <TableCell className="text-sm">{nudge.institution_name}</TableCell>
                              <TableCell className="text-sm">{formatTime(nudge.sent_at)}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {/* Sent indicator */}
                                  <Badge className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5">
                                    <Send className="w-2.5 h-2.5 mr-0.5" />
                                    Sent
                                  </Badge>
                                  {/* Delivered */}
                                  {nudge.delivered_at && (
                                    <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5" title={`Delivered: ${new Date(nudge.delivered_at).toLocaleString()}`}>
                                      <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                                      Delivered
                                    </Badge>
                                  )}
                                  {/* Opened */}
                                  {nudge.opened_at && (
                                    <Badge className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5" title={`Opened: ${new Date(nudge.opened_at).toLocaleString()}`}>
                                      <Eye className="w-2.5 h-2.5 mr-0.5" />
                                      Opened
                                    </Badge>
                                  )}
                                  {/* Clicked */}
                                  {nudge.clicked_at && (
                                    <Badge className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5" title={`Clicked: ${new Date(nudge.clicked_at).toLocaleString()}`}>
                                      <ExternalLink className="w-2.5 h-2.5 mr-0.5" />
                                      Clicked
                                    </Badge>
                                  )}
                                  {/* Bounced */}
                                  {nudge.bounced_at && (
                                    <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5" title={`Bounced: ${new Date(nudge.bounced_at).toLocaleString()}`}>
                                      <XCircle className="w-2.5 h-2.5 mr-0.5" />
                                      Bounced
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {filteredNudges.length > 50 && (
                        <p className="text-sm text-muted-foreground text-center mt-4">
                          Showing 50 of {filteredNudges.length} emails
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Templates Tab */}
            <TabsContent value="templates" className="mt-4 space-y-4">
              <EmailTemplatesTab 
                tenants={tenants.map(t => ({ id: t.id, institution_name: t.institution_name }))}
                users={users}
                onEmailSent={fetchData}
              />
            </TabsContent>

            {/* Sharing & Collaboration Tab */}
            <TabsContent value="sharing" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        Sharing & Collaboration Tracking
                      </CardTitle>
                      <CardDescription>
                        {referrals.length} "Share with a colleague" invitations
                      </CardDescription>
                    </div>
                    <div className="w-64">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search referrals..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {referrals.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Share2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No referrals yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sender</TableHead>
                            <TableHead>Sender Institution</TableHead>
                            <TableHead>Recipient</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sent</TableHead>
                            <TableHead>Joined</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredReferrals.slice(0, 50).map(ref => (
                            <TableRow key={ref.id}>
                              <TableCell className="font-medium text-sm">{ref.referrer_name}</TableCell>
                              <TableCell className="text-sm">{ref.referrer_institution}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{ref.referee_name || 'Unknown'}</p>
                                  <p className="text-[10px] text-muted-foreground">{ref.referee_email}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {ref.referral_type.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    ref.status === 'joined' 
                                      ? 'bg-green-100 text-green-700' 
                                      : ref.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }
                                >
                                  {ref.status === 'joined' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                  {ref.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                  {ref.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{formatTime(ref.created_at)}</TableCell>
                              <TableCell className="text-sm">
                                {ref.joined_at ? formatTime(ref.joined_at) : '—'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {filteredReferrals.length > 50 && (
                        <p className="text-sm text-muted-foreground text-center mt-4">
                          Showing 50 of {filteredReferrals.length} referrals
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sharing Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{referrals.filter(r => r.status === 'joined').length}</p>
                        <p className="text-sm text-muted-foreground">Joined from referral</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-100">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{referrals.filter(r => r.status === 'pending').length}</p>
                        <p className="text-sm text-muted-foreground">Pending invites</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {referrals.length > 0 
                            ? Math.round((referrals.filter(r => r.status === 'joined').length / referrals.length) * 100)
                            : 0}%
                        </p>
                        <p className="text-sm text-muted-foreground">Conversion rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Libraries Tab */}
            <TabsContent value="libraries" className="mt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Library className="w-5 h-5" />
                      Shared Library
                    </CardTitle>
                    <CardDescription>
                      {tenants.reduce((sum, t) => sum + t.sharedTemplatesCount, 0)} templates across all institutions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tenants.filter(t => t.sharedTemplatesCount > 0).map(inst => (
                        <div key={inst.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{inst.institution_name}</span>
                          </div>
                          <Badge variant="secondary">{inst.sharedTemplatesCount}</Badge>
                        </div>
                      ))}
                      {tenants.filter(t => t.sharedTemplatesCount > 0).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No shared templates</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5" />
                      Personal Libraries
                    </CardTitle>
                    <CardDescription>
                      {tenants.reduce((sum, t) => sum + t.personalMessagesCount, 0)} messages across all users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tenants.filter(t => t.personalMessagesCount > 0).map(inst => (
                        <div key={inst.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{inst.institution_name}</span>
                          </div>
                          <Badge variant="secondary">{inst.personalMessagesCount}</Badge>
                        </div>
                      ))}
                      {tenants.filter(t => t.personalMessagesCount > 0).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No personal messages</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Brand Radar Tab */}
            <TabsContent value="radar">
              <BrandRadarTab />
            </TabsContent>

            {/* Admin Tab */}
            <TabsContent value="admin" className="mt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Destructive actions that cannot be undone
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                      onClick={() => setClearPersonalOpen(true)}
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Purge Personal Library ({messages.length} items)
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                      onClick={() => setClearSharedOpen(true)}
                    >
                      <Library className="w-4 h-4 mr-2" />
                      Purge Shared Library ({templates.length} items)
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        resetToDefaults();
                        toast({ title: "Shared Library reset to defaults" });
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset Shared Library to Defaults
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
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
                      <Link to="/admin/content-dna">
                        <Dna className="w-4 h-4 mr-2" />
                        Content DNA Center
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                      <Link to="/admin/qa">
                        <Shield className="w-4 h-4 mr-2" />
                        Security & QA
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                      <Link to="/admin/seed">
                        <Database className="w-4 h-4 mr-2" />
                        Seed Data
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
            <AlertDialogAction onClick={handleClearPersonalLibrary} className="bg-destructive text-destructive-foreground">
              Purge All
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
            <AlertDialogAction onClick={handleClearSharedLibrary} className="bg-destructive text-destructive-foreground">
              Purge All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Email Dialog */}
      <SendEmailDialog
        open={sendEmailOpen}
        onOpenChange={setSendEmailOpen}
        tenants={tenants.map(t => ({ id: t.id, institution_name: t.institution_name }))}
        users={users}
        onEmailSent={fetchData}
      />
    </div>
  );
};

export default AdminPanel;
