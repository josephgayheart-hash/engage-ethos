import { toast } from "@/hooks/use-toast";

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
