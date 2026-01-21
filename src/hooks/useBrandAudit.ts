import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { 
  BrandAuditTouchpoint, 
  BrandAuditReport, 
  TouchpointType,
  TerminologyIssue,
  TouchpointAnalysisResult 
} from "@/types/playbook";

export function useBrandAudit(profileId?: string | null) {
  const { profile, tenant } = useAuth();
  const { toast } = useToast();
  const [touchpoints, setTouchpoints] = useState<BrandAuditTouchpoint[]>([]);
  const [reports, setReports] = useState<BrandAuditReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTouchpoints = useCallback(async () => {
    if (!tenant?.id) return;

    try {
      let query = supabase
        .from('brand_audit_touchpoints')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedData: BrandAuditTouchpoint[] = (data || []).map(tp => ({
        ...tp,
        touchpoint_type: tp.touchpoint_type as TouchpointType,
        terminology_issues: (tp.terminology_issues as unknown as TerminologyIssue[]) || [],
        analysis_result: tp.analysis_result as unknown as TouchpointAnalysisResult | null,
        status: tp.status as 'pending' | 'analyzed' | 'remediated',
      }));

      setTouchpoints(transformedData);
    } catch (err) {
      console.error('Error fetching touchpoints:', err);
    }
  }, [tenant?.id, profileId]);

  const fetchReports = useCallback(async () => {
    if (!tenant?.id) return;

    try {
      let query = supabase
        .from('brand_audit_reports')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('report_date', { ascending: false });

      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReports((data || []) as unknown as BrandAuditReport[]);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  }, [tenant?.id, profileId]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTouchpoints(), fetchReports()]);
      setIsLoading(false);
    };

    loadData();
  }, [fetchTouchpoints, fetchReports]);

  const addTouchpoint = async (
    touchpointType: TouchpointType,
    touchpointName: string,
    touchpointCategory?: string,
    contentSample?: string
  ) => {
    if (!tenant?.id || !profile?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add touchpoints.",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('brand_audit_touchpoints')
        .insert({
          tenant_id: tenant.id,
          profile_id: profileId || null,
          user_id: profile.id,
          touchpoint_type: touchpointType,
          touchpoint_category: touchpointCategory || null,
          touchpoint_name: touchpointName,
          content_sample: contentSample || null,
          status: contentSample ? 'pending' : 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTouchpoints();

      toast({
        title: "Touchpoint Added",
        description: `"${touchpointName}" has been added to your audit.`,
      });

      return data;
    } catch (err) {
      console.error('Error adding touchpoint:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add touchpoint. Please try again.",
      });
      return null;
    }
  };

  const updateTouchpoint = async (
    touchpointId: string,
    updates: Partial<Pick<BrandAuditTouchpoint, 
      'content_sample' | 'status' | 'remediation_notes' | 'brand_score' | 'voice_score' | 'analysis_result' | 'terminology_issues'
    >>
  ) => {
    try {
      // Convert to DB-compatible format
      const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.content_sample !== undefined) dbUpdates.content_sample = updates.content_sample;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.remediation_notes !== undefined) dbUpdates.remediation_notes = updates.remediation_notes;
      if (updates.brand_score !== undefined) dbUpdates.brand_score = updates.brand_score;
      if (updates.voice_score !== undefined) dbUpdates.voice_score = updates.voice_score;
      if (updates.analysis_result !== undefined) dbUpdates.analysis_result = updates.analysis_result as unknown;
      if (updates.terminology_issues !== undefined) dbUpdates.terminology_issues = updates.terminology_issues as unknown;

      const { error } = await supabase
        .from('brand_audit_touchpoints')
        .update(dbUpdates)
        .eq('id', touchpointId);

      if (error) throw error;

      await fetchTouchpoints();

      toast({
        title: "Touchpoint Updated",
        description: "The touchpoint has been updated.",
      });
    } catch (err) {
      console.error('Error updating touchpoint:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update touchpoint.",
      });
    }
  };

  const deleteTouchpoint = async (touchpointId: string) => {
    try {
      const { error } = await supabase
        .from('brand_audit_touchpoints')
        .delete()
        .eq('id', touchpointId);

      if (error) throw error;

      await fetchTouchpoints();

      toast({
        title: "Touchpoint Removed",
        description: "The touchpoint has been removed from your audit.",
      });
    } catch (err) {
      console.error('Error deleting touchpoint:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete touchpoint.",
      });
    }
  };

  const getAuditStats = () => {
    const total = touchpoints.length;
    const analyzed = touchpoints.filter(t => t.status === 'analyzed').length;
    const pending = touchpoints.filter(t => t.status === 'pending').length;
    const remediated = touchpoints.filter(t => t.status === 'remediated').length;

    const avgBrandScore = touchpoints.filter(t => t.brand_score !== null)
      .reduce((sum, t) => sum + (t.brand_score || 0), 0) / 
      (touchpoints.filter(t => t.brand_score !== null).length || 1);

    const avgVoiceScore = touchpoints.filter(t => t.voice_score !== null)
      .reduce((sum, t) => sum + (t.voice_score || 0), 0) / 
      (touchpoints.filter(t => t.voice_score !== null).length || 1);

    const byType = {
      physical: touchpoints.filter(t => t.touchpoint_type === 'physical').length,
      digital: touchpoints.filter(t => t.touchpoint_type === 'digital').length,
      human: touchpoints.filter(t => t.touchpoint_type === 'human').length,
    };

    return {
      total,
      analyzed,
      pending,
      remediated,
      avgBrandScore: Math.round(avgBrandScore) || 0,
      avgVoiceScore: Math.round(avgVoiceScore) || 0,
      byType,
    };
  };

  return {
    touchpoints,
    reports,
    isLoading,
    addTouchpoint,
    updateTouchpoint,
    deleteTouchpoint,
    getAuditStats,
    refetch: () => Promise.all([fetchTouchpoints(), fetchReports()]),
  };
}
