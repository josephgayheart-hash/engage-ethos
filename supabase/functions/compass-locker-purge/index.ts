import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/resilience.ts";

const BUCKET = "compass-artifacts";

type LockerRow = {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  storage_path: string | null;
  expires_at: string | null;
};

function partPaths(path: string, count: number) {
  return Array.from(
    { length: count },
    (_, i) => `${path}.part-${String(i).padStart(5, "0")}`,
  );
}

/** Storage paths belonging to a row, including chunked-upload parts. */
function pathsFor(row: LockerRow): string[] {
  if (!row.storage_path) return [];
  let partCount = 0;
  if (row.content) {
    try {
      const meta = JSON.parse(row.content);
      if (meta?.uploadStrategy === "parts" && typeof meta.partCount === "number") {
        partCount = meta.partCount;
      }
    } catch { /* not multipart metadata */ }
  }
  return partCount > 0 ? partPaths(row.storage_path, partCount) : [row.storage_path];
}

/**
 * Hard-deletes expired Compass Locker items: the stored objects are removed
 * from the storage backend AND the database rows are deleted, so nothing
 * survives past its retention window. Safe to call by anyone: it only ever
 * touches rows whose expires_at is already in the past and returns counts.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: expired, error } = await admin
      .from("compass_locker_items")
      .select("id, user_id, title, content, storage_path, expires_at")
      .not("expires_at", "is", null)
      .lt("expires_at", new Date().toISOString())
      .limit(500);

    if (error) throw error;

    const rows = (expired ?? []) as LockerRow[];
    if (rows.length === 0) {
      return new Response(JSON.stringify({ purged: 0, filesRemoved: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const objectPaths = rows.flatMap(pathsFor);
    let filesRemoved = 0;
    if (objectPaths.length) {
      // Remove in batches to stay well inside request limits.
      for (let i = 0; i < objectPaths.length; i += 100) {
        const batch = objectPaths.slice(i, i + 100);
        const { data: removed, error: rmErr } = await admin.storage.from(BUCKET).remove(batch);
        if (rmErr) {
          console.error("locker purge storage remove failed:", rmErr.message);
        } else {
          filesRemoved += removed?.length ?? 0;
        }
      }
    }

    const ids = rows.map((r) => r.id);
    const { error: delErr } = await admin.from("compass_locker_items").delete().in("id", ids);
    if (delErr) throw delErr;

    await admin.from("compass_locker_audit").insert(
      rows.map((r) => ({
        item_id: r.id,
        owner_id: r.user_id,
        actor_id: null,
        action: "purge_expired",
        file_name: r.title,
        detail: `Permanently deleted after expiry (${r.expires_at})`,
      })),
    );

    console.log(`[compass-locker-purge] purged ${rows.length} items, ${filesRemoved} objects`);

    return new Response(JSON.stringify({ purged: rows.length, filesRemoved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("compass-locker-purge error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Purge failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
