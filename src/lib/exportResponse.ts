// Client-side exporters for Compass responses.
// Converts markdown into .md, .docx, .pptx, or .pdf and triggers a browser download.

import { marked, type Token, type Tokens } from "marked";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
} from "docx";
import jsPDF from "jspdf";

type Format = "md" | "docx" | "pptx" | "pdf";

const triggerDownload = (blob: Blob | string, filename: string) => {
  const url = typeof blob === "string" ? blob : URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  if (typeof blob !== "string") setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const safeName = (s: string) =>
  (s || "compass").replace(/[^\w\s-]/g, "").trim().slice(0, 60).replace(/\s+/g, "-") || "compass";

// ---------- Markdown ----------
function exportMarkdown(content: string, baseName: string) {
  triggerDownload(new Blob([content], { type: "text/markdown" }), `${baseName}.md`);
}

// ---------- Helpers: pull inline text from marked tokens ----------
function inlineText(tokens: Token[] | undefined): string {
  if (!tokens) return "";
  return tokens.map((t: any) => {
    if (t.type === "text") return t.text;
    if (t.type === "strong" || t.type === "em" || t.type === "del") return inlineText(t.tokens);
    if (t.type === "codespan") return t.text;
    if (t.type === "link") return inlineText(t.tokens);
    if (t.type === "br") return "\n";
    return t.raw || "";
  }).join("");
}

// ---------- DOCX ----------
function tokensToDocxParagraphs(tokens: Token[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  const headingFor = (depth: number): typeof HeadingLevel[keyof typeof HeadingLevel] => {
    switch (depth) {
      case 1: return HeadingLevel.HEADING_1;
      case 2: return HeadingLevel.HEADING_2;
      case 3: return HeadingLevel.HEADING_3;
      case 4: return HeadingLevel.HEADING_4;
      case 5: return HeadingLevel.HEADING_5;
      default: return HeadingLevel.HEADING_6;
    }
  };

  const inlineRuns = (toks: Token[] | undefined): TextRun[] => {
    if (!toks) return [new TextRun("")];
    const runs: TextRun[] = [];
    for (const t of toks as any[]) {
      if (t.type === "text") runs.push(new TextRun(t.text));
      else if (t.type === "strong") runs.push(new TextRun({ text: inlineText(t.tokens), bold: true }));
      else if (t.type === "em") runs.push(new TextRun({ text: inlineText(t.tokens), italics: true }));
      else if (t.type === "codespan") runs.push(new TextRun({ text: t.text, font: "Consolas" }));
      else if (t.type === "link") runs.push(new TextRun({ text: inlineText(t.tokens), style: "Hyperlink" }));
      else if (t.type === "br") runs.push(new TextRun({ text: "", break: 1 }));
      else if (t.raw) runs.push(new TextRun(t.raw));
    }
    return runs.length ? runs : [new TextRun("")];
  };

  for (const tok of tokens as any[]) {
    if (tok.type === "heading") {
      paragraphs.push(new Paragraph({ heading: headingFor(tok.depth), children: inlineRuns(tok.tokens) }));
    } else if (tok.type === "paragraph") {
      paragraphs.push(new Paragraph({ children: inlineRuns(tok.tokens), spacing: { after: 160 } }));
    } else if (tok.type === "blockquote") {
      const inner = (tok.tokens || []).map((t: any) => inlineText(t.tokens || [t])).join("\n");
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: inner, italics: true })], indent: { left: 360 } }));
    } else if (tok.type === "list") {
      const items: Tokens.ListItem[] = tok.items || [];
      items.forEach((item: any) => {
        const text = (item.tokens || []).map((t: any) => (t.tokens ? inlineText(t.tokens) : (t.text || ""))).join(" ").trim();
        paragraphs.push(new Paragraph({
          text,
          bullet: tok.ordered ? undefined : { level: 0 },
          numbering: tok.ordered ? undefined : undefined,
        }));
      });
    } else if (tok.type === "code") {
      const lines = String(tok.text || "").split("\n");
      lines.forEach((line) => paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line, font: "Consolas", size: 20 })],
      })));
    } else if (tok.type === "hr") {
      paragraphs.push(new Paragraph({ text: "" }));
    } else if (tok.type === "space") {
      paragraphs.push(new Paragraph({ text: "" }));
    } else if (tok.raw) {
      paragraphs.push(new Paragraph({ text: String(tok.raw).trim() }));
    }
  }
  return paragraphs;
}

async function exportDocx(content: string, baseName: string) {
  const tokens = marked.lexer(content);
  const doc = new Document({
    creator: "Compass",
    title: baseName,
    styles: {
      default: { document: { run: { font: "Calibri", size: 24 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: tokensToDocxParagraphs(tokens),
    }],
  });
  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${baseName}.docx`);
}

// ---------- PPTX ----------
// Split content into slides at every H1 / H2; fall back to one slide if no headings.
async function exportPptx(content: string, baseName: string) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
  pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
  pptx.title = baseName;

  const tokens = marked.lexer(content);

  type Slide = { title: string; bullets: string[]; paragraphs: string[] };
  const slides: Slide[] = [];
  let current: Slide | null = null;

  const ensure = (title = "Untitled") => {
    if (!current) { current = { title, bullets: [], paragraphs: [] }; slides.push(current); }
  };

  for (const tok of tokens as any[]) {
    if (tok.type === "heading" && (tok.depth === 1 || tok.depth === 2)) {
      current = { title: inlineText(tok.tokens) || "Untitled", bullets: [], paragraphs: [] };
      slides.push(current);
    } else if (tok.type === "heading") {
      ensure();
      current!.paragraphs.push(inlineText(tok.tokens));
    } else if (tok.type === "paragraph") {
      ensure();
      const text = inlineText(tok.tokens);
      if (text.trim()) current!.paragraphs.push(text);
    } else if (tok.type === "list") {
      ensure();
      for (const item of (tok.items || []) as any[]) {
        const text = (item.tokens || []).map((t: any) => (t.tokens ? inlineText(t.tokens) : (t.text || ""))).join(" ").trim();
        if (text) current!.bullets.push(text);
      }
    } else if (tok.type === "code") {
      ensure();
      current!.paragraphs.push(String(tok.text || ""));
    }
  }

  if (!slides.length) slides.push({ title: baseName, bullets: [], paragraphs: [content] });

  // Brand palette: navy + lime accent (Compass)
  const NAVY = "1E2761";
  const ACCENT = "CADCFC";
  const TEXT = "1A1A1A";

  slides.forEach((s, i) => {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };
    // Accent bar
    slide.addShape("rect" as any, { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: NAVY } });
    // Title
    slide.addText(s.title, {
      x: 0.6, y: 0.4, w: 12.2, h: 1.0,
      fontFace: "Calibri", fontSize: 32, bold: true, color: NAVY,
    });
    // Underline accent
    slide.addShape("line" as any, { x: 0.6, y: 1.35, w: 1.5, h: 0, line: { color: ACCENT, width: 3 } });

    // Body
    const body: any[] = [];
    s.paragraphs.forEach((p) => body.push({ text: p, options: { bullet: false, paraSpaceAfter: 8 } }));
    s.bullets.forEach((b) => body.push({ text: b, options: { bullet: { code: "2022" }, paraSpaceAfter: 6 } }));
    if (body.length) {
      slide.addText(body, {
        x: 0.6, y: 1.7, w: 12.2, h: 5.2,
        fontFace: "Calibri", fontSize: 18, color: TEXT, valign: "top",
      });
    }
    // Footer
    slide.addText(`${baseName} · ${i + 1}/${slides.length}`, {
      x: 0.6, y: 7.05, w: 12.2, h: 0.3, fontSize: 10, color: "888888", fontFace: "Calibri",
    });
  });

  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  triggerDownload(blob, `${baseName}.pptx`);
}

// ---------- PDF ----------
function exportPdf(content: string, baseName: string) {
  const tokens = marked.lexer(content);
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 54;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (h: number) => {
    if (y + h > pageH - margin) { doc.addPage(); y = margin; }
  };

  const writeBlock = (text: string, opts: { size?: number; bold?: boolean; indent?: number; bullet?: boolean } = {}) => {
    const { size = 11, bold = false, indent = 0, bullet = false } = opts;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxW - indent - (bullet ? 14 : 0));
    const lh = size * 1.35;
    for (const line of lines) {
      ensureSpace(lh);
      if (bullet) {
        doc.text("•", margin + indent, y);
        doc.text(line, margin + indent + 14, y);
      } else {
        doc.text(line, margin + indent, y);
      }
      y += lh;
    }
    y += size * 0.3;
  };

  for (const tok of tokens as any[]) {
    if (tok.type === "heading") {
      const sizes: Record<number, number> = { 1: 22, 2: 18, 3: 15, 4: 13, 5: 12, 6: 11 };
      y += 6;
      writeBlock(inlineText(tok.tokens), { size: sizes[tok.depth] || 12, bold: true });
    } else if (tok.type === "paragraph") {
      writeBlock(inlineText(tok.tokens));
    } else if (tok.type === "list") {
      for (const item of (tok.items || []) as any[]) {
        const text = (item.tokens || []).map((t: any) => (t.tokens ? inlineText(t.tokens) : (t.text || ""))).join(" ").trim();
        writeBlock(text, { bullet: true, indent: 8 });
      }
    } else if (tok.type === "blockquote") {
      const inner = (tok.tokens || []).map((t: any) => (t.tokens ? inlineText(t.tokens) : (t.text || ""))).join(" ");
      writeBlock(inner, { indent: 18 });
    } else if (tok.type === "code") {
      doc.setFont("courier", "normal");
      doc.setFontSize(10);
      const lines = String(tok.text || "").split("\n");
      for (const line of lines) {
        ensureSpace(13);
        doc.text(line, margin, y);
        y += 13;
      }
      y += 4;
    } else if (tok.type === "hr") {
      ensureSpace(12);
      doc.setDrawColor(200);
      doc.line(margin, y, pageW - margin, y);
      y += 12;
    } else if (tok.type === "space") {
      y += 6;
    }
  }

  doc.save(`${baseName}.pdf`);
}

// ---------- Public API ----------
export async function exportResponse(format: Format, content: string, titleHint?: string) {
  const base = safeName(titleHint || content.split("\n").find((l) => l.trim())?.replace(/^#+\s*/, "") || "compass");
  if (format === "md") return exportMarkdown(content, base);
  if (format === "docx") return exportDocx(content, base);
  if (format === "pptx") return exportPptx(content, base);
  if (format === "pdf") return exportPdf(content, base);
}
