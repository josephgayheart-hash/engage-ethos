import posthog from "posthog-js";

const POSTHOG_KEY = "phc_BoFCzk26PRTKy5gjBBFZYQTAyrqY48wbbRE98jeen3bC";
const POSTHOG_HOST = "https://us.i.posthog.com";

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    disable_session_recording: false,
  });
}

export function identifyPostHog(
  userId: string,
  props?: { email?: string | null; name?: string | null; tenantId?: string | null; tenantName?: string | null; role?: string | null }
) {
  if (!initialized) return;
  posthog.identify(userId, {
    email: props?.email ?? undefined,
    name: props?.name ?? undefined,
    tenant_id: props?.tenantId ?? undefined,
    tenant_name: props?.tenantName ?? undefined,
    role: props?.role ?? undefined,
  });
  if (props?.tenantId) {
    posthog.group("tenant", props.tenantId, {
      name: props.tenantName ?? undefined,
    });
  }
}

export function resetPostHog() {
  if (!initialized) return;
  posthog.reset();
}

export { posthog };
