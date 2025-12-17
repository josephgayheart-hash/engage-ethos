import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Database
} from "lucide-react";

interface UserSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const { tenant } = useAuth();
  const { templates, clearAllTemplates, resetToDefaults } = useSharedLibrary();
  const { messages, clearAllMessages } = useMessageLibrary();
  const { profiles } = useInstitutionalProfiles();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [clearPersonalOpen, setClearPersonalOpen] = useState(false);
  const [clearSharedOpen, setClearSharedOpen] = useState(false);
  const [clearProfilesOpen, setClearProfilesOpen] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, status, last_login_at, created_at')
          .order('last_login_at', { ascending: false, nullsFirst: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

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

  // Calculate stats
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
    { name: 'Message Builder', icon: MessageSquare, usage: 156, trend: '+12%' },
    { name: 'Message Evaluator', icon: FileText, usage: 134, trend: '+8%' },
    { name: 'Strategy Mapper', icon: Compass, usage: 89, trend: '+23%' },
    { name: 'Call Script Generator', icon: Phone, usage: 67, trend: '+5%' },
    { name: 'AI Playground', icon: Sparkles, usage: 45, trend: '+34%' },
    { name: 'BYOC', icon: Upload, usage: 23, trend: 'New' },
  ];

  // AI function stats (mock - would come from edge function logs)
  const aiFunctionStats = [
    { name: 'evaluate-message', calls: 423, success: 418, errors: 5, avgTime: '1.2s' },
    { name: 'generate-message', calls: 312, success: 309, errors: 3, avgTime: '2.1s' },
    { name: 'playground-chat', calls: 156, success: 154, errors: 2, avgTime: '1.8s' },
    { name: 'analyze-voice', calls: 45, success: 43, errors: 2, avgTime: '3.2s' },
  ];

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
                Manage users, monitor usage, and administer {tenant?.institution_name || 'your institution'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/admin/users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  User Management
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeUsers}</p>
                    <p className="text-xs text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{profiles.length}</p>
                    <p className="text-xs text-muted-foreground">Profiles</p>
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
                    <p className="text-2xl font-bold">{templates.length}</p>
                    <p className="text-xs text-muted-foreground">Shared Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Cpu className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">936</p>
                    <p className="text-xs text-muted-foreground">AI Calls (30d)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="profiles">Profiles</TabsTrigger>
              <TabsTrigger value="ai">AI Functions</TabsTrigger>
              <TabsTrigger value="libraries">Libraries</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Recent User Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent User Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingUsers ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {users.slice(0, 5).map(user => (
                          <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                {user.first_name?.[0]}{user.last_name?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Last login</p>
                              <p className="text-sm">{formatLastLogin(user.last_login_at)}</p>
                            </div>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                          <Link to="/admin/users">View all users →</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tool Usage Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Most Used Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {toolUsageStats.slice(0, 5).map((tool, index) => (
                      <div key={tool.name} className="flex items-center gap-3">
                        <div className="w-6 text-center text-muted-foreground font-medium text-sm">
                          #{index + 1}
                        </div>
                        <div className="p-1.5 rounded bg-muted">
                          <tool.icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{tool.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{tool.usage}</span>
                              <Badge variant="outline" className="text-xs">
                                {tool.trend}
                              </Badge>
                            </div>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(tool.usage / toolUsageStats[0].usage) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-serif">User Management</CardTitle>
                    <CardDescription>Monitor user activity and manage access</CardDescription>
                  </div>
                  <Button asChild>
                    <Link to="/admin/users">
                      <Users className="w-4 h-4 mr-2" />
                      Full User Management
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Member Since</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map(user => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </div>
                                <div>
                                  <p className="font-medium">{user.first_name} {user.last_name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={user.status === 'active' ? 'default' : 'secondary'}
                                className={user.status === 'active' ? 'bg-green-500' : ''}
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={!user.last_login_at ? 'text-muted-foreground' : ''}>
                                {formatLastLogin(user.last_login_at)}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
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

            {/* Profiles Tab */}
            <TabsContent value="profiles" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-serif">Institutional Profiles</CardTitle>
                    <CardDescription>Manage institution voice and configuration profiles</CardDescription>
                  </div>
                  <Button asChild>
                    <Link to="/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Profiles
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {profiles.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No institutional profiles configured yet.</p>
                      <Button variant="outline" className="mt-4" asChild>
                        <Link to="/settings">Create First Profile</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {profiles.map(profile => (
                        <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{profile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {profile.config.institutionName || 'No institution name set'}
                                {profile.config.voiceAnalysis && (
                                  <Badge variant="secondary" className="ml-2 text-[10px]">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Voice Trained
                                  </Badge>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>Updated {new Date(profile.updatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Functions Tab */}
            <TabsContent value="ai" className="mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      AI Function Performance
                    </CardTitle>
                    <CardDescription>Edge function call statistics (30 days)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Function</TableHead>
                          <TableHead className="text-right">Calls</TableHead>
                          <TableHead className="text-right">Success</TableHead>
                          <TableHead className="text-right">Avg Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aiFunctionStats.map(fn => (
                          <TableRow key={fn.name}>
                            <TableCell className="font-mono text-sm">{fn.name}</TableCell>
                            <TableCell className="text-right">{fn.calls}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-green-600">{fn.success}</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="text-red-500">{fn.errors}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">{fn.avgTime}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      AI Health Status
                    </CardTitle>
                    <CardDescription>Current AI service status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium">AI Gateway</span>
                      </div>
                      <Badge className="bg-green-500">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Message Generation</span>
                      </div>
                      <Badge className="bg-green-500">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Voice Analysis</span>
                      </div>
                      <Badge className="bg-green-500">Operational</Badge>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-sm mb-3">Recent Errors</h4>
                      <ScrollArea className="h-32">
                        <div className="space-y-2">
                          <div className="text-xs p-2 bg-muted rounded">
                            <div className="flex items-center gap-2 text-amber-600">
                              <AlertCircle className="w-3 h-3" />
                              <span className="font-medium">Rate limit warning</span>
                              <span className="text-muted-foreground ml-auto">2h ago</span>
                            </div>
                            <p className="text-muted-foreground mt-1">evaluate-message: 429 Too Many Requests</p>
                          </div>
                          <div className="text-xs p-2 bg-muted rounded">
                            <div className="flex items-center gap-2 text-red-500">
                              <XCircle className="w-3 h-3" />
                              <span className="font-medium">Parse error</span>
                              <span className="text-muted-foreground ml-auto">5h ago</span>
                            </div>
                            <p className="text-muted-foreground mt-1">analyze-voice: Invalid JSON response</p>
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Libraries Tab */}
            <TabsContent value="libraries" className="mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Library className="w-5 h-5" />
                      Shared Library
                    </CardTitle>
                    <CardDescription>Organization-wide templates and playbooks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-3xl font-bold">{templates.length}</p>
                        <p className="text-sm text-muted-foreground">Total Templates</p>
                      </div>
                      <Library className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">By Status</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          Published: {templates.filter(t => t.status === 'published').length}
                        </Badge>
                        <Badge variant="outline">
                          Draft: {templates.filter(t => t.status === 'draft').length}
                        </Badge>
                        <Badge variant="outline">
                          Pending: {templates.filter(t => t.status === 'submitted').length}
                        </Badge>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/shared-library">
                        Browse Shared Library
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <FolderOpen className="w-5 h-5" />
                      Personal Libraries
                    </CardTitle>
                    <CardDescription>User-saved messages across the organization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-3xl font-bold">{messages.length}</p>
                        <p className="text-sm text-muted-foreground">Your Messages</p>
                      </div>
                      <FolderOpen className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">By Channel</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          Email: {messages.filter(m => m.channels?.includes('email')).length}
                        </Badge>
                        <Badge variant="outline">
                          SMS: {messages.filter(m => m.channels?.includes('sms')).length}
                        </Badge>
                        <Badge variant="outline">
                          Social: {messages.filter(m => m.channels?.includes('social-media')).length}
                        </Badge>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/personal-library">
                        Browse Personal Library
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Admin Functions Tab */}
            <TabsContent value="admin" className="mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Data Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Data Management
                    </CardTitle>
                    <CardDescription>
                      Purge and reset library content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Shared Library</p>
                          <p className="text-xs text-muted-foreground">{templates.length} templates</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleResetSharedToDefaults}>
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Reset
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setClearSharedOpen(true)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Purge
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Your Personal Library</p>
                          <p className="text-xs text-muted-foreground">{messages.length} messages</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => setClearPersonalOpen(true)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Purge
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Administration
                    </CardTitle>
                    <CardDescription>
                      Quick access to admin functions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/admin/users">
                        <Users className="w-4 h-4 mr-2" />
                        User Management
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/admin/onboarding">
                        <Activity className="w-4 h-4 mr-2" />
                        Access Requests
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/approvals">
                        <FileText className="w-4 h-4 mr-2" />
                        Library Approvals
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
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

      {/* Clear Personal Library Dialog */}
      <AlertDialog open={clearPersonalOpen} onOpenChange={setClearPersonalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Purge Personal Library
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {messages.length} messages from your personal library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearPersonalLibrary} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Trash2 className="w-4 h-4 mr-2" />
              Purge Library
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Shared Library Dialog */}
      <AlertDialog open={clearSharedOpen} onOpenChange={setClearSharedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Purge Shared Library
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {templates.length} templates from the shared library. All users will lose access to these templates. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearSharedLibrary} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Trash2 className="w-4 h-4 mr-2" />
              Purge Library
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;