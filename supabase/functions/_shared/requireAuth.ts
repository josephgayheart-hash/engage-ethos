// Shared JWT auth helper for edge functions that should NOT be open to the public.
// Returns { userId } on success, or a 401 Response on failure.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export type AuthOk = { userId: string; token: string };
export type AuthResult = AuthOk | { error: Response };

export async function requireAuth(
  req: Request,
  cors: Record<string, string>,
): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return {
      error: new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...cors, "Content-Type": "application/json" } },
      ),
    };
  }

  const token = authHeader.replace(/^[Bb]earer\s+/, "").trim();
  if (!token) {
    return {
      error: new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...cors, "Content-Type": "application/json" } },
      ),
    };
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.id) {
      return {
        error: new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...cors, "Content-Type": "application/json" } },
        ),
      };
    }
    return { userId: data.user.id, token };
  } catch (_e) {
    return {
      error: new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...cors, "Content-Type": "application/json" } },
      ),
    };
  }
}

// Optional helper: ensure caller has a specific role via the has_role() RPC.
export async function callerHasRole(
  token: string,
  role: "admin" | "super_admin" | "agency_admin" | "agency_user" | "approver",
): Promise<boolean> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: userData } = await supabase.auth.getUser(token);
    const uid = userData?.user?.id;
    if (!uid) return false;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", role)
      .maybeSingle();
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}
