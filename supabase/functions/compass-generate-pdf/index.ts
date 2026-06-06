import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { jsPDF } from "https://esm.sh/jspdf@2.5.2";
import { corsHeaders } from "../_shared/resilience.ts";

type Block =
  | { type: "heading1" | "heading2" | "heading3" | "paragraph" | "quote"; text: string }
  | { type: "bullets" | "numbered"; items: string[] }
  | { type: "page_break" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { title = "Document", subtitle = "", author = "", blocks = [] } = await req.json() as {
      title?: string; subtitle?: string; author?: string; blocks?: Block[];
    };
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return new Response(JSON.stringify({ error: "blocks[] required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const uid = userData?.user?.id ?? "anon";

    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 56;
    const maxW = pageW - margin * 2;
    let y = margin;

    const ensure = (needed: number) => {
      if (y + needed > pageH - margin) { doc.addPage(); y = margin; }
    };

    const drawText = (text: string, opts: { size: number; bold?: boolean; color?: [number, number, number]; gapAfter?: number; indent?: number }) => {
      doc.setFont("helvetica", opts.bold ? "bold" : "normal");
      doc.setFontSize(opts.size);
      doc.setTextColor(...(opts.color ?? [17, 17, 17]));
      const indent = opts.indent ?? 0;
      const lines = doc.splitTextToSize(text, maxW - indent);
      for (const line of lines) {
        ensure(opts.size * 1.3);
        doc.text(line, margin + indent, y);
        y += opts.size * 1.3;
      }
      y += opts.gapAfter ?? 6;
    };

    // Title
    drawText(String(title).slice(0, 200), { size: 24, bold: true, gapAfter: 6 });
    if (subtitle) drawText(String(subtitle).slice(0, 300), { size: 13, color: [90, 90, 90], gapAfter: 4 });
    if (author) drawText(`By ${String(author).slice(0, 100)}`, { size: 10, color: [120, 120, 120], gapAfter: 14 });

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 18;

    for (const blk of blocks.slice(0, 500)) {
      if (!blk || typeof blk !== "object") continue;
      switch (blk.type) {
        case "heading1": drawText(String(blk.text || "").slice(0, 300), { size: 20, bold: true, gapAfter: 8 }); break;
        case "heading2": drawText(String(blk.text || "").slice(0, 300), { size: 16, bold: true, gapAfter: 6 }); break;
        case "heading3": drawText(String(blk.text || "").slice(0, 300), { size: 13, bold: true, gapAfter: 4 }); break;
        case "paragraph": drawText(String(blk.text || "").slice(0, 8000), { size: 11, gapAfter: 8 }); break;
        case "quote":
          doc.setDrawColor(180, 180, 180);
          ensure(40);
          {
            const startY = y - 4;
            drawText(String(blk.text || "").slice(0, 2000), { size: 11, color: [80, 80, 80], indent: 16, gapAfter: 10 });
            doc.line(margin + 4, startY, margin + 4, y - 8);
          }
          break;
        case "bullets":
          for (const it of (blk.items || []).slice(0, 200)) {
            const t = String(it || "").slice(0, 2000);
            drawText(`•  ${t}`, { size: 11, indent: 0, gapAfter: 2 });
          }
          y += 6;
          break;
        case "numbered":
          (blk.items || []).slice(0, 200).forEach((it, i) => {
            const t = String(it || "").slice(0, 2000);
            drawText(`${i + 1}.  ${t}`, { size: 11, indent: 0, gapAfter: 2 });
          });
          y += 6;
          break;
        case "page_break": doc.addPage(); y = margin; break;
      }
    }

    const pdfBytes = doc.output("arraybuffer");
    const safeName = String(title || "document").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60);
    const filename = `${safeName || "document"}.pdf`;
    const path = `${uid}/${Date.now()}-${filename}`;

    const { error: upErr } = await supabase.storage.from("compass-artifacts")
      .upload(path, new Blob([pdfBytes], { type: "application/pdf" }), {
        contentType: "application/pdf", upsert: false,
      });
    if (upErr) throw upErr;

    const { data: signed, error: signErr } = await supabase.storage
      .from("compass-artifacts").createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signErr) throw signErr;

    return new Response(JSON.stringify({ url: signed.signedUrl, filename, path }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-pdf error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
