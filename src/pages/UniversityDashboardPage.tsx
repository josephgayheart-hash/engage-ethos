import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WaveBackground } from '@/components/WaveBackground';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  ArrowLeft, 
  LayoutDashboard,
  Users,
  Dna,
  Activity,
  Settings
} from 'lucide-react';
import { UniversityKPICards } from '@/components/university/UniversityKPICards';
import { UniversityUsersPanel } from '@/components/university/UniversityUsersPanel';
import { UniversityDNAHealthPanel } from '@/components/university/UniversityDNAHealthPanel';
import { UniversityFeatureAdoptionPanel } from '@/components/university/UniversityFeatureAdoptionPanel';
import { UniversityActivityPanel } from '@/components/university/UniversityActivityPanel';

export default function UniversityDashboardPage() {
  const { tenant, isAdmin, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Use the analytics hook scoped to current tenant
  const { data: analytics, isLoading, refetch } = useAdminAnalytics(tenant?.id);

  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Refresh';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  // Require admin access
  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to view this page.</p>
        </div>
      </div>
    );
  }

  // Get tenant-specific health data
  const tenantHealth = analytics?.tenantHealth?.find(t => t.tenant_id === tenant?.id);

  return (
    <div className="bg-background">
      <WaveBackground />
      
      <main className="container mx-auto px-4 py-6 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Institution Dashboard</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              {tenant?.institution_name || 'Institution'} Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              User activity, Content DNA health, and feature adoption
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {formatTime(lastRefresh)}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/university-settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <UniversityKPICards 
          analytics={analytics} 
          tenantHealth={tenantHealth}
          isLoading={isLoading} 
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="overview" className="gap-1">
              <LayoutDashboard className="w-3 h-3 hidden md:block" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1">
              <Users className="w-3 h-3 hidden md:block" />
              Users
            </TabsTrigger>
            <TabsTrigger value="dna" className="gap-1">
              <Dna className="w-3 h-3 hidden md:block" />
              Content DNA
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-1">
              <Activity className="w-3 h-3 hidden md:block" />
              Features
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1">
              <Activity className="w-3 h-3 hidden md:block" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <UniversityDNAHealthPanel 
                analytics={analytics}
                tenantHealth={tenantHealth}
                isLoading={isLoading}
              />
              <UniversityFeatureAdoptionPanel 
                analytics={analytics}
                tenantHealth={tenantHealth}
                isLoading={isLoading}
              />
            </div>
            <UniversityActivityPanel 
              analytics={analytics}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-4">
            <UniversityUsersPanel 
              tenantHealth={tenantHealth}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* DNA Tab */}
          <TabsContent value="dna" className="mt-4">
            <UniversityDNAHealthPanel 
              analytics={analytics}
              tenantHealth={tenantHealth}
              isLoading={isLoading}
              expanded
            />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-4">
            <UniversityFeatureAdoptionPanel 
              analytics={analytics}
              tenantHealth={tenantHealth}
              isLoading={isLoading}
              expanded
            />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-4">
            <UniversityActivityPanel 
              analytics={analytics}
              isLoading={isLoading}
              expanded
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
