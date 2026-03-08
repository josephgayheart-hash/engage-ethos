import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Users, 
  Shield, 
  UserPlus, 
  ArrowLeft,
  LayoutDashboard,
  BarChart3,
  Building2,
  Mail,
  FileText,
  Radar,
  Settings
} from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import {
  AnalyticsKPICards,
  UsageTrendChart,
  EngagementFunnelCard,
  FeatureAdoptionCard,
  TenantHealthTable,
  AlertsInsightsCard,
  ToolUsageBreakdownCard
} from './analytics';

interface SuperAdminDashboardProps {
  pendingRequestsCount: number;
  onRefresh: () => void;
  lastRefresh: Date | null;
  // Existing tabs content components
  emailActivityContent: React.ReactNode;
  emailTemplatesContent: React.ReactNode;
  radarContent: React.ReactNode;
  adminLinksContent: React.ReactNode;
}

export function SuperAdminDashboard({
  pendingRequestsCount,
  onRefresh,
  lastRefresh,
  emailActivityContent,
  emailTemplatesContent,
  radarContent,
  adminLinksContent
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('command-center');
  const { data: analytics, isLoading, refetch } = useAdminAnalytics();

  const formatTime = (date: Date | null) => {
    if (!date) return 'Refresh';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  const handleRefresh = () => {
    refetch();
    onRefresh();
  };

  return (
    <div className="space-y-6">
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
            CampusVoice.ai Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform governance, analytics & institutional health
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
            <Link to="/admin/qa">
              <Bug className="w-4 h-4 mr-2" />
              QA
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/nda-links">
              <FileSignature className="w-4 h-4 mr-2" />
              NDA Links
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/qa">
              <Shield className="w-4 h-4 mr-2" />
              Security
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full">
          <TabsTrigger value="command-center" className="gap-1">
            <LayoutDashboard className="w-3 h-3 hidden md:block" />
            Command Center
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1">
            <BarChart3 className="w-3 h-3 hidden md:block" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="institutions" className="gap-1">
            <Building2 className="w-3 h-3 hidden md:block" />
            Institutions
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-1">
            <Mail className="w-3 h-3 hidden md:block" />
            Emails
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1">
            <FileText className="w-3 h-3 hidden md:block" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="radar" className="gap-1">
            <Radar className="w-3 h-3 hidden md:block" />
            Radar
          </TabsTrigger>
          <TabsTrigger value="admin" className="gap-1">
            <Settings className="w-3 h-3 hidden md:block" />
            Admin
          </TabsTrigger>
        </TabsList>

        {/* Command Center Tab - Overview Dashboard */}
        <TabsContent value="command-center" className="space-y-6 mt-4">
          {/* KPI Cards */}
          <AnalyticsKPICards data={analytics!} isLoading={isLoading} />

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Trends */}
            <div className="lg:col-span-2 space-y-6">
              <UsageTrendChart data={analytics?.dailyUsage || []} isLoading={isLoading} />
              
              <div className="grid md:grid-cols-2 gap-4">
                <FeatureAdoptionCard data={analytics?.featureAdoption || []} isLoading={isLoading} />
                <ToolUsageBreakdownCard data={analytics?.toolUsage || []} isLoading={isLoading} />
              </div>
            </div>

            {/* Right Column - Health & Alerts */}
            <div className="space-y-6">
              <AlertsInsightsCard 
                atRiskTenants={analytics?.atRiskTenants || []}
                noDNATenants={analytics?.noDNATenants || []}
                inactiveUsers={analytics?.inactiveUsers || 0}
                totalUsers={analytics?.totalUsers || 0}
                isLoading={isLoading}
              />
              <EngagementFunnelCard data={analytics?.engagementFunnel!} isLoading={isLoading} />
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab - Deep Dive */}
        <TabsContent value="analytics" className="space-y-6 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <UsageTrendChart data={analytics?.dailyUsage || []} isLoading={isLoading} />
            <EngagementFunnelCard data={analytics?.engagementFunnel!} isLoading={isLoading} />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <FeatureAdoptionCard data={analytics?.featureAdoption || []} isLoading={isLoading} />
            <ToolUsageBreakdownCard data={analytics?.toolUsage || []} isLoading={isLoading} />
          </div>
        </TabsContent>

        {/* Institutions Tab - Health Table */}
        <TabsContent value="institutions" className="space-y-6 mt-4">
          <AnalyticsKPICards data={analytics!} isLoading={isLoading} compact />
          <TenantHealthTable 
            data={analytics?.tenantHealth || []} 
            isLoading={isLoading} 
            showAll 
          />
        </TabsContent>

        {/* Email Activity Tab */}
        <TabsContent value="emails" className="space-y-4 mt-4">
          {emailActivityContent}
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="templates" className="space-y-4 mt-4">
          {emailTemplatesContent}
        </TabsContent>

        {/* Radar Tab */}
        <TabsContent value="radar" className="space-y-4 mt-4">
          {radarContent}
        </TabsContent>

        {/* Admin Links Tab */}
        <TabsContent value="admin" className="space-y-4 mt-4">
          {adminLinksContent}
        </TabsContent>
      </Tabs>
    </div>
  );
}
