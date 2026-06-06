import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  LevelFormat, PageBreak,
} from "https://esm.sh/docx@8.5.0";
import { corsHeaders } from "../_shared/resilience.ts";

type Block =
  | { type: "heading1" | "heading2" | "heading3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "page_break" };

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
    const title: string = (body.title || "Untitled Document").toString().slice(0, 200);
    const subtitle: string = (body.subtitle || "").toString().slice(0, 300);
    const author: string = (body.author || "").toString().slice(0, 120);
    const blocks: Block[] = Array.isArray(body.blocks) ? body.blocks.slice(0, 400) : [];

    const children: Paragraph[] = [];

    // Title block
    children.push(new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: title, bold: true, size: 44 })],
    }));
    if (subtitle) {
      children.push(new Paragraph({
        children: [new TextRun({ text: subtitle, italics: true, size: 24, color: "555555" })],
        spacing: { after: 240 },
      }));
    }
    if (author) {
      children.push(new Paragraph({
        children: [new TextRun({ text: author, size: 20, color: "888888" })],
        spacing: { after: 360 },
      }));
    }

    for (const b of blocks) {
      if (!b || typeof b !== "object") continue;
      switch (b.type) {
        case "heading1":
          children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: String(b.text || "").slice(0, 500), bold: true })] }));
          break;
        case "heading2":
          children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: String(b.text || "").slice(0, 500), bold: true })] }));
          break;
        case "heading3":
          children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: String(b.text || "").slice(0, 500), bold: true })] }));
          break;
        case "paragraph":
          children.push(new Paragraph({
            children: [new TextRun({ text: String(b.text || "").slice(0, 8000) })],
            spacing: { after: 160 },
          }));
          break;
        case "quote":
          children.push(new Paragraph({
            children: [new TextRun({ text: String(b.text || "").slice(0, 4000), italics: true, color: "555555" })],
            indent: { left: 720 },
            spacing: { before: 160, after: 160 },
          }));
          break;
        case "bullets":
          if (Array.isArray(b.items)) {
            for (const it of b.items.slice(0, 100)) {
              children.push(new Paragraph({
                numbering: { reference: "bullets", level: 0 },
                children: [new TextRun({ text: String(it).slice(0, 2000) })],
              }));
            }
          }
          break;
        case "numbered":
          if (Array.isArray(b.items)) {
            for (const it of b.items.slice(0, 100)) {
              children.push(new Paragraph({
                numbering: { reference: "numbers", level: 0 },
                children: [new TextRun({ text: String(it).slice(0, 2000) })],
              }));
            }
          }
          break;
        case "page_break":
          children.push(new Paragraph({ children: [new PageBreak()] }));
          break;
      }
    }

    const doc = new Document({
      creator: author || "Compass",
      title,
      styles: {
        default: { document: { run: { font: "Calibri", size: 22 } } },
      },
      numbering: {
        config: [
          {
            reference: "bullets",
            levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
          },
          {
            reference: "numbers",
            levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
          },
        ],
      },
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      }],
    });

    const buf = await Packer.toBuffer(doc);

    const safeTitle = title.replace(/[^a-z0-9\-_ ]/gi, "").trim().replace(/\s+/g, "_").slice(0, 60) || "document";
    const filename = `${safeTitle}_${Date.now()}.docx`;
    const path = `${uid}/${filename}`;

    const { error: upErr } = await supabase.storage
      .from("compass-artifacts")
      .upload(path, new Uint8Array(buf), {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
      block_count: blocks.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("compass-generate-docx error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
