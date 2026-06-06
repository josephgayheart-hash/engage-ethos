import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import PptxGenJS from "https://esm.sh/pptxgenjs@3.12.0";
import { corsHeaders } from "../_shared/resilience.ts";

type Stat = { value: string; label: string; sublabel?: string };
type ColumnContent = { heading?: string; bullets?: string[]; body?: string };
type Slide = {
  layout?: "title" | "bullets" | "two_column" | "stat" | "quote" | "image";
  title?: string;
  subtitle?: string;
  bullets?: string[];
  body?: string;
  image_url?: string;
  image_caption?: string;
  stats?: Stat[];
  quote?: string;
  attribution?: string;
  left?: ColumnContent;
  right?: ColumnContent;
  notes?: string;
};

const hex = (s: string | undefined, fallback: string) =>
  (typeof s === "string" && /^#?[0-9a-f]{6}$/i.test(s)) ? s.replace("#", "").toUpperCase() : fallback;

// Fetch a remote image and return {data, ext} for pptxgenjs base64 embed.
async function fetchImage(url: string): Promise<{ data: string; ext: string } | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const ct = (r.headers.get("content-type") || "image/png").split(";")[0].trim();
    const ext = ct.includes("jpeg") || ct.includes("jpg") ? "jpeg"
              : ct.includes("png") ? "png"
              : ct.includes("svg") ? "svg+xml"
              : ct.includes("gif") ? "gif"
              : ct.includes("webp") ? "webp" : "png";
    const buf = new Uint8Array(await r.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    const b64 = btoa(bin);
    return { data: `data:image/${ext};base64,${b64}`, ext };
  } catch (e) {
    console.warn("fetchImage failed", url, e);
    return null;
  }
}

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
    const slides: Slide[] = Array.isArray(body.slides) ? body.slides.slice(0, 30) : [];
    const theme = body.theme || {};

    // Brand defaults: fall back to user's tenant if model didn't pass them
    let brandAccent = hex(theme.accent, "");
    let brandSecondary = hex(theme.secondary, "");
    let brandLogoUrl: string | null = typeof theme.logo_url === "string" ? theme.logo_url : null;
    if (!brandAccent || !brandLogoUrl) {
      const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", uid).maybeSingle();
      if (prof?.tenant_id) {
        const { data: t } = await supabase
          .from("tenants")
          .select("logo_url,primary_color,accent_color")
          .eq("id", prof.tenant_id)
          .maybeSingle();
        if (t) {
          if (!brandAccent) brandAccent = hex(t.primary_color, "0E2A47");
          if (!brandSecondary) brandSecondary = hex(t.accent_color, "C9A24D");
          if (!brandLogoUrl) brandLogoUrl = t.logo_url || null;
        }
      }
    }
    if (!brandAccent) brandAccent = "0E2A47";
    if (!brandSecondary) brandSecondary = "C9A24D";

    const fontHead = (theme.fontHead || "Calibri").toString().slice(0, 40);
    const fontBody = (theme.fontBody || "Calibri").toString().slice(0, 40);

    // Pre-fetch logo + all slide images in parallel
    const [logoImg, ...slideImgs] = await Promise.all([
      brandLogoUrl ? fetchImage(brandLogoUrl) : Promise.resolve(null),
      ...slides.map((s) => (s.image_url ? fetchImage(s.image_url) : Promise.resolve(null))),
    ]);

    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
    pptx.author = author || "CampusVoice";
    pptx.title = title;

    const W = 13.333;
    const H = 7.5;

    // Per-slide chrome: thin accent bar + logo + page number + footer title
    const addChrome = (slide: any, pageNum: number) => {
      slide.addShape("rect", { x: 0, y: 0, w: W, h: 0.18, fill: { color: brandAccent } });
      if (logoImg) {
        slide.addImage({ data: logoImg.data, x: 12.45, y: 6.85, w: 0.7, h: 0.45, sizing: { type: "contain", w: 0.7, h: 0.45 } });
      }
      slide.addText(title, {
        x: 0.5, y: 7.05, w: 8.5, h: 0.3,
        fontFace: fontBody, fontSize: 10, color: "888888",
      });
      slide.addText(`${pageNum}`, {
        x: 11.5, y: 7.05, w: 0.6, h: 0.3,
        fontFace: fontBody, fontSize: 10, color: "888888", align: "right",
      });
    };

    // ===== Cover slide =====
    const cover = pptx.addSlide();
    cover.background = { color: brandAccent };
    cover.addShape("rect", { x: 0, y: 6.7, w: W, h: 0.8, fill: { color: brandSecondary } });
    if (logoImg) {
      cover.addImage({ data: logoImg.data, x: 0.6, y: 0.55, w: 1.6, h: 0.9, sizing: { type: "contain", w: 1.6, h: 0.9 } });
    }
    cover.addText(title, {
      x: 0.6, y: 2.8, w: 12.1, h: 2.2,
      fontFace: fontHead, fontSize: 54, bold: true, color: "FFFFFF",
    });
    if (subtitle) {
      cover.addText(subtitle, {
        x: 0.6, y: 5.1, w: 12.1, h: 1.0,
        fontFace: fontBody, fontSize: 22, color: "FFFFFF", transparency: 15,
      });
    }
    if (author) {
      cover.addText(author, {
        x: 0.6, y: 6.85, w: 12.1, h: 0.5,
        fontFace: fontBody, fontSize: 14, color: "FFFFFF",
      });
    }

    // ===== Content slides =====
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };
      const pageNum = i + 2;

      const layout = s.layout || (s.stats?.length ? "stat"
                                : s.quote ? "quote"
                                : s.image_url ? "image"
                                : s.left || s.right ? "two_column"
                                : "bullets");

      // ----- TITLE / section divider -----
      if (layout === "title") {
        slide.background = { color: brandAccent };
        slide.addShape("rect", { x: 0.6, y: 3.0, w: 0.9, h: 0.15, fill: { color: brandSecondary } });
        slide.addText(s.title || "", {
          x: 0.6, y: 3.3, w: 12.1, h: 2.0,
          fontFace: fontHead, fontSize: 52, bold: true, color: "FFFFFF",
        });
        if (s.subtitle || s.body) {
          slide.addText(s.subtitle || s.body || "", {
            x: 0.6, y: 5.3, w: 12.1, h: 1.5,
            fontFace: fontBody, fontSize: 22, color: "FFFFFF", transparency: 20,
          });
        }
        if (logoImg) slide.addImage({ data: logoImg.data, x: 0.6, y: 0.6, w: 1.4, h: 0.8, sizing: { type: "contain", w: 1.4, h: 0.8 } });
        if (s.notes) slide.addNotes(String(s.notes).slice(0, 4000));
        continue;
      }

      // ----- STAT callouts -----
      if (layout === "stat") {
        addChrome(slide, pageNum);
        slide.addText(s.title || "", {
          x: 0.6, y: 0.5, w: 12.1, h: 0.9,
          fontFace: fontHead, fontSize: 32, bold: true, color: "111111",
        });
        if (s.subtitle) {
          slide.addText(s.subtitle, {
            x: 0.6, y: 1.4, w: 12.1, h: 0.6,
            fontFace: fontBody, fontSize: 18, color: "666666",
          });
        }
        const stats = (s.stats || []).slice(0, 3);
        const count = Math.max(1, stats.length);
        const cardW = (12.1 - (count - 1) * 0.3) / count;
        stats.forEach((st, idx) => {
          const x = 0.6 + idx * (cardW + 0.3);
          slide.addShape("rect", {
            x, y: 2.4, w: cardW, h: 3.8,
            fill: { color: "F7F7F5" },
            line: { color: brandAccent, width: 0 },
          });
          slide.addShape("rect", { x, y: 2.4, w: cardW, h: 0.12, fill: { color: brandSecondary } });
          slide.addText(st.value, {
            x: x + 0.2, y: 2.8, w: cardW - 0.4, h: 1.8,
            fontFace: fontHead, fontSize: 80, bold: true, color: brandAccent, align: "center", valign: "middle",
          });
          slide.addText(st.label, {
            x: x + 0.2, y: 4.7, w: cardW - 0.4, h: 0.7,
            fontFace: fontBody, fontSize: 18, bold: true, color: "111111", align: "center",
          });
          if (st.sublabel) {
            slide.addText(st.sublabel, {
              x: x + 0.2, y: 5.4, w: cardW - 0.4, h: 0.7,
              fontFace: fontBody, fontSize: 13, color: "666666", align: "center",
            });
          }
        });
        if (s.body) {
          slide.addText(s.body, {
            x: 0.6, y: 6.4, w: 12.1, h: 0.6,
            fontFace: fontBody, fontSize: 14, color: "555555", italic: true,
          });
        }
        if (s.notes) slide.addNotes(String(s.notes).slice(0, 4000));
        continue;
      }

      // ----- QUOTE -----
      if (layout === "quote") {
        slide.background = { color: "F7F7F5" };
        addChrome(slide, pageNum);
        slide.addText("\u201C", {
          x: 0.6, y: 0.8, w: 1.5, h: 2.0,
          fontFace: fontHead, fontSize: 180, bold: true, color: brandSecondary,
        });
        slide.addText(s.quote || s.body || "", {
          x: 1.6, y: 1.8, w: 11.1, h: 3.5,
          fontFace: fontHead, fontSize: 32, italic: true, color: "111111", valign: "middle",
        });
        if (s.attribution) {
          slide.addShape("rect", { x: 1.6, y: 5.5, w: 0.4, h: 0.04, fill: { color: brandAccent } });
          slide.addText(`— ${s.attribution}`, {
            x: 2.1, y: 5.35, w: 10.6, h: 0.5,
            fontFace: fontBody, fontSize: 16, bold: true, color: brandAccent,
          });
        }
        if (s.notes) slide.addNotes(String(s.notes).slice(0, 4000));
        continue;
      }

      // ----- IMAGE hero -----
      if (layout === "image") {
        addChrome(slide, pageNum);
        slide.addText(s.title || "", {
          x: 0.6, y: 0.5, w: 12.1, h: 0.9,
          fontFace: fontHead, fontSize: 32, bold: true, color: "111111",
        });
        const img = slideImgs[i];
        if (img) {
          slide.addImage({ data: img.data, x: 0.6, y: 1.6, w: 12.1, h: 4.8, sizing: { type: "cover", w: 12.1, h: 4.8 } });
        } else {
          slide.addShape("rect", { x: 0.6, y: 1.6, w: 12.1, h: 4.8, fill: { color: "EEEEEE" } });
          slide.addText("(image)", { x: 0.6, y: 1.6, w: 12.1, h: 4.8, fontFace: fontBody, fontSize: 14, color: "999999", align: "center", valign: "middle" });
        }
        if (s.image_caption || s.body) {
          slide.addText(s.image_caption || s.body || "", {
            x: 0.6, y: 6.5, w: 12.1, h: 0.5,
            fontFace: fontBody, fontSize: 14, color: "555555", italic: true,
          });
        }
        if (s.notes) slide.addNotes(String(s.notes).slice(0, 4000));
        continue;
      }

      // ----- TWO COLUMN -----
      if (layout === "two_column") {
        addChrome(slide, pageNum);
        slide.addText(s.title || "", {
          x: 0.6, y: 0.5, w: 12.1, h: 0.9,
          fontFace: fontHead, fontSize: 30, bold: true, color: "111111",
        });
        const img = slideImgs[i];
        const drawCol = (col: ColumnContent | undefined, x: number) => {
          if (!col) return;
          let y = 1.7;
          if (col.heading) {
            slide.addShape("rect", { x, y, w: 0.3, h: 0.08, fill: { color: brandAccent } });
            slide.addText(col.heading, {
              x, y: y + 0.15, w: 5.8, h: 0.6,
              fontFace: fontHead, fontSize: 20, bold: true, color: brandAccent,
            });
            y += 0.85;
          }
          if (col.bullets?.length) {
            const items = col.bullets.slice(0, 8).map((b) => ({
              text: String(b).slice(0, 300),
              options: { bullet: { code: "25A0" }, fontFace: fontBody, fontSize: 16, color: "222222", paraSpaceAfter: 6 },
            }));
            slide.addText(items, { x, y, w: 5.8, h: 4.5, valign: "top" });
          } else if (col.body) {
            slide.addText(col.body, {
              x, y, w: 5.8, h: 4.5,
              fontFace: fontBody, fontSize: 16, color: "222222", valign: "top",
            });
          }
        };
        // If we have an image, render it on the right column area
        if (img && !s.right) {
          drawCol(s.left, 0.6);
          slide.addImage({ data: img.data, x: 6.9, y: 1.7, w: 5.8, h: 4.7, sizing: { type: "cover", w: 5.8, h: 4.7 } });
        } else {
          drawCol(s.left, 0.6);
          drawCol(s.right, 6.9);
        }
        if (s.notes) slide.addNotes(String(s.notes).slice(0, 4000));
        continue;
      }

      // ----- BULLETS (default) -----
      addChrome(slide, pageNum);
      slide.addShape("rect", { x: 0.6, y: 0.55, w: 0.4, h: 0.1, fill: { color: brandSecondary } });
      slide.addText(s.title || "", {
        x: 0.6, y: 0.75, w: 12.1, h: 0.9,
        fontFace: fontHead, fontSize: 34, bold: true, color: "111111",
      });
      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 0.6, y: 1.65, w: 12.1, h: 0.5,
          fontFace: fontBody, fontSize: 16, color: "666666",
        });
      }
      const bodyY = s.subtitle ? 2.3 : 1.9;
      if (Array.isArray(s.bullets) && s.bullets.length) {
        const items = s.bullets.slice(0, 8).map((b) => ({
          text: String(b).slice(0, 400),
          options: { bullet: { code: "25A0" }, fontFace: fontBody, fontSize: 22, color: "222222", paraSpaceAfter: 10 },
        }));
        slide.addText(items, { x: 0.9, y: bodyY, w: 11.5, h: 6.8 - bodyY, valign: "top" });
      } else if (s.body) {
        slide.addText(String(s.body).slice(0, 4000), {
          x: 0.9, y: bodyY, w: 11.5, h: 6.8 - bodyY,
          fontFace: fontBody, fontSize: 20, color: "222222", valign: "top",
        });
      }
      if (s.notes) slide.addNotes(String(s.notes).slice(0, 4000));
    }

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
      .createSignedUrl(path, 60 * 60 * 24 * 7);
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
