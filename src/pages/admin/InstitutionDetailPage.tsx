import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Building2,
  Users,
  Library,
  FileText,
  Settings,
  Mic,
  Upload,
  Activity,
  Loader2,
  ChevronRight,
  Eye,
  GraduationCap,
  RefreshCw,
  Mail,
  MessageSquare,
  Phone,
  Globe,
} from 'lucide-react';

interface TenantInfo {
  id: string;
  institution_name: string;
  status: string;
  primary_color: string | null;
  accent_color: string | null;
  logo_url: string | null;
  created_at: string;
  tenant_type: 'university' | 'agency' | null;
  client_limit: number | null;
  agency_website: string | null;
  agency_contact_email: string | null;
}

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
  department: string | null;
}

interface SharedTemplate {
  id: string;
  title: string;
  content: string;
  status: string;
  playbook: string | null;
  created_at: string;
  created_by_user_id: string | null;
  creator_name?: string;
}

interface PersonalMessage {
  id: string;
  title: string;
  content: string;
  channel: string;
  audience: string | null;
  created_at: string;
  user_id: string;
  user_name?: string;
}

interface InstitutionalProfile {
  id: string;
  name: string;
  config: Record<string, any> | null;
  created_at: string;
  client_status: string | null;
}

// Comprehensive list of all institutional config fields
const allConfigFields = [
  // Branding & Identity
  'institutionName', 'institutionAbbreviation', 'mascot', 'slogans',
  // Digital Platforms & Systems
  'portalName', 'lmsName', 'emailDomain', 'advisingSystemName', 'schedulingSystemName',
  'degreeAuditSystem', 'financialAidPortal', 'registrationSystem',
  // Locations & Facilities
  'buildingNames', 'programNames', 'supportCenters', 'libraryName', 'tutorCenter',
  'writingCenter', 'mathCenter', 'careerCenter', 'counselingCenter', 'healthCenter',
  'fitnessCenter', 'diningHall',
  // Campus Geography
  'campusTerms', 'defaultMeetingLocation', 'virtualMeetingPlatform',
  // Offices & Departments
  'registrarOffice', 'financialAidOffice', 'admissionsOffice', 'bursarOffice',
  'itHelpDesk', 'housingOffice', 'studentAffairsOffice', 'internationalOffice',
  'disabilityServices', 'veteransServices',
  // People & Roles
  'leaderNames', 'advisorTitles', 'staffTitles', 'defaultAdvisorName',
  // Naming Conventions
  'studentAddressing', 'staffAddressing', 'pronounPreference', 'studentIdTerm',
  // Call to Actions
  'primaryCTAs', 'secondaryCTAs', 'urgentCTAs',
  // Contact & Resources
  'primaryContactEmail', 'primaryContactPhone', 'advisingEmail', 'generalHelpEmail',
  'emergencyPhone', 'textAlertNumber', 'websiteLinks', 'socialMediaHandles', 'appointmentLink',
  // Academic Terms
  'academicTerms', 'gradingTerms', 'enrollmentTerms', 'currentTermName', 'nextTermName',
  // Time & Scheduling
  'officeHoursFormat', 'timeZone',
  // Signature Blocks
  'signatureTemplates',
  // Tone & Style
  'toneRules', 'wordsToAvoid', 'preferredPhrases',
  // Deadlines & Dates
  'importantDates',
  // Brand Voice
  'brandVoiceSamples', 'voiceAnalysis'
];

export default function InstitutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sharedTemplates, setSharedTemplates] = useState<SharedTemplate[]>([]);
  const [personalMessages, setPersonalMessages] = useState<PersonalMessage[]>([]);
  const [institutionalProfiles, setInstitutionalProfiles] = useState<InstitutionalProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Fetch tenant info
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (tenantError) throw tenantError;
      if (!tenantData) {
        toast({ title: 'Institution not found', variant: 'destructive' });
        navigate('/admin/panel');
        return;
      }
      setTenant(tenantData);

      // Fetch users for this tenant
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', id)
        .order('last_login_at', { ascending: false, nullsFirst: false });
      setUsers(usersData || []);

      // Fetch shared templates
      const { data: templatesData } = await supabase
        .from('shared_templates')
        .select('*')
        .eq('tenant_id', id)
        .order('created_at', { ascending: false });
      
      // Enrich with creator names
      const enrichedTemplates = (templatesData || []).map(t => {
        const creator = usersData?.find(u => u.id === t.created_by_user_id);
        return {
          ...t,
          creator_name: creator ? `${creator.first_name} ${creator.last_name}` : 'Unknown'
        };
      });
      setSharedTemplates(enrichedTemplates);

      // Fetch personal messages
      const { data: messagesData } = await supabase
        .from('personal_messages')
        .select('*')
        .eq('tenant_id', id)
        .order('created_at', { ascending: false });
      
      // Enrich with user names
      const enrichedMessages = (messagesData || []).map(m => {
        const user = usersData?.find(u => u.id === m.user_id);
        return {
          ...m,
          user_name: user ? `${user.first_name} ${user.last_name}` : 'Unknown'
        };
      });
      setPersonalMessages(enrichedMessages);

      // Fetch institutional profiles
      const { data: profilesData } = await supabase
        .from('institutional_profiles')
        .select('*')
        .eq('tenant_id', id)
        .order('created_at', { ascending: false });
      
      setInstitutionalProfiles((profilesData || []).map(p => ({
        ...p,
        config: p.config as Record<string, any> | null
      })));

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error loading institution data', variant: 'destructive' });
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

  const calculateProfileCompletion = (config: Record<string, any> | null): number => {
    if (!config || typeof config !== 'object') return 0;
    const filledCount = allConfigFields.filter(field => {
      const value = config[field];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
      return value && value.toString().trim() !== '';
    }).length;
    return Math.round((filledCount / allConfigFields.length) * 100);
  };

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
            <span>/</span>
            <span className="text-foreground">{tenant?.institution_name || 'Institution'}</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : tenant ? (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <GraduationCap className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                      {tenant.institution_name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                        {tenant.status}
                      </Badge>
                      {tenant.tenant_type && (
                        <Badge variant="outline" className={tenant.tenant_type === 'agency' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}>
                          {tenant.tenant_type === 'agency' ? 'Agency' : 'University'}
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        Created {formatDate(tenant.created_at)}
                      </span>
                    </div>
                    {/* Agency-specific info */}
                    {tenant.tenant_type === 'agency' && (
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {tenant.agency_website && (
                          <a href={tenant.agency_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground">
                            <Globe className="w-3 h-3" />
                            Website
                          </a>
                        )}
                        {tenant.agency_contact_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {tenant.agency_contact_email}
                          </span>
                        )}
                        {tenant.client_limit && (
                          <span>Client limit: {tenant.client_limit}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={fetchData} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                      <div className="p-1.5 rounded bg-purple-500/10">
                        <Library className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{sharedTemplates.length}</p>
                        <p className="text-[10px] text-muted-foreground">Shared Templates</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-blue-500/10">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{personalMessages.length}</p>
                        <p className="text-[10px] text-muted-foreground">Personal Msgs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-indigo-500/10">
                        <Settings className="w-4 h-4 text-indigo-600" />
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
                      <div className="p-1.5 rounded bg-green-500/10">
                        <Activity className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{users.filter(u => u.status === 'active').length}</p>
                        <p className="text-[10px] text-muted-foreground">Active Users</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="shared">Shared Library</TabsTrigger>
                  <TabsTrigger value="personal">Personal Messages</TabsTrigger>
                  <TabsTrigger value="profiles">Profiles</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Recent Users */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Recent Users
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {users.slice(0, 5).map(user => (
                            <Link 
                              key={user.id} 
                              to={`/admin/user/${user.id}`}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                  {user.first_name[0]}{user.last_name[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                                  <p className="text-[10px] text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{formatDate(user.last_login_at)}</span>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </Link>
                          ))}
                          {users.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Recent Templates
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {sharedTemplates.slice(0, 5).map(template => (
                            <div key={template.id} className="p-2 rounded-lg border">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium truncate">{template.title}</p>
                                <Badge variant="outline" className="text-[10px]">{template.status}</Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                by {template.creator_name} • {formatDate(template.created_at)}
                              </p>
                            </div>
                          ))}
                          {sharedTemplates.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No templates found</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">Users</CardTitle>
                      <CardDescription>{users.length} users in this institution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Messages</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map(user => {
                            const userMessages = personalMessages.filter(m => m.user_id === user.id);
                            return (
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
                                <TableCell className="text-sm">{user.department || '-'}</TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={user.status === 'active' ? 'default' : 'secondary'}
                                    className={user.status === 'active' ? 'bg-green-500' : user.status === 'locked' ? 'bg-red-500' : ''}
                                  >
                                    {user.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{userMessages.length}</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatDate(user.last_login_at)}
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link to={`/admin/user/${user.id}`}>
                                      <Eye className="w-4 h-4" />
                                    </Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Shared Library Tab */}
                <TabsContent value="shared" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">Shared Library</CardTitle>
                      <CardDescription>{sharedTemplates.length} templates in shared library</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-3">
                          {sharedTemplates.map(template => (
                            <Card key={template.id} className="border">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-medium">{template.title}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      by {template.creator_name} • {formatDate(template.created_at)}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    {template.playbook && (
                                      <Badge variant="outline" className="text-xs">{template.playbook}</Badge>
                                    )}
                                    <Badge 
                                      variant={template.status === 'published' ? 'default' : 'secondary'}
                                      className={template.status === 'published' ? 'bg-green-500' : ''}
                                    >
                                      {template.status}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{template.content}</p>
                              </CardContent>
                            </Card>
                          ))}
                          {sharedTemplates.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Library className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No shared templates</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Personal Messages Tab */}
                <TabsContent value="personal" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">Personal Messages</CardTitle>
                      <CardDescription>{personalMessages.length} messages across all users</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-3">
                          {personalMessages.map(message => (
                            <Card key={message.id} className="border">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-medium">{message.title}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      by {message.user_name} • {formatDate(message.created_at)}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      {getChannelIcon(message.channel)}
                                      {message.channel}
                                    </Badge>
                                    {message.audience && (
                                      <Badge variant="secondary" className="text-xs">{message.audience}</Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
                              </CardContent>
                            </Card>
                          ))}
                          {personalMessages.length === 0 && (
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

                {/* Profiles Tab */}
                <TabsContent value="profiles" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">Institutional Profiles</CardTitle>
                      <CardDescription>{institutionalProfiles.length} configuration profiles</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {institutionalProfiles.map(profile => {
                          const completionPct = calculateProfileCompletion(profile.config);
                          const config = profile.config || {};
                          const filledCount = allConfigFields.filter(field => {
                            const value = config[field];
                            if (Array.isArray(value)) return value.length > 0;
                            if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
                            return value && value.toString().trim() !== '';
                          }).length;
                          const hasDNA = config.voiceAnalysis || (config.brandVoiceSamples && config.brandVoiceSamples.length > 0);
                          
                          return (
                            <Card key={profile.id} className="border">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-medium">{profile.name}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      Created {formatDate(profile.created_at)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {hasDNA && (
                                      <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700">
                                        <Mic className="w-3 h-3 mr-1" />
                                        DNA
                                      </Badge>
                                    )}
                                    <Badge 
                                      variant="outline"
                                      className={`text-xs ${completionPct >= 70 ? 'bg-green-50 text-green-700' : completionPct >= 40 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}
                                    >
                                      {filledCount}/{allConfigFields.length} ({completionPct}%)
                                    </Badge>
                                  </div>
                                </div>
                                <Progress value={completionPct} className="h-1.5 mb-3" />
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {config.institutionName && <Badge variant="secondary" className="text-[10px]">Name</Badge>}
                                  {config.mascot && <Badge variant="secondary" className="text-[10px]">Mascot</Badge>}
                                  {config.primaryCTAs?.length > 0 && <Badge variant="secondary" className="text-[10px]">CTAs</Badge>}
                                  {config.leaderNames?.length > 0 && <Badge variant="secondary" className="text-[10px]">Leaders</Badge>}
                                  {config.portalName && <Badge variant="secondary" className="text-[10px]">Portal</Badge>}
                                  {config.lmsName && <Badge variant="secondary" className="text-[10px]">LMS</Badge>}
                                  {config.toneRules?.length > 0 && <Badge variant="secondary" className="text-[10px]">Tone</Badge>}
                                  {config.supportCenters?.length > 0 && <Badge variant="secondary" className="text-[10px]">Centers</Badge>}
                                  {config.primaryContactEmail && <Badge variant="secondary" className="text-[10px]">Contact</Badge>}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {config.institutionName && (
                                    <div><span className="text-muted-foreground">Name:</span> {config.institutionName}</div>
                                  )}
                                  {config.mascot && (
                                    <div><span className="text-muted-foreground">Mascot:</span> {config.mascot}</div>
                                  )}
                                  {config.leaderNames?.length > 0 && (
                                    <div><span className="text-muted-foreground">Leader:</span> {config.leaderNames[0]}</div>
                                  )}
                                  {config.portalName && (
                                    <div><span className="text-muted-foreground">Portal:</span> {config.portalName}</div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                        {institutionalProfiles.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No institutional profiles</p>
                          </div>
                        )}
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
