import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserDrafts } from '@/hooks/useUserDrafts';
import { useInstitutionalProfiles } from '@/hooks/useInstitutionalProfiles';

export type DashboardMode = 'onboarding' | 'configured' | 'active' | 'power-user';

interface SetupProgress {
  hasProfile: boolean;
  hasInstitution: boolean;
  hasDNA: boolean;
  completionPercent: number;
}

interface PersonalStats {
  messagesCreated: number;
  journeysDesigned: number;
  draftsInProgress: number;
  evaluationsRun: number;
  buildsCount: number;
  topTool: string | null;
  lastToolUsed: string | null;
  lastActiveDate: Date | null;
  daysActive: number;
}

interface InstitutionalStats {
  healthScore: number;
  adoptionRate: number;
  dnaCompleteness: number;
  activeUsers: number;
  totalUsers: number;
}

interface PlatformInsight {
  type: 'tip' | 'activity' | 'suggestion';
  message: string;
  icon?: string;
}

interface QuickAction {
  label: string;
  href: string;
  priority: number;
}

export interface UserDashboardContext {
  mode: DashboardMode;
  setupProgress: SetupProgress;
  personalStats: PersonalStats;
  institutionalStats: InstitutionalStats | null;
  platformInsight: PlatformInsight | null;
  suggestedActions: QuickAction[];
  mostRecentDraft: {
    id: string;
    title: string | null;
    type: string;
  } | null;
  isLoading: boolean;
}

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  'message_builder': 'Message Builder',
  'evaluate': 'Evaluator',
  'journey_designer': 'Journey Designer',
  'web_analyzer': 'Web Analyzer',
  'byoc': 'BYOC Import',
  'brand_voice': 'Content DNA Scorer',
  'accessibility': 'Accessibility Checker',
  'subject_optimizer': 'Subject Optimizer',
  'translation': 'Translation Tool',
  'playground': 'AI Playground',
};

export function useUserDashboardContext(): UserDashboardContext {
  const { user, profile, tenant, isAdmin } = useAuth();
  const { profiles: institutionalProfiles } = useInstitutionalProfiles();
  const { drafts } = useUserDrafts();
  
  const [personalStats, setPersonalStats] = useState<PersonalStats>({
    messagesCreated: 0,
    journeysDesigned: 0,
    draftsInProgress: 0,
    evaluationsRun: 0,
    buildsCount: 0,
    topTool: null,
    lastToolUsed: null,
    lastActiveDate: null,
    daysActive: 0,
  });
  
  const [institutionalStats, setInstitutionalStats] = useState<InstitutionalStats | null>(null);
  const [platformInsight, setPlatformInsight] = useState<PlatformInsight | null>(null);
  const [hasDNA, setHasDNA] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch personal stats from tool_usage_events
  const fetchPersonalStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Get tool usage events for this user (last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: events } = await supabase
        .from('tool_usage_events')
        .select('tool_name, action, created_at')
        .eq('user_id', user.id)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (!events) return;

      // Calculate stats
      const toolCounts: Record<string, number> = {};
      const uniqueDates = new Set<string>();
      let evaluationsRun = 0;
      let buildsCount = 0;

      events.forEach(event => {
        // Count by tool
        if (event.tool_name && event.tool_name !== 'page_view') {
          toolCounts[event.tool_name] = (toolCounts[event.tool_name] || 0) + 1;
        }
        
        // Track unique active days
        const dateStr = new Date(event.created_at).toDateString();
        uniqueDates.add(dateStr);

        // Count specific actions
        if (event.tool_name === 'evaluate') evaluationsRun++;
        if (event.tool_name === 'message_builder' && event.action === 'generate') buildsCount++;
      });

      // Find top tool
      const topTool = Object.entries(toolCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

      // Get last tool used (excluding page views)
      const lastEvent = events.find(e => e.tool_name && e.tool_name !== 'page_view');

      // Get messages count
      const { count: messagesCount } = await supabase
        .from('personal_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get journey drafts count
      const journeyDrafts = drafts.filter(d => d.draft_type === 'journey').length;

      setPersonalStats({
        messagesCreated: messagesCount || 0,
        journeysDesigned: journeyDrafts,
        draftsInProgress: drafts.length,
        evaluationsRun,
        buildsCount,
        topTool: topTool ? (TOOL_DISPLAY_NAMES[topTool] || topTool) : null,
        lastToolUsed: lastEvent?.tool_name ? (TOOL_DISPLAY_NAMES[lastEvent.tool_name] || lastEvent.tool_name) : null,
        lastActiveDate: lastEvent ? new Date(lastEvent.created_at) : null,
        daysActive: uniqueDates.size,
      });
    } catch (error) {
      console.error('Error fetching personal stats:', error);
    }
  }, [user?.id, drafts]);

  // Fetch institutional stats (for admins)
  const fetchInstitutionalStats = useCallback(async () => {
    if (!tenant?.id || !isAdmin) return;

    try {
      // Get users in tenant
      const { data: tenantUsers, count: totalUsers } = await supabase
        .from('profiles')
        .select('id, last_login_at', { count: 'exact' })
        .eq('tenant_id', tenant.id);

      if (!tenantUsers) return;

      // Calculate active users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUsers = tenantUsers.filter(u => 
        u.last_login_at && new Date(u.last_login_at) > thirtyDaysAgo
      ).length;

      // Get DNA completeness
      const { data: dnaData } = await supabase
        .from('content_dna_analysis')
        .select('id, voice_analysis, brand_platform')
        .eq('tenant_id', tenant.id);

      let dnaCompleteness = 0;
      if (dnaData && dnaData.length > 0) {
        const completed = dnaData.filter(d => d.voice_analysis && d.brand_platform).length;
        dnaCompleteness = Math.round((completed / dnaData.length) * 100);
      }

      // Calculate health score (simplified)
      const adoptionRate = totalUsers ? Math.round((activeUsers / totalUsers) * 100) : 0;
      const healthScore = Math.round((adoptionRate * 0.5) + (dnaCompleteness * 0.5));

      setInstitutionalStats({
        healthScore,
        adoptionRate,
        dnaCompleteness,
        activeUsers,
        totalUsers: totalUsers || 0,
      });
    } catch (error) {
      console.error('Error fetching institutional stats:', error);
    }
  }, [tenant?.id, isAdmin]);

  // Fetch platform insights (anonymized)
  const fetchPlatformInsight = useCallback(async () => {
    try {
      // Get aggregated stats for insights
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentEvents } = await supabase
        .from('tool_usage_events')
        .select('tool_name')
        .gte('created_at', sevenDaysAgo.toISOString())
        .neq('tool_name', 'page_view');

      if (!recentEvents || recentEvents.length === 0) return;

      // Find most popular tool this week
      const toolCounts: Record<string, number> = {};
      recentEvents.forEach(e => {
        if (e.tool_name) {
          toolCounts[e.tool_name] = (toolCounts[e.tool_name] || 0) + 1;
        }
      });

      const topTool = Object.entries(toolCounts)
        .sort(([, a], [, b]) => b - a)[0];

      // Generate contextual insights
      const insights: PlatformInsight[] = [
        {
          type: 'activity',
          message: `${recentEvents.length} actions taken across the platform this week`,
        },
        {
          type: 'tip',
          message: `${TOOL_DISPLAY_NAMES[topTool?.[0]] || 'Message Builder'} is the most-used tool this week`,
        },
        {
          type: 'suggestion',
          message: 'Users who set up Content DNA see 40% better brand alignment scores',
        },
        {
          type: 'tip',
          message: 'Try the Evaluator to score your messages against persuasion frameworks',
        },
      ];

      // Rotate through insights based on current hour
      const hour = new Date().getHours();
      setPlatformInsight(insights[hour % insights.length]);
    } catch (error) {
      console.error('Error fetching platform insights:', error);
    }
  }, []);

  // Check if DNA is active
  const checkDNA = useCallback(async () => {
    if (!tenant?.id) return;

    const { data } = await supabase
      .from('content_dna_analysis')
      .select('id')
      .eq('tenant_id', tenant.id)
      .not('last_analyzed_at', 'is', null)
      .limit(1);

    setHasDNA(!!data && data.length > 0);
  }, [tenant?.id]);

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchPersonalStats(),
        fetchInstitutionalStats(),
        fetchPlatformInsight(),
        checkDNA(),
      ]);
      setIsLoading(false);
    };

    if (user?.id) {
      fetchAll();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, fetchPersonalStats, fetchInstitutionalStats, fetchPlatformInsight, checkDNA]);

  // Calculate setup progress
  const setupProgress = useMemo<SetupProgress>(() => {
    const hasProfile = !!profile;
    const hasInstitution = institutionalProfiles.length > 0;
    
    let completedSteps = 0;
    if (hasProfile) completedSteps++;
    if (hasInstitution) completedSteps++;
    if (hasDNA) completedSteps++;

    return {
      hasProfile,
      hasInstitution,
      hasDNA,
      completionPercent: Math.round((completedSteps / 3) * 100),
    };
  }, [profile, institutionalProfiles, hasDNA]);

  // Calculate total usage for mode detection
  const totalUsage = useMemo(() => {
    return personalStats.messagesCreated + personalStats.evaluationsRun + personalStats.buildsCount;
  }, [personalStats]);

  // Determine dashboard mode
  const mode = useMemo<DashboardMode>(() => {
    if (!setupProgress.hasInstitution || !setupProgress.hasDNA) {
      return 'onboarding';
    }
    if (totalUsage > 50) {
      return 'power-user';
    }
    if (totalUsage > 5) {
      return 'active';
    }
    return 'configured';
  }, [setupProgress, totalUsage]);

  // Get most recent draft
  const mostRecentDraft = useMemo(() => {
    if (drafts.length === 0) return null;
    const recent = drafts[0];
    return {
      id: recent.id,
      title: recent.title,
      type: recent.draft_type,
    };
  }, [drafts]);

  // Generate suggested actions based on context
  const suggestedActions = useMemo<QuickAction[]>(() => {
    const actions: QuickAction[] = [];

    if (mode === 'onboarding') {
      if (!setupProgress.hasInstitution) {
        actions.push({ label: 'Set Up Institution', href: '/university-settings', priority: 1 });
      }
      if (!setupProgress.hasDNA) {
        actions.push({ label: 'Configure Content DNA', href: '/content-dna', priority: 2 });
      }
    } else if (mode === 'configured') {
      actions.push({ label: 'Create Your First Message', href: '/build', priority: 1 });
      actions.push({ label: 'Explore Journey Designer', href: '/strategy', priority: 2 });
    } else {
      // Active/Power users
      if (mostRecentDraft) {
        actions.push({ 
          label: `Resume: ${mostRecentDraft.title || 'Draft'}`, 
          href: mostRecentDraft.type === 'journey' ? `/strategy?draft=${mostRecentDraft.id}` : `/build?draft=${mostRecentDraft.id}`,
          priority: 1 
        });
      }
      actions.push({ label: 'Message Builder', href: '/build', priority: 2 });
      actions.push({ label: 'Evaluate Content', href: '/evaluate', priority: 3 });
    }

    return actions.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }, [mode, setupProgress, mostRecentDraft]);

  return {
    mode,
    setupProgress,
    personalStats,
    institutionalStats,
    platformInsight,
    suggestedActions,
    mostRecentDraft,
    isLoading,
  };
}
