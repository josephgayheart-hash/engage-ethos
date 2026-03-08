import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Show a destructive toast for an error.
 * Extracts a human-readable message from Error objects, Supabase errors, or strings.
 */
export function toastError(title: string, error: unknown): void {
  const message = getErrorMessage(error);
  console.error(`[${title}]`, error);
  toast({
    variant: "destructive",
    title,
    description: message,
  });
}

/**
 * Show a success toast (convenience wrapper).
 */
export function toastSuccess(title: string, description?: string): void {
  toast({ title, description });
}

/**
 * Extract a user-friendly message from an unknown error value.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
    if (typeof e.error_description === "string") return e.error_description;
    if (typeof e.msg === "string") return e.msg;
  }
  return "An unexpected error occurred.";
}

/**
 * Wrap an async operation with automatic error toasting.
 * Returns the result on success, or undefined on failure.
 *
 * Usage:
 *   const data = await withErrorToast("Saving failed", async () => {
 *     const { data, error } = await supabase.from("x").insert(row);
 *     if (error) throw error;
 *     return data;
 *   });
 */
export async function withErrorToast<T>(
  errorTitle: string,
  fn: () => Promise<T>
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (err) {
    toastError(errorTitle, err);
    return undefined;
  }
}

/**
 * Resilient wrapper around supabase.functions.invoke().
 * - Retries once on 500/503 errors
 * - Surfaces user-friendly toast messages
 * - Returns { data, error } shape matching Supabase conventions
 */
export async function resilientInvoke<T = unknown>(
  functionName: string,
  options: { body?: Record<string, unknown> } = {},
  config: { maxRetries?: number; toastOnError?: boolean } = {}
): Promise<{ data: T | null; error: string | null }> {
  const { maxRetries = 1, toastOnError = true } = config;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = 1000 * Math.pow(2, attempt - 1) + Math.random() * 500;
        await new Promise((r) => setTimeout(r, delay));
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: options.body,
      });

      if (error) {
        // Check if it's a retryable server error
        const isRetryable =
          error.message?.includes("500") ||
          error.message?.includes("503") ||
          error.message?.includes("502") ||
          error.message?.includes("504");

        if (isRetryable && attempt < maxRetries) {
          console.warn(
            `[resilientInvoke] ${functionName} attempt ${attempt + 1} failed (retryable): ${error.message}`
          );
          continue;
        }

        const message = error.message || "Request failed";
        if (toastOnError) {
          toastError(`${functionName} failed`, message);
        }
        return { data: null, error: message };
      }

      // Check for application-level errors in the response body
      if (data?.error) {
        const appError = data as { error: string; code?: string; retryable?: boolean };
        if (appError.retryable && attempt < maxRetries) {
          console.warn(
            `[resilientInvoke] ${functionName} attempt ${attempt + 1} returned retryable error: ${appError.error}`
          );
          continue;
        }

        if (toastOnError) {
          toastError(`${functionName} failed`, appError.error);
        }
        return { data: null, error: appError.error };
      }

      return { data: data as T, error: null };
    } catch (err) {
      if (attempt < maxRetries) {
        console.warn(
          `[resilientInvoke] ${functionName} attempt ${attempt + 1} threw:`,
          err
        );
        continue;
      }

      const message = getErrorMessage(err);
      if (toastOnError) {
        toastError(`${functionName} failed`, message);
      }
      return { data: null, error: message };
    }
  }

  return { data: null, error: "All retry attempts failed" };
}
