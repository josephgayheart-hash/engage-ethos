import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface SalesforceCanvasContext {
  /** Whether the app is running inside a Salesforce Canvas iframe */
  isEmbed: boolean;
  /** Salesforce org ID from signed request */
  orgId?: string;
  /** Salesforce user ID */
  sfUserId?: string;
  /** Salesforce user email */
  sfUserEmail?: string;
  /** Salesforce instance URL */
  instanceUrl?: string;
  /** Canvas client ID */
  clientId?: string;
  /** Raw canvas context for advanced usage */
  rawContext?: Record<string, any>;
  /** Whether we're still parsing the signed request */
  isLoading: boolean;
}

const EmbedContext = createContext<SalesforceCanvasContext>({
  isEmbed: false,
  isLoading: false,
});

export function useEmbed() {
  return useContext(EmbedContext);
}

/**
 * Parses Salesforce Canvas signed request from URL hash or postMessage.
 * In production, the signed request should be verified server-side.
 * For now, we parse the base64 payload for context.
 */
function parseSignedRequest(signedRequest: string): Record<string, any> | null {
  try {
    // Signed request format: <signature>.<base64-encoded-JSON>
    const parts = signedRequest.split(".");
    if (parts.length !== 2) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export function EmbedProvider({ children }: { children: ReactNode }) {
  const [ctx, setCtx] = useState<SalesforceCanvasContext>({
    isEmbed: true,
    isLoading: true,
  });

  useEffect(() => {
    // 1. Check URL params for signed_request (Canvas POST → redirect flow)
    const params = new URLSearchParams(window.location.search);
    const signedRequest = params.get("signed_request");

    if (signedRequest) {
      const payload = parseSignedRequest(signedRequest);
      if (payload) {
        setCtx({
          isEmbed: true,
          isLoading: false,
          orgId: payload.context?.organization?.organizationId,
          sfUserId: payload.context?.user?.userId,
          sfUserEmail: payload.context?.user?.email,
          instanceUrl: payload.client?.instanceUrl,
          clientId: payload.client?.oauthClientId,
          rawContext: payload,
        });
        return;
      }
    }

    // 2. Listen for postMessage from Salesforce Canvas SDK
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "canvas.signedrequest") {
        const payload = parseSignedRequest(event.data.signedRequest);
        if (payload) {
          setCtx({
            isEmbed: true,
            isLoading: false,
            orgId: payload.context?.organization?.organizationId,
            sfUserId: payload.context?.user?.userId,
            sfUserEmail: payload.context?.user?.email,
            instanceUrl: payload.client?.instanceUrl,
            clientId: payload.client?.oauthClientId,
            rawContext: payload,
          });
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // 3. If no signed request arrives within 2s, proceed without SF context
    const timeout = setTimeout(() => {
      setCtx((prev) => (prev.isLoading ? { ...prev, isLoading: false } : prev));
    }, 2000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timeout);
    };
  }, []);

  return <EmbedContext.Provider value={ctx}>{children}</EmbedContext.Provider>;
}
