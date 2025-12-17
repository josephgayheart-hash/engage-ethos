import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
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
  Upload
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
  
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [clearPersonalOpen, setClearPersonalOpen] = useState(false);
  const [clearSharedOpen, setClearSharedOpen] = useState(false);

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

  // Tool usage stats (mock data for now - would come from analytics)
  const toolUsageStats = [
    { name: 'Message Builder', icon: MessageSquare, usage: 156, trend: '+12%' },
    { name: 'Message Evaluator', icon: FileText, usage: 134, trend: '+8%' },
    { name: 'Strategy Mapper', icon: Compass, usage: 89, trend: '+23%' },
    { name: 'Call Script Generator', icon: Phone, usage: 67, trend: '+5%' },
    { name: 'AI Playground', icon: Sparkles, usage: 45, trend: '+34%' },
    { name: 'BYOC', icon: Upload, usage: 23, trend: 'New' },
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
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/settings" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Institutional Settings
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{recentLogins}</p>
                    <p className="text-xs text-muted-foreground">Logins (7 days)</p>
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
                    <p className="text-xs text-muted-foreground">Shared Templates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">User Activity</TabsTrigger>
              <TabsTrigger value="usage">Tool Usage</TabsTrigger>
              <TabsTrigger value="admin">Admin Functions</TabsTrigger>
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

                {/* Library Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Library Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Library className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Shared Library</p>
                          <p className="text-xs text-muted-foreground">Organization templates</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{templates.length}</p>
                        <p className="text-xs text-muted-foreground">templates</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Personal Libraries</p>
                          <p className="text-xs text-muted-foreground">User-saved messages</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{messages.length}</p>
                        <p className="text-xs text-muted-foreground">messages (yours)</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to="/shared-library">View Shared Library →</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* User Activity Tab */}
            <TabsContent value="users" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-serif">User Activity</CardTitle>
                    <CardDescription>Monitor user engagement and last login times</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to="/admin/users">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
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

            {/* Tool Usage Tab */}
            <TabsContent value="usage" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Tool Usage Statistics</CardTitle>
                  <CardDescription>Most used tools across your institution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {toolUsageStats.map((tool, index) => (
                      <div key={tool.name} className="flex items-center gap-4">
                        <div className="w-8 text-center text-muted-foreground font-medium">
                          #{index + 1}
                        </div>
                        <div className="p-2 rounded-lg bg-muted">
                          <tool.icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{tool.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{tool.usage}</span>
                              <Badge variant="outline" className="text-xs">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {tool.trend}
                              </Badge>
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(tool.usage / toolUsageStats[0].usage) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-6 text-center">
                    Usage data is illustrative. Full analytics coming soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admin Functions Tab */}
            <TabsContent value="admin" className="mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Library Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Library className="w-5 h-5" />
                      Library Management
                    </CardTitle>
                    <CardDescription>
                      Manage shared and personal library content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                            Clear
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
                          Clear
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
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
                        Institutional Settings
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
      <Dialog open={clearPersonalOpen} onOpenChange={setClearPersonalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Clear Personal Library
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all {messages.length} messages from your personal library. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearPersonalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleClearPersonalLibrary}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Library
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Shared Library Dialog */}
      <Dialog open={clearSharedOpen} onOpenChange={setClearSharedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Clear Shared Library
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all {templates.length} templates from the shared library. All users will lose access to these templates. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearSharedOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleClearSharedLibrary}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Library
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
