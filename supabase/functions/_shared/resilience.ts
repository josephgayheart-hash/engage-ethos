/**
 * Shared resilience utilities for edge functions calling the AI gateway.
 * Provides retry with exponential backoff, request timeouts, and structured error responses.
 */

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 2;
const BASE_DELAY_MS = 1_000;

export interface ResilientFetchOptions {
  /** Maximum number of retry attempts (default: 2) */
  maxRetries?: number;
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
  /** Base delay for exponential backoff in milliseconds (default: 1000) */
  baseDelayMs?: number;
  /** Label for logging (e.g. function name) */
  label?: string;
}

export interface StructuredError {
  error: string;
  code: string;
  retryable: boolean;
}

/**
 * Wraps a fetch call to the AI gateway with:
 * - AbortSignal.timeout for request timeouts
 * - Exponential backoff retry for transient failures (429, 500, 502, 503, 504)
 * - Structured error responses
 */
export async function resilientFetch(
  url: string,
  init: RequestInit,
  options: ResilientFetchOptions = {}
): Promise<Response> {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    baseDelayMs = BASE_DELAY_MS,
    label = "ai-gateway",
  } = options;

  let lastError: Error | null = null;
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500;
        console.log(`[${label}] Retry ${attempt}/${maxRetries} after ${Math.round(delay)}ms`);
        await new Promise((r) => setTimeout(r, delay));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If response is OK or non-retryable status, return immediately
      if (response.ok || !RETRYABLE_STATUS_CODES.has(response.status)) {
        return response;
      }

      // Retryable status — store response and continue loop
      lastResponse = response;
      console.warn(
        `[${label}] Retryable status ${response.status} on attempt ${attempt + 1}`
      );

      // Consume body to avoid resource leak
      await response.text();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        lastError = new Error(`Request timed out after ${timeoutMs}ms`);
        console.warn(`[${label}] Timeout on attempt ${attempt + 1}`);
      } else {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`[${label}] Fetch error on attempt ${attempt + 1}:`, lastError.message);
      }
    }
  }

  // All retries exhausted — throw or return the last response
  if (lastResponse) {
    return lastResponse;
  }

  throw lastError || new Error(`[${label}] All ${maxRetries + 1} attempts failed`);
}

/**
 * Creates a structured error object for consistent edge function error responses.
 */
export function structuredError(
  message: string,
  code: string,
  retryable: boolean
): StructuredError {
  return { error: message, code, retryable };
}

/**
 * Maps common AI gateway HTTP status codes to structured error responses.
 */
export function mapGatewayError(status: number, body?: string): StructuredError {
  switch (status) {
    case 429:
      return structuredError(
        "Rate limit exceeded. Please try again shortly.",
        "RATE_LIMITED",
        true
      );
    case 402:
      return structuredError(
        "AI credits exhausted. Please add credits in workspace settings.",
        "CREDITS_EXHAUSTED",
        false
      );
    case 408:
      return structuredError(
        "Request timed out. Please try again.",
        "TIMEOUT",
        true
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return structuredError(
        "AI service temporarily unavailable. Please try again.",
        "SERVICE_UNAVAILABLE",
        true
      );
    default:
      return structuredError(
        body || "AI processing failed.",
        "AI_ERROR",
        false
      );
  }
}

/**
 * Standardized CORS headers for all edge functions.
 */
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Convenience: create a JSON error Response with CORS headers.
 */
export function errorResponse(
  err: StructuredError,
  status: number
): Response {
  return new Response(JSON.stringify(err), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Handle a non-OK AI gateway response: log it, map to structured error, and return a Response.
 */
export async function handleGatewayErrorResponse(
  response: Response,
  label: string
): Promise<Response> {
  const body = await response.text();
  console.error(`[${label}] AI gateway error ${response.status}:`, body);
  const err = mapGatewayError(response.status, body);
  return errorResponse(err, response.status);
}
