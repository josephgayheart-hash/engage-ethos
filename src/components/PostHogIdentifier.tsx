import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { identifyPostHog, resetPostHog } from "@/lib/posthog";

/**
 * Identifies the current authenticated user with PostHog and resets on logout.
 * Mount once inside AuthProvider.
 */
export function PostHogIdentifier() {
  const { user, profile, tenant, role } = useAuth();
  const identifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      if (identifiedRef.current === user.id) return;
      identifiedRef.current = user.id;
      identifyPostHog(user.id, {
        email: profile.email ?? user.email ?? null,
        name: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || null,
        tenantId: profile.tenant_id ?? null,
        tenantName: tenant?.institution_name ?? null,
        role: role ?? null,
      });
    } else if (!user && identifiedRef.current) {
      identifiedRef.current = null;
      resetPostHog();
    }
  }, [user, profile, tenant, role]);

  return null;
}
