import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import ExcelJS from "https://esm.sh/exceljs@4.4.0";
import { corsHeaders } from "../_shared/resilience.ts";

type Cell = string | number | boolean | null;
type Sheet = {
  name?: string;
  headers?: string[];
  rows?: Cell[][];
  // Optional column widths in characters. If omitted, auto-sized from content.
  column_widths?: number[];
  // Optional freeze top row + header style. Default true when headers provided.
  freeze_header?: boolean;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const uid = userData?.user?.id;
    if (!uid) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const title: string = (body.title || "Workbook").toString().slice(0, 200);
    const author: string = (body.author || "").toString().slice(0, 120);
    const sheetsInput: Sheet[] = Array.isArray(body.sheets) && body.sheets.length
      ? body.sheets.slice(0, 20)
      : [{ name: "Sheet1", headers: body.headers, rows: body.rows }];

    // @ts-ignore esm types
    const wb = new ExcelJS.Workbook();
    wb.creator = author || "Compass";
    wb.created = new Date();

    sheetsInput.forEach((s, idx) => {
      const name = String(s.name || `Sheet${idx + 1}`).slice(0, 31).replace(/[\\/*?:[\]]/g, "");
      const ws = wb.addWorksheet(name || `Sheet${idx + 1}`, {
        views: [{ state: "frozen", ySplit: s.headers?.length ? 1 : 0 }],
      });

      const headers = Array.isArray(s.headers) ? s.headers.slice(0, 200).map(String) : [];
      const rows = Array.isArray(s.rows) ? s.rows.slice(0, 5000) : [];

      if (headers.length) {
        ws.addRow(headers);
        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
        headerRow.fill = {
          type: "pattern", pattern: "solid", fgColor: { argb: "FF1E2761" },
        };
        headerRow.alignment = { vertical: "middle", horizontal: "left" };
        headerRow.height = 22;
      }

      rows.forEach((r) => {
        const safe = (Array.isArray(r) ? r : []).slice(0, 200).map((c) => {
          if (c === null || c === undefined) return "";
          if (typeof c === "string" && c.length > 32000) return c.slice(0, 32000);
          return c as any;
        });
        ws.addRow(safe);
      });

      // Auto-size columns from sampled content (cap width 60).
      const colCount = Math.max(headers.length, ...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 1);
      for (let i = 1; i <= colCount; i++) {
        const col = ws.getColumn(i);
        if (s.column_widths && typeof s.column_widths[i - 1] === "number") {
          col.width = Math.min(Math.max(s.column_widths[i - 1], 6), 80);
          continue;
        }
        let max = 10;
        col.eachCell({ includeEmpty: false }, (cell) => {
          const v = cell.value == null ? "" : String(cell.value);
          const longest = v.split("\n").reduce((m, line) => Math.max(m, line.length), 0);
          if (longest > max) max = longest;
        });
        col.width = Math.min(max + 2, 60);
      }

      // Light banded rows for readability.
      if (headers.length && rows.length) {
        for (let r = 2; r <= rows.length + 1; r++) {
          if (r % 2 === 0) {
            ws.getRow(r).fill = {
              type: "pattern", pattern: "solid", fgColor: { argb: "FFF6F7FB" },
            };
          }
        }
        ws.autoFilter = {
          from: { row: 1, column: 1 },
          to: { row: 1, column: Math.max(headers.length, 1) },
        };
      }
    });

    const buf = await wb.xlsx.writeBuffer();

    const safeTitle = title.replace(/[^a-z0-9\-_ ]/gi, "").trim().replace(/\s+/g, "_").slice(0, 60) || "workbook";
    const filename = `${safeTitle}_${Date.now()}.xlsx`;
    const path = `${uid}/${filename}`;

    const { error: upErr } = await supabase.storage
      .from("compass-artifacts")
      .upload(path, new Uint8Array(buf as ArrayBuffer), {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upsert: false,
      });
    if (upErr) throw upErr;

    const { data: signed, error: signErr } = await supabase.storage
      .from("compass-artifacts")
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signErr) throw signErr;

    return new Response(JSON.stringify({
      url: signed.signedUrl,
      filename,
      sheet_count: sheetsInput.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("compass-generate-xlsx error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
