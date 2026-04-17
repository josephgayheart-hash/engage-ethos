import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isExcludedUser } from '@/lib/analyticsExclusions';

// Types for analytics data
export interface DailyUsageStats {
  date: string;
  total_events: number;
  unique_users: number;
  unique_tenants: number;
}

export interface ToolUsageBreakdown {
  tool_name: string;
  action: string;
  count: number;
}

export interface TenantHealthScore {
  tenant_id: string;
  institution_name: string;
  tenant_type: string;
  status: string;
  // User metrics
  total_users: number;
  active_users_30d: number;
  user_adoption_rate: number;
  // DNA metrics
  dna_samples: number;
  has_dna_analysis: boolean;
  dna_completeness: number; // 0-100
  // Feature usage
  messages_generated: number;
  journeys_created: number;
  library_items: number;
  evaluations_run: number;
  // Activity
  last_activity: string | null;
  days_since_activity: number | null;
  is_at_risk: boolean;
  // Overall health
  health_score: number; // 0-100
}

export interface EngagementFunnel {
  total_signups: number;
  completed_onboarding: number;
  configured_dna: number;
  first_message: number;
  repeat_users: number;
  power_users: number;
}

export interface FeatureAdoption {
  feature: string;
  tenants_using: number;
  total_usage: number;
  percentage: number;
}

export interface AdminAnalyticsData {
  // Overview KPIs
  totalUsers: number;
  activeUsers7d: number;
  activeUsers30d: number;
  totalTenants: number;
  activeTenants30d: number;
  
  // Time series
  dailyUsage: DailyUsageStats[];
  
  // Tool breakdown
  toolUsage: ToolUsageBreakdown[];
  
  // Tenant health
  tenantHealth: TenantHealthScore[];
  
  // Engagement funnel
  engagementFunnel: EngagementFunnel;
  
  // Feature adoption
  featureAdoption: FeatureAdoption[];
  
  // Alerts
  atRiskTenants: TenantHealthScore[];
  noDNATenants: TenantHealthScore[];
  inactiveUsers: number;
}

export const useAdminAnalytics = (tenantId?: string) => {
  const { isSuperAdmin, profile } = useAuth();
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const targetTenantId = tenantId || profile?.tenant_id;
      const isGlobalView = isSuperAdmin && !tenantId;

      // Fetch all required data in parallel
      const [
        usersResult,
        tenantsResult,
        toolEventsResult,
        dnaSamplesResult,
        dnaAnalysesResult,
        messagesResult,
        journeysResult,
        templatesResult,
        campusPhotosResult
      ] = await Promise.all([
        // Users
        supabase
          .from('profiles')
          .select('id, tenant_id, status, created_at, last_login_at')
          .neq('tenant_id', '00000000-0000-0000-0000-000000000000'),
        
        // Tenants
        supabase
          .from('tenants')
          .select('id, institution_name, status, tenant_type')
          .neq('id', '00000000-0000-0000-0000-000000000000'),
        
        // Tool usage events (last 90 days)
        supabase
          .from('tool_usage_events')
          .select('*')
          .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false }),
        
        // DNA samples
        supabase.from('content_dna_samples').select('id, tenant_id, profile_id, created_at'),
        
        // DNA analyses
        supabase.from('content_dna_analysis').select('id, tenant_id, profile_id, voice_analysis, brand_platform'),
        
        // Personal messages (generated content)
        supabase.from('personal_messages').select('id, tenant_id, created_at'),
        
        // User drafts (journeys)
        supabase.from('user_drafts').select('id, tenant_id, draft_type, created_at').eq('draft_type', 'journey'),
        
        // Shared templates
        supabase.from('shared_templates').select('id, tenant_id, created_at'),
        
        // Campus photos
        supabase.from('campus_photo_samples').select('id, tenant_id, profile_id, is_active').eq('is_active', true)
      ]);

      const users = usersResult.data || [];
      const tenants = tenantsResult.data || [];
      const toolEvents = toolEventsResult.data || [];
      const dnaSamples = dnaSamplesResult.data || [];
      const dnaAnalyses = dnaAnalysesResult.data || [];
      const messages = messagesResult.data || [];
      const journeys = journeysResult.data || [];
      const templates = templatesResult.data || [];
      const campusPhotos = campusPhotosResult.data || [];

      // Filter by tenant if not global view
      const filteredUsers = isGlobalView ? users : users.filter(u => u.tenant_id === targetTenantId);
      const filteredEvents = isGlobalView ? toolEvents : toolEvents.filter(e => e.tenant_id === targetTenantId);

      // Calculate date boundaries
      const now = new Date();
      const days7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Active users (logged in within period)
      const activeUsers7d = filteredUsers.filter(u => 
        u.last_login_at && new Date(u.last_login_at) > days7Ago
      ).length;
      
      const activeUsers30d = filteredUsers.filter(u => 
        u.last_login_at && new Date(u.last_login_at) > days30Ago
      ).length;

      // Active tenants
      const activeTenantIds30d = new Set(
        toolEvents
          .filter(e => new Date(e.created_at) > days30Ago)
          .map(e => e.tenant_id)
      );

      // Daily usage aggregation
      const dailyMap = new Map<string, DailyUsageStats>();
      filteredEvents.forEach(event => {
        const date = event.created_at.split('T')[0];
        const existing = dailyMap.get(date) || { date, total_events: 0, unique_users: 0, unique_tenants: 0 };
        existing.total_events++;
        dailyMap.set(date, existing);
      });

      // Recalculate unique users/tenants per day
      const dailyUsersMap = new Map<string, Set<string>>();
      const dailyTenantsMap = new Map<string, Set<string>>();
      filteredEvents.forEach(event => {
        const date = event.created_at.split('T')[0];
        if (!dailyUsersMap.has(date)) dailyUsersMap.set(date, new Set());
        if (!dailyTenantsMap.has(date)) dailyTenantsMap.set(date, new Set());
        dailyUsersMap.get(date)!.add(event.user_id);
        dailyTenantsMap.get(date)!.add(event.tenant_id);
      });

      dailyMap.forEach((value, key) => {
        value.unique_users = dailyUsersMap.get(key)?.size || 0;
        value.unique_tenants = dailyTenantsMap.get(key)?.size || 0;
      });

      const dailyUsage = Array.from(dailyMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);

      // Tool usage breakdown
      const toolMap = new Map<string, ToolUsageBreakdown>();
      filteredEvents.forEach(event => {
        const key = `${event.tool_name}:${event.action}`;
        const existing = toolMap.get(key) || { tool_name: event.tool_name, action: event.action, count: 0 };
        existing.count++;
        toolMap.set(key, existing);
      });
      const toolUsage = Array.from(toolMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      // Tenant health scores
      const tenantHealth: TenantHealthScore[] = tenants.map(tenant => {
        const tenantUsers = users.filter(u => u.tenant_id === tenant.id);
        const tenantActiveUsers = tenantUsers.filter(u => 
          u.last_login_at && new Date(u.last_login_at) > days30Ago
        );
        const tenantDNASamples = dnaSamples.filter(s => s.tenant_id === tenant.id);
        const tenantDNAAnalysis = dnaAnalyses.find(a => a.tenant_id === tenant.id);
        const tenantMessages = messages.filter(m => m.tenant_id === tenant.id);
        const tenantJourneys = journeys.filter(j => j.tenant_id === tenant.id);
        const tenantTemplates = templates.filter(t => t.tenant_id === tenant.id);
        
        // Get evaluator events
        const tenantEvents = toolEvents.filter(e => e.tenant_id === tenant.id);
        const evaluatorEvents = tenantEvents.filter(e => 
          e.tool_name === 'evaluate' || e.action === 'evaluator'
        );

        // Last activity
        const lastEvent = tenantEvents[0];
        const lastActivity = lastEvent?.created_at || null;
        const daysSinceActivity = lastActivity 
          ? Math.floor((now.getTime() - new Date(lastActivity).getTime()) / (24 * 60 * 60 * 1000))
          : null;

        // Calculate health metrics
        const userAdoptionRate = tenantUsers.length > 0 
          ? Math.round((tenantActiveUsers.length / tenantUsers.length) * 100) 
          : 0;

        // DNA completeness: samples (25%) + analysis (30%) + brand platform (25%) + campus photos (20%)
        const tenantCampusPhotos = campusPhotos.filter(p => p.tenant_id === tenant.id);
        let dnaCompleteness = 0;
        if (tenantDNASamples.length > 0) dnaCompleteness += 25;
        if (tenantDNAAnalysis?.voice_analysis) dnaCompleteness += 30;
        if (tenantDNAAnalysis?.brand_platform) dnaCompleteness += 25;
        if (tenantCampusPhotos.length > 0) dnaCompleteness += 20;

        // Overall health score calculation
        // User engagement: 25%, DNA setup: 25%, Feature usage: 25%, Recent activity: 25%
        let healthScore = 0;
        
        // User engagement (25 pts max)
        healthScore += Math.min(25, userAdoptionRate * 0.25);
        
        // DNA setup (25 pts max)
        healthScore += dnaCompleteness * 0.25;
        
        // Feature usage (25 pts max) - at least using 2 features = full score
        const featuresUsed = [
          tenantMessages.length > 0,
          tenantJourneys.length > 0,
          evaluatorEvents.length > 0,
          tenantDNASamples.length > 0
        ].filter(Boolean).length;
        healthScore += Math.min(25, (featuresUsed / 4) * 25);
        
        // Recent activity (25 pts max)
        if (daysSinceActivity !== null) {
          if (daysSinceActivity <= 7) healthScore += 25;
          else if (daysSinceActivity <= 14) healthScore += 20;
          else if (daysSinceActivity <= 30) healthScore += 10;
          else if (daysSinceActivity <= 60) healthScore += 5;
        }

        const isAtRisk = (daysSinceActivity !== null && daysSinceActivity > 30) || 
                         (tenantUsers.length > 0 && userAdoptionRate < 20);

        return {
          tenant_id: tenant.id,
          institution_name: tenant.institution_name,
          tenant_type: (tenant as any).tenant_type || 'university',
          status: tenant.status,
          total_users: tenantUsers.length,
          active_users_30d: tenantActiveUsers.length,
          user_adoption_rate: userAdoptionRate,
          dna_samples: tenantDNASamples.length,
          has_dna_analysis: !!tenantDNAAnalysis?.voice_analysis,
          dna_completeness: dnaCompleteness,
          messages_generated: tenantMessages.length,
          journeys_created: tenantJourneys.length,
          library_items: tenantTemplates.length,
          evaluations_run: evaluatorEvents.length,
          last_activity: lastActivity,
          days_since_activity: daysSinceActivity,
          is_at_risk: isAtRisk,
          health_score: Math.round(healthScore)
        };
      });

      // Engagement funnel
      const usersWithLogin = filteredUsers.filter(u => u.last_login_at).length;
      const usersWithDNA = new Set(dnaSamples.map(s => s.tenant_id)).size;
      const usersWithMessage = new Set(messages.map(m => m.tenant_id)).size;
      
      // Repeat users = logged in more than once (approximation: logged in within last 7 days AND created > 7 days ago)
      const repeatUsers = filteredUsers.filter(u => {
        if (!u.last_login_at) return false;
        const lastLogin = new Date(u.last_login_at);
        const created = new Date(u.created_at);
        const createdDaysAgo = (now.getTime() - created.getTime()) / (24 * 60 * 60 * 1000);
        return lastLogin > days7Ago && createdDaysAgo > 7;
      }).length;

      // Power users = 10+ events in last 30 days
      const userEventCounts = new Map<string, number>();
      filteredEvents
        .filter(e => new Date(e.created_at) > days30Ago)
        .forEach(e => {
          userEventCounts.set(e.user_id, (userEventCounts.get(e.user_id) || 0) + 1);
        });
      const powerUsers = Array.from(userEventCounts.values()).filter(count => count >= 10).length;

      const engagementFunnel: EngagementFunnel = {
        total_signups: filteredUsers.length,
        completed_onboarding: usersWithLogin,
        configured_dna: usersWithDNA,
        first_message: usersWithMessage,
        repeat_users: repeatUsers,
        power_users: powerUsers
      };

      // Feature adoption
      const features = [
        { name: 'Message Builder', tools: ['build', 'message_builder'] },
        { name: 'Journey Designer', tools: ['mapper', 'journey_mapper', 'strategy'] },
        { name: 'Evaluator', tools: ['evaluate', 'evaluator'] },
        { name: 'Content DNA Studio', tools: ['content_dna', 'admin_content-dna'] },
        { name: 'Web Analyzer', tools: ['web-analyzer'] },
        { name: 'Brand Audit', tools: ['brand-audit'] }
      ];

      const totalTenantsCount = isGlobalView ? tenants.length : 1;
      const featureAdoption: FeatureAdoption[] = features.map(feature => {
        const featureEvents = filteredEvents.filter(e => 
          feature.tools.includes(e.tool_name) || feature.tools.includes(e.action)
        );
        const tenantsUsing = new Set(featureEvents.map(e => e.tenant_id)).size;
        return {
          feature: feature.name,
          tenants_using: tenantsUsing,
          total_usage: featureEvents.length,
          percentage: Math.round((tenantsUsing / totalTenantsCount) * 100)
        };
      });

      // At-risk and no-DNA tenants
      const atRiskTenants = tenantHealth.filter(t => t.is_at_risk);
      const noDNATenants = tenantHealth.filter(t => t.dna_samples === 0);

      // Inactive users (no login in 30+ days)
      const inactiveUsers = filteredUsers.filter(u => {
        if (!u.last_login_at) return true;
        return new Date(u.last_login_at) < days30Ago;
      }).length;

      setData({
        totalUsers: filteredUsers.length,
        activeUsers7d,
        activeUsers30d,
        totalTenants: isGlobalView ? tenants.length : 1,
        activeTenants30d: activeTenantIds30d.size,
        dailyUsage,
        toolUsage,
        tenantHealth,
        engagementFunnel,
        featureAdoption,
        atRiskTenants,
        noDNATenants,
        inactiveUsers
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin, profile?.tenant_id, tenantId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics
  };
};
