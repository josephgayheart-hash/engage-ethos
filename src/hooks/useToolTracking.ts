import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";

export const useToolTracking = () => {
  const { profile } = useAuth();

  const trackToolUse = useCallback(async (
    toolName: string,
    action: string = 'use',
    metadata?: Record<string, any>
  ) => {
    if (!profile?.id || !profile?.tenant_id) {
      console.log("Tool tracking skipped - no authenticated user");
      return;
    }

    try {
      const { error } = await supabase.from('tool_usage_events').insert({
        tool_name: toolName,
        action,
        user_id: profile.id,
        tenant_id: profile.tenant_id,
        metadata: metadata || {},
      });

      if (error) {
        console.error("Failed to track tool usage:", error);
      } else {
        console.log(`Tracked: ${toolName} - ${action}`);
      }
    } catch (err) {
      console.error("Error tracking tool usage:", err);
    }
  }, [profile?.id, profile?.tenant_id]);

  return { trackToolUse };
};
