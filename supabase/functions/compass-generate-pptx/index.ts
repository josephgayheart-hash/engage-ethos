import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import PptxGenJS from "https://esm.sh/pptxgenjs@3.12.0";
import { corsHeaders } from "../_shared/resilience.ts";

type Slide = {
  title?: string;
  bullets?: string[];
  body?: string;
  notes?: string;
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
    const title: string = (body.title || "Untitled Deck").toString().slice(0, 200);
    const subtitle: string = (body.subtitle || "").toString().slice(0, 300);
    const author: string = (body.author || "").toString().slice(0, 120);
    const slides: Slide[] = Array.isArray(body.slides) ? body.slides.slice(0, 60) : [];
    const theme = body.theme || {};
    const accent = (typeof theme.accent === "string" && /^#[0-9a-f]{6}$/i.test(theme.accent)) ? theme.accent.replace("#", "") : "0E2A47";
    const fontHead = (theme.fontHead || "Calibri").toString().slice(0, 40);
    const fontBody = (theme.fontBody || "Calibri").toString().slice(0, 40);

    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5

    // Title slide
    const cover = pptx.addSlide();
    cover.background = { color: "FFFFFF" };
    cover.addShape("rect", { x: 0, y: 0, w: 13.333, h: 1.2, fill: { color: accent } });
    cover.addText(title, {
      x: 0.6, y: 2.6, w: 12.1, h: 1.8,
      fontFace: fontHead, fontSize: 48, bold: true, color: "111111",
    });
    if (subtitle) {
      cover.addText(subtitle, {
        x: 0.6, y: 4.3, w: 12.1, h: 1.2,
        fontFace: fontBody, fontSize: 22, color: "555555",
      });
    }
    if (author) {
      cover.addText(author, {
        x: 0.6, y: 6.6, w: 12.1, h: 0.5,
        fontFace: fontBody, fontSize: 14, color: "888888",
      });
    }

    for (const s of slides) {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };
      slide.addShape("rect", { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: accent } });
      if (s.title) {
        slide.addText(s.title, {
          x: 0.7, y: 0.4, w: 12.1, h: 1.0,
          fontFace: fontHead, fontSize: 32, bold: true, color: "111111",
        });
      }
      if (Array.isArray(s.bullets) && s.bullets.length) {
        const items = s.bullets.slice(0, 12).map((b) => ({
          text: String(b).slice(0, 400),
          options: { bullet: { code: "25A0" }, fontFace: fontBody, fontSize: 20, color: "222222", paraSpaceAfter: 8 },
        }));
        slide.addText(items, { x: 0.9, y: 1.6, w: 11.8, h: 5.4, valign: "top" });
      } else if (s.body) {
        slide.addText(String(s.body).slice(0, 4000), {
          x: 0.9, y: 1.6, w: 11.8, h: 5.4,
          fontFace: fontBody, fontSize: 20, color: "222222", valign: "top",
        });
      }
      if (s.notes) {
        slide.addNotes(String(s.notes).slice(0, 4000));
      }
    }

    // Write to Uint8Array
    const buf = (await pptx.write({ outputType: "uint8array" })) as Uint8Array;

    const safeTitle = title.replace(/[^a-z0-9\-_ ]/gi, "").trim().replace(/\s+/g, "_").slice(0, 60) || "deck";
    const filename = `${safeTitle}_${Date.now()}.pptx`;
    const path = `${uid}/${filename}`;

    const { error: upErr } = await supabase.storage
      .from("compass-artifacts")
      .upload(path, buf, {
        contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        upsert: false,
      });
    if (upErr) throw upErr;

    const { data: signed, error: signErr } = await supabase.storage
      .from("compass-artifacts")
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
    if (signErr) throw signErr;

    return new Response(JSON.stringify({
      url: signed.signedUrl,
      filename,
      slide_count: slides.length + 1,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("compass-generate-pptx error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
