import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  User,
  Building2,
  FileText,
  Activity,
  Loader2,
  RefreshCw,
  Mail,
  MessageSquare,
  Phone,
  Globe,
  Calendar,
  Clock,
  Briefcase,
  GraduationCap,
  Eye,
  Shield,
  Save,
  Layers,
  Dna,
  FolderTree,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Plus,
} from 'lucide-react';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
  department: string | null;
  title: string | null;
  phone: string | null;
  tenant_id: string;
}

interface TenantInfo {
  id: string;
  institution_name: string;
  tenant_type: 'university' | 'agency';
}

interface PersonalMessage {
  id: string;
  title: string;
  content: string;
  channel: string;
  audience: string | null;
  domain: string | null;
  moment: string | null;
  tone: string | null;
  created_at: string;
  updated_at: string;
}

interface ToolUsageEvent {
  id: string;
  tool_name: string;
  action: string;
  created_at: string;
}

interface InstitutionalProfile {
  id: string;
  name: string;
  profile_type: string;
  parent_profile_id: string | null;
  config: any;
  created_at: string;
  created_by_user_id: string | null;
}

interface ContentDNAAnalysis {
  id: string;
  profile_id: string | null;
  sample_count: number;
  voice_analysis: any;
  brand_platform: any;
  custom_instructions: string | null;
  created_at: string;
  updated_at: string;
  profile_name?: string;
}

type RoleType = 'admin' | 'user' | 'approver' | 'super_admin' | 'agency_admin' | 'agency_user';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin, startImpersonation, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isImpersonating, setIsImpersonating] = useState(false);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [userRoles, setUserRoles] = useState<RoleType[]>([]);
  const [messages, setMessages] = useState<PersonalMessage[]>([]);
  const [toolUsage, setToolUsage] = useState<ToolUsageEvent[]>([]);
  const [institutionalProfiles, setInstitutionalProfiles] = useState<InstitutionalProfile[]>([]);
  const [contentDNAs, setContentDNAs] = useState<ContentDNAAnalysis[]>([]);
  const [allTenants, setAllTenants] = useState<TenantInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingRoles, setIsSavingRoles] = useState(false);
  const [isChangingTenant, setIsChangingTenant] = useState(false);
  const [showTenantChange, setShowTenantChange] = useState(false);
  const [tenantChangeMode, setTenantChangeMode] = useState<'existing' | 'new'>('existing');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantType, setNewTenantType] = useState<'university' | 'agency'>('agency');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (userError) throw userError;
      if (!userData) {
        toast({ title: 'User not found', variant: 'destructive' });
        navigate('/admin/panel');
        return;
      }
      setUser(userData);

      // Fetch tenant info
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id, institution_name, tenant_type')
        .eq('id', userData.tenant_id)
        .maybeSingle();
      setTenant(tenantData as TenantInfo | null);

      // Fetch all tenants for tenant change dropdown (super admin only)
      const { data: allTenantsData } = await supabase
        .from('tenants')
        .select('id, institution_name, tenant_type')
        .order('institution_name');
      setAllTenants((allTenantsData || []) as TenantInfo[]);

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', id);
      setUserRoles((rolesData || []).map(r => r.role as RoleType));

      // Fetch personal messages
      const { data: messagesData } = await supabase
        .from('personal_messages')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });
      setMessages(messagesData || []);

      // Fetch tool usage
      const { data: toolUsageData } = await supabase
        .from('tool_usage_events')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(50);
      setToolUsage(toolUsageData || []);

      // Fetch institutional profiles created by user (within their tenant)
      const { data: profilesData } = await supabase
        .from('institutional_profiles')
        .select('*')
        .eq('tenant_id', userData.tenant_id)
        .eq('created_by_user_id', id)
        .order('created_at', { ascending: false });
      setInstitutionalProfiles(profilesData || []);

      // Fetch content DNA analyses for the tenant (show all to understand what's configured)
      const { data: dnaData } = await supabase
        .from('content_dna_analysis')
        .select('*')
        .eq('tenant_id', userData.tenant_id)
        .order('updated_at', { ascending: false });
      
      // Get profile names for DNA entries
      if (dnaData && dnaData.length > 0) {
        const profileIds = dnaData.filter(d => d.profile_id).map(d => d.profile_id);
        const { data: dnaProfiles } = await supabase
          .from('institutional_profiles')
          .select('id, name')
          .in('id', profileIds);
        
        const profileMap = new Map(dnaProfiles?.map(p => [p.id, p.name]) || []);
        const enrichedDNA = dnaData.map(d => ({
          ...d,
          profile_name: d.profile_id ? profileMap.get(d.profile_id) || 'Unknown Profile' : 'Institution-wide'
        }));
        setContentDNAs(enrichedDNA);
      } else {
        setContentDNAs([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error loading user data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin && id) {
      fetchData();
    }
  }, [isSuperAdmin, id]);

  const formatDate = (date: string | null) => {
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

  const getChannelIcon = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case 'email': return <Mail className="w-3 h-3" />;
      case 'sms': return <MessageSquare className="w-3 h-3" />;
      case 'phone': return <Phone className="w-3 h-3" />;
      default: return <Globe className="w-3 h-3" />;
    }
  };

  const getToolDisplayName = (tool: string) => {
    const names: Record<string, string> = {
      'message_evaluator': 'Message Evaluator',
      'message_builder': 'Message Builder',
      'strategy_mapper': 'Journey Designer',
      'call_script': 'Call Script Generator',
      'playground': 'AI Playground',
      'byoc': 'BYOC',
    };
    return names[tool] || tool;
  };

  const toggleRole = (role: RoleType) => {
    setUserRoles(prev => {
      if (prev.includes(role)) {
        // Don't allow removing the last role - must have at least 'user'
        if (prev.length === 1) return prev;
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSaveRoles = async () => {
    if (!id || !user) return;
    
    // Ensure at least 'user' role is present
    const rolesToSave = userRoles.length > 0 ? userRoles : ['user'];
    
    setIsSavingRoles(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'update_user_roles',
          userId: id,
          roles: rolesToSave,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Roles Updated',
        description: `Permissions for ${user.first_name} ${user.last_name} have been updated.`,
      });
      
      // Refresh to get updated data
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update roles',
        variant: 'destructive',
      });
    } finally {
      setIsSavingRoles(false);
    }
  };

  const handleChangeTenant = async () => {
    if (!id || !user) return;
    
    setIsChangingTenant(true);
    try {
      const payload: any = {
        action: 'change_user_tenant',
        userId: id,
      };

      if (tenantChangeMode === 'new') {
        if (!newTenantName.trim()) {
          toast({ title: 'Please enter a name for the new organization', variant: 'destructive' });
          setIsChangingTenant(false);
          return;
        }
        payload.createNewTenant = true;
        payload.newTenantName = newTenantName.trim();
        payload.newTenantType = newTenantType;
      } else {
        if (!selectedTenantId) {
          toast({ title: 'Please select a target organization', variant: 'destructive' });
          setIsChangingTenant(false);
          return;
        }
        payload.newTenantId = selectedTenantId;
      }

      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: payload,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Organization Changed',
        description: tenantChangeMode === 'new' 
          ? `Created new ${newTenantType} "${newTenantName}" and moved ${user.first_name} ${user.last_name} to it.`
          : `${user.first_name} ${user.last_name} has been moved to a new organization.`,
      });
      
      // Reset form state
      setShowTenantChange(false);
      setTenantChangeMode('existing');
      setSelectedTenantId('');
      setNewTenantName('');
      setNewTenantType('agency');
      
      // Refresh to get updated data
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change organization',
        variant: 'destructive',
      });
    } finally {
      setIsChangingTenant(false);
    }
  };

  // Group messages by channel
  const messagesByChannel = messages.reduce((acc, msg) => {
    const channel = msg.channel || 'Other';
    acc[channel] = (acc[channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group tool usage by tool
  const toolUsageByTool = toolUsage.reduce((acc, event) => {
    acc[event.tool_name] = (acc[event.tool_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/admin/panel" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Super Admin Panel
            </Link>
            {tenant && (
              <>
                <span>/</span>
                <Link to={`/admin/institution/${tenant.id}`} className="hover:text-foreground transition-colors">
                  {tenant.institution_name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground">{user?.first_name} {user?.last_name}</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : user ? (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                    {user.first_name[0]}{user.last_name[0]}
                  </div>
                  <div>
                    <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                      {user.first_name} {user.last_name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}
                        className={user.status === 'active' ? 'bg-green-500' : user.status === 'locked' ? 'bg-red-500' : ''}>
                        {user.status}
                      </Badge>
                      {tenant && (
                        <Link to={`/admin/institution/${tenant.id}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {tenant.institution_name}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {currentUser?.id !== id && (
                    <Button 
                      variant="default" 
                      onClick={async () => {
                        if (!id) return;
                        setIsImpersonating(true);
                        try {
                          await startImpersonation(id);
                        } catch (error) {
                          toast({ title: 'Impersonation failed', variant: 'destructive' });
                        } finally {
                          setIsImpersonating(false);
                        }
                      }}
                      disabled={isImpersonating}
                      className="gap-2"
                    >
                      {isImpersonating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      View as User
                    </Button>
                  )}
                  <Button variant="outline" onClick={fetchData} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-blue-500/10">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{messages.length}</p>
                        <p className="text-[10px] text-muted-foreground">Messages</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-purple-500/10">
                        <Activity className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{toolUsage.length}</p>
                        <p className="text-[10px] text-muted-foreground">Tool Events</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-teal-500/10">
                        <FolderTree className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{institutionalProfiles.length}</p>
                        <p className="text-[10px] text-muted-foreground">Profiles Created</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-pink-500/10">
                        <Dna className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{contentDNAs.length}</p>
                        <p className="text-[10px] text-muted-foreground">Content DNAs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-green-500/10">
                        <Clock className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{formatDate(user.last_login_at)}</p>
                        <p className="text-[10px] text-muted-foreground">Last Login</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-orange-500/10">
                        <Calendar className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{new Date(user.created_at).toLocaleDateString()}</p>
                        <p className="text-[10px] text-muted-foreground">Member Since</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-6 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="profiles">Profiles</TabsTrigger>
                  <TabsTrigger value="dna">Content DNA</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="profile">Account</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Messages by Channel */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Messages by Channel
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(messagesByChannel).map(([channel, count]) => (
                            <div key={channel} className="flex items-center justify-between p-2 rounded bg-muted/30">
                              <div className="flex items-center gap-2">
                                {getChannelIcon(channel)}
                                <span className="text-sm">{channel}</span>
                              </div>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                          {Object.keys(messagesByChannel).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tool Usage */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Tool Usage
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(toolUsageByTool).map(([tool, count]) => (
                            <div key={tool} className="flex items-center justify-between p-2 rounded bg-muted/30">
                              <span className="text-sm">{getToolDisplayName(tool)}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                          {Object.keys(toolUsageByTool).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No tool usage recorded</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Institutional Profiles Tab */}
                <TabsContent value="profiles" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif flex items-center gap-2">
                        <FolderTree className="w-5 h-5" />
                        Institutional Profiles Created
                      </CardTitle>
                      <CardDescription>
                        Profiles (universities, colleges, departments) created by this user
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-3">
                          {institutionalProfiles.map(profile => (
                            <Card key={profile.id} className="border">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded bg-teal-500/10">
                                      <Layers className="w-4 h-4 text-teal-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{profile.name}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs capitalize">
                                          {profile.profile_type}
                                        </Badge>
                                        {profile.parent_profile_id && (
                                          <Badge variant="secondary" className="text-xs">Sub-unit</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(profile.created_at)}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {institutionalProfiles.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No profiles created by this user</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Content DNA Tab */}
                <TabsContent value="dna" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif flex items-center gap-2">
                        <Dna className="w-5 h-5" />
                        Content DNA Configurations
                      </CardTitle>
                      <CardDescription>
                        Voice analysis and brand guidelines for this institution
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-3">
                          {contentDNAs.map(dna => {
                            const hasVoice = dna.voice_analysis && Object.keys(dna.voice_analysis).length > 0;
                            const hasBrand = dna.brand_platform && Object.keys(dna.brand_platform).length > 0;
                            
                            return (
                              <Card key={dna.id} className="border">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 rounded bg-pink-500/10">
                                        <Dna className="w-4 h-4 text-pink-600" />
                                      </div>
                                      <div>
                                        <h4 className="font-medium">{dna.profile_name}</h4>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                          <Badge variant="secondary" className="text-xs">
                                            {dna.sample_count} samples
                                          </Badge>
                                          <div className="flex items-center gap-1 text-xs">
                                            {hasVoice ? (
                                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                                            ) : (
                                              <XCircle className="w-3 h-3 text-muted-foreground" />
                                            )}
                                            <span className={hasVoice ? 'text-green-600' : 'text-muted-foreground'}>
                                              Voice
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 text-xs">
                                            {hasBrand ? (
                                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                                            ) : (
                                              <XCircle className="w-3 h-3 text-muted-foreground" />
                                            )}
                                            <span className={hasBrand ? 'text-green-600' : 'text-muted-foreground'}>
                                              Brand
                                            </span>
                                          </div>
                                          {dna.custom_instructions && (
                                            <Badge variant="outline" className="text-xs">Custom Instructions</Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      Updated {formatDate(dna.updated_at)}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                          {contentDNAs.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Dna className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No Content DNA configured for this institution</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">Personal Messages</CardTitle>
                      <CardDescription>{messages.length} messages in personal library</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-3">
                          {messages.map(message => (
                            <Card key={message.id} className="border">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-medium">{message.title}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(message.created_at)}
                                    </p>
                                  </div>
                                  <div className="flex gap-2 flex-wrap justify-end">
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      {getChannelIcon(message.channel)}
                                      {message.channel}
                                    </Badge>
                                    {message.audience && (
                                      <Badge variant="secondary" className="text-xs">{message.audience}</Badge>
                                    )}
                                    {message.tone && (
                                      <Badge variant="outline" className="text-xs">{message.tone}</Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">{message.content}</p>
                                {(message.domain || message.moment) && (
                                  <div className="mt-2 flex gap-2">
                                    {message.domain && (
                                      <Badge variant="outline" className="text-[10px]">{message.domain}</Badge>
                                    )}
                                    {message.moment && (
                                      <Badge variant="outline" className="text-[10px]">{message.moment}</Badge>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                          {messages.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No personal messages</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">Recent Activity</CardTitle>
                      <CardDescription>Last {toolUsage.length} tool usage events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-2">
                          {toolUsage.map(event => (
                            <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-muted">
                                  <Activity className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{getToolDisplayName(event.tool_name)}</p>
                                  <p className="text-[10px] text-muted-foreground">{event.action}</p>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">{formatDate(event.created_at)}</span>
                            </div>
                          ))}
                          {toolUsage.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No activity recorded</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-4 space-y-4">
                  {/* Roles & Permissions Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Roles & Permissions
                      </CardTitle>
                      <CardDescription>
                        Manage what this user can access and do within the platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="role-user" 
                            checked={userRoles.includes('user')} 
                            onCheckedChange={() => toggleRole('user')}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="role-user" className="text-sm font-medium cursor-pointer">
                              University User
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Can create and evaluate messages, access personal library
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="role-approver" 
                            checked={userRoles.includes('approver')} 
                            onCheckedChange={() => toggleRole('approver')}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="role-approver" className="text-sm font-medium cursor-pointer">
                              Approver
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Can review and approve messages submitted to the shared library
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="role-admin" 
                            checked={userRoles.includes('admin')} 
                            onCheckedChange={() => toggleRole('admin')}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="role-admin" className="text-sm font-medium cursor-pointer">
                              University Admin
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Full admin access to their institution including user management, Content DNA, and branding
                            </p>
                          </div>
                        </div>

                        <Separator className="my-2" />
                        
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Agency Roles</p>

                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="role-agency-user" 
                            checked={userRoles.includes('agency_user')} 
                            onCheckedChange={() => toggleRole('agency_user')}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="role-agency-user" className="text-sm font-medium cursor-pointer">
                              Agency User
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Can create and evaluate messages for agency clients
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="role-agency-admin" 
                            checked={userRoles.includes('agency_admin')} 
                            onCheckedChange={() => toggleRole('agency_admin')}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="role-agency-admin" className="text-sm font-medium cursor-pointer">
                              Agency Admin
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Full access to manage agency clients, their Content DNA, and create messages on their behalf
                            </p>
                          </div>
                        </div>

                        <Separator className="my-2" />

                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="role-super-admin" 
                            checked={userRoles.includes('super_admin')} 
                            onCheckedChange={() => toggleRole('super_admin')}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="role-super-admin" className="text-sm font-medium cursor-pointer">
                              UPlaybook Super Admin
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Full access to all institutions and system-wide settings
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Button 
                          onClick={handleSaveRoles} 
                          disabled={isSavingRoles}
                          className="gap-2"
                        >
                          {isSavingRoles ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save Permissions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tenant Management Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5" />
                        Organization Assignment
                      </CardTitle>
                      <CardDescription>
                        Change which organization this user belongs to
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Current Organization</p>
                          <p className="font-medium flex items-center gap-2">
                            {tenant?.tenant_type === 'agency' ? (
                              <Briefcase className="w-4 h-4 text-purple-500" />
                            ) : (
                              <GraduationCap className="w-4 h-4 text-primary" />
                            )}
                            {tenant?.institution_name || 'Unknown'}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs capitalize">
                            {tenant?.tenant_type || 'university'}
                          </Badge>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowTenantChange(!showTenantChange)}
                        >
                          {showTenantChange ? 'Cancel' : 'Change'}
                        </Button>
                      </div>

                      {showTenantChange && (
                        <div className="space-y-4 p-4 border rounded-lg">
                          <RadioGroup 
                            value={tenantChangeMode} 
                            onValueChange={(v) => setTenantChangeMode(v as 'existing' | 'new')}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="existing" id="existing" />
                              <Label htmlFor="existing">Move to existing organization</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="new" id="new" />
                              <Label htmlFor="new">Create new organization</Label>
                            </div>
                          </RadioGroup>

                          {tenantChangeMode === 'existing' ? (
                            <div className="space-y-2">
                              <Label>Select Organization</Label>
                              <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose an organization..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {allTenants
                                    .filter(t => t.id !== tenant?.id)
                                    .map(t => (
                                      <SelectItem key={t.id} value={t.id}>
                                        <span className="flex items-center gap-2">
                                          {t.tenant_type === 'agency' ? (
                                            <Briefcase className="w-3 h-3 text-purple-500" />
                                          ) : (
                                            <GraduationCap className="w-3 h-3" />
                                          )}
                                          {t.institution_name}
                                          <span className="text-xs text-muted-foreground">
                                            ({t.tenant_type})
                                          </span>
                                        </span>
                                      </SelectItem>
                                    ))
                                  }
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Organization Name</Label>
                                <Input 
                                  placeholder="e.g., McFadden Consulting" 
                                  value={newTenantName}
                                  onChange={(e) => setNewTenantName(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Organization Type</Label>
                                <Select value={newTenantType} onValueChange={(v) => setNewTenantType(v as 'university' | 'agency')}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="agency">
                                      <span className="flex items-center gap-2">
                                        <Briefcase className="w-3 h-3 text-purple-500" />
                                        Agency
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="university">
                                      <span className="flex items-center gap-2">
                                        <GraduationCap className="w-3 h-3" />
                                        University
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          <Button 
                            onClick={handleChangeTenant} 
                            disabled={isChangingTenant}
                            className="w-full gap-2"
                          >
                            {isChangingTenant ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ArrowRightLeft className="w-4 h-4" />
                            )}
                            {tenantChangeMode === 'new' ? 'Create & Move User' : 'Move User'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* User Profile Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">User Profile</CardTitle>
                      <CardDescription>Account details and information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-muted-foreground uppercase">Email</label>
                            <p className="text-sm font-medium flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              {user.email}
                            </p>
                          </div>
                          {user.phone && (
                            <div>
                              <label className="text-xs text-muted-foreground uppercase">Phone</label>
                              <p className="text-sm font-medium flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                {user.phone}
                              </p>
                            </div>
                          )}
                          {user.department && (
                            <div>
                              <label className="text-xs text-muted-foreground uppercase">Department</label>
                              <p className="text-sm font-medium flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                {user.department}
                              </p>
                            </div>
                          )}
                          {user.title && (
                            <div>
                              <label className="text-xs text-muted-foreground uppercase">Title</label>
                              <p className="text-sm font-medium flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-muted-foreground" />
                                {user.title}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-muted-foreground uppercase">Status</label>
                            <p className="text-sm">
                              <Badge 
                                variant={user.status === 'active' ? 'default' : 'secondary'}
                                className={user.status === 'active' ? 'bg-green-500' : user.status === 'locked' ? 'bg-red-500' : ''}
                              >
                                {user.status}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground uppercase">Last Login</label>
                            <p className="text-sm font-medium flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground uppercase">Member Since</label>
                            <p className="text-sm font-medium flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
