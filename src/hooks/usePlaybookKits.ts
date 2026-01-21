import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PlaybookKit, JourneyTemplate, MessageTemplate } from "@/types/playbook";

export function usePlaybookKits(institutionType?: string) {
  const [kits, setKits] = useState<PlaybookKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchKits = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('playbook_kits')
          .select('*')
          .eq('is_active', true)
          .order('name');

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // Filter by institution type if provided
        let filteredData = data || [];
        if (institutionType) {
          filteredData = filteredData.filter(kit => 
            kit.institution_types?.includes(institutionType) || 
            kit.institution_types?.includes('all')
          );
        }

        // Transform data to proper types
        const transformedKits: PlaybookKit[] = filteredData.map(kit => ({
          ...kit,
          journey_template: (kit.journey_template as unknown as JourneyTemplate) || { phases: [] },
          message_templates: (kit.message_templates as unknown as MessageTemplate[]) || [],
          best_practices: kit.best_practices || [],
          institution_types: kit.institution_types || [],
          target_audiences: kit.target_audiences || [],
          target_cohorts: kit.target_cohorts || [],
        }));

        setKits(transformedKits);
      } catch (err) {
        console.error('Error fetching playbook kits:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch playbook kits'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchKits();
  }, [institutionType]);

  const getKitByKey = (kitKey: string) => {
    return kits.find(kit => kit.kit_key === kitKey);
  };

  const getKitsByCategory = (category: string) => {
    return kits.filter(kit => kit.category === category);
  };

  return {
    kits,
    isLoading,
    error,
    getKitByKey,
    getKitsByCategory,
  };
}
