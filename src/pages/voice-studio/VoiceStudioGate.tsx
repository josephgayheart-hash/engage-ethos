import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BrandedLoader } from "@/components/BrandedLoader";

/**
 * Wraps /voice-studio. Anyone authenticated can use Voice Studio, but
 * tool-only users without a completed setup get bounced to /voice-studio/setup.
 */
export function VoiceStudioGate({ children }: { children: React.ReactNode }) {
  const { user, isToolOnly, isLoading } = useAuth();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [setupDone, setSetupDone] = useState<boolean>(true);

  useEffect(() => {
    if (!user || !isToolOnly) {
      setChecked(true);
      setSetupDone(true);
      return;
    }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("personal_ai_profile")
        .select("setup_completed_at")
        .maybeSingle();
      if (!active) return;
      setSetupDone(!!data?.setup_completed_at);
      setChecked(true);
    })();
    return () => { active = false; };
  }, [user, isToolOnly]);

  if (isLoading || !checked) return <BrandedLoader />;
  if (isToolOnly && !setupDone && location.pathname !== "/voice-studio/setup") {
    return <Navigate to="/voice-studio/setup" replace />;
  }
  return <>{children}</>;
}
