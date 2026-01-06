import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to track page views across the app
 * Automatically records when a user visits a page
 */
export const usePageTracking = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Skip if no authenticated user
    if (!profile?.id || !profile?.tenant_id) {
      return;
    }

    // Skip if we already tracked this path (prevent double tracking)
    if (lastTrackedPath.current === location.pathname) {
      return;
    }

    lastTrackedPath.current = location.pathname;

    // Extract page name from path
    const pageName = getPageName(location.pathname);

    // Track the page view
    const trackPageView = async () => {
      try {
        const { error } = await supabase.from('tool_usage_events').insert({
          tool_name: 'page_view',
          action: pageName,
          user_id: profile.id,
          tenant_id: profile.tenant_id,
          metadata: {
            path: location.pathname,
            search: location.search,
            timestamp: new Date().toISOString(),
          },
        });

        if (error) {
          console.error("Failed to track page view:", error);
        } else {
          console.log(`Tracked page view: ${pageName}`);
        }
      } catch (err) {
        console.error("Error tracking page view:", err);
      }
    };

    trackPageView();
  }, [location.pathname, profile?.id, profile?.tenant_id]);
};

/**
 * Convert path to readable page name
 */
function getPageName(path: string): string {
  const pathMap: Record<string, string> = {
    '/': 'landing',
    '/dashboard': 'dashboard',
    '/build': 'message_builder',
    '/evaluate': 'evaluator',
    '/strategy': 'journey_mapper',
    '/library': 'personal_library',
    '/shared-library': 'university_library',
    '/approvals': 'approvals',
    '/settings': 'settings',
    '/content-dna': 'content_dna',
    '/playground': 'copywriter',
    '/byoc': 'byoc',
    '/call-script': 'call_scripts',
    '/subject-optimizer': 'subject_optimizer',
    '/accessibility': 'accessibility_checker',
    '/brand-voice': 'brand_voice_scorer',
    '/email-preview': 'email_preview',
    '/benchmarks': 'benchmarks',
    '/translate': 'translation',
    '/calendar': 'calendar',
    '/campaign-dashboard': 'campaign_dashboard',
    '/profile': 'profile',
    '/admin/console': 'admin_console',
    '/admin/panel': 'admin_panel',
    '/admin/users': 'admin_users',
  };

  // Check for exact match
  if (pathMap[path]) {
    return pathMap[path];
  }

  // Check for partial matches (for routes with params like /library/:id)
  for (const [route, name] of Object.entries(pathMap)) {
    if (path.startsWith(route + '/')) {
      return name + '_detail';
    }
  }

  // Default to the path itself
  return path.replace(/^\//, '').replace(/\//g, '_') || 'home';
}
