import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";

export interface CampaignTouchpoint {
  id: string;
  tMinusDays: number;
  label: string;
  channel: string;
  segment: string;
  messageType: string;
  tone: string;
  status: 'planned' | 'drafted' | 'approved' | 'sent';
  generatedContent?: string;
}

export interface AdvancementCampaign {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  created_by_user_id: string;
  name: string;
  campaign_type: string;
  giving_day_date: string;
  status: string;
  goal_amount: string | null;
  target_segments: string[];
  touchpoints: CampaignTouchpoint[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useAdvancementCampaigns() {
  const [campaigns, setCampaigns] = useState<AdvancementCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, tenant } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const { toast } = useToast();

  const tenantId = activeWorkspace?.id || tenant?.id;

  const fetchCampaigns = useCallback(async () => {
    if (!tenantId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('advancement_campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('giving_day_date', { ascending: true });

    if (error) {
      console.error('Error fetching campaigns:', error);
    } else {
      setCampaigns((data || []).map(d => ({
        ...d,
        target_segments: (d.target_segments as any) || [],
        touchpoints: (d.touchpoints as any) || [],
      })));
    }
    setIsLoading(false);
  }, [tenantId]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const createCampaign = async (campaign: {
    name: string;
    giving_day_date: string;
    campaign_type?: string;
    goal_amount?: string;
    profile_id?: string | null;
    target_segments?: string[];
    notes?: string;
  }) => {
    if (!tenantId || !user) return null;
    const { data, error } = await supabase
      .from('advancement_campaigns')
      .insert({
        tenant_id: tenantId,
        created_by_user_id: user.id,
        name: campaign.name,
        giving_day_date: campaign.giving_day_date,
        campaign_type: campaign.campaign_type || 'giving-day',
        goal_amount: campaign.goal_amount || null,
        profile_id: campaign.profile_id || null,
        target_segments: campaign.target_segments || [],
        notes: campaign.notes || null,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
    await fetchCampaigns();
    return data;
  };

  const updateCampaign = async (id: string, updates: Partial<AdvancementCampaign>) => {
    const { error } = await supabase
      .from('advancement_campaigns')
      .update(updates as any)
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchCampaigns();
    return true;
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase
      .from('advancement_campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchCampaigns();
    return true;
  };

  return { campaigns, isLoading, createCampaign, updateCampaign, deleteCampaign, refetch: fetchCampaigns };
}
