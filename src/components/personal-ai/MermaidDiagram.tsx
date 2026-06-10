import { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Copy, Download, Code as CodeIcon, Eye, Check, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

let initialized = false;
function ensureInit() {
  if (initialized) return;
  initialized = true;
  const isDark = document.documentElement.classList.contains("dark");
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? "dark" : "neutral",
    securityLevel: "strict",
    fontFamily: "inherit",
    flowchart: { curve: "basis", htmlLabels: true },
  });
}

interface Props {
  source: string;
  title?: string;
  className?: string;
}

export function MermaidDiagram({ source, title, className }: Props) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"preview" | "source">("preview");
  const [copied, setCopied] = useState(false);
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        ensureInit();
        const { svg } = await mermaid.render(`m-${id}`, source.trim());
        if (!cancelled) {
          setSvg(svg);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to render diagram");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source, id]);

  // Auto-promote large/complex diagrams to the right-side canvas on first render.
  const promotedRef = useRef(false);
  useEffect(() => {
    if (promotedRef.current) return;
    const lines = source.trim().split("\n").length;
    const isComplex =
      source.length > 1400 ||
      lines > 28 ||
      (source.match(/subgraph/gi)?.length ?? 0) >= 3 ||
      (source.match(/participant\s/gi)?.length ?? 0) >= 5;
    if (isComplex) {
      promotedRef.current = true;
      window.dispatchEvent(new CustomEvent("personal-ai:open-canvas", { detail: { kind: "mermaid", source, title } }));
    }
  }, [source, title]);

  const openInCanvas = () => {
    window.dispatchEvent(new CustomEvent("personal-ai:open-canvas", { detail: { kind: "mermaid", source, title } }));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "diagram").replace(/[^a-z0-9-_]+/gi, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = async () => {
    try {
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = url;
      });
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = (img.naturalWidth || 800) * scale;
      canvas.height = (img.naturalHeight || 600) * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `${(title || "diagram").replace(/[^a-z0-9-_]+/gi, "-")}.png`;
        a.click();
      }, "image/png");
    } catch {
      // fall back to SVG
      download();
    }
  };

  return (
    <div className={cn("my-3 rounded-xl border border-border/60 bg-card overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-1.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          <span>{title || "Diagram"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setView(view === "preview" ? "source" : "preview")}
          >
            {view === "preview" ? <CodeIcon className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={copy} title="Copy source">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={downloadPng} title="Download PNG">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="p-3">
        {view === "preview" ? (
          error ? (
            <div className="text-xs text-destructive">
              <div className="font-medium mb-1">Couldn't render this diagram.</div>
              <div className="text-muted-foreground">{error}</div>
              <pre className="mt-2 overflow-x-auto rounded bg-muted/60 p-2 text-[11px]">{source}</pre>
            </div>
          ) : (
            <div
              ref={ref}
              className="flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )
        ) : (
          <pre className="overflow-x-auto rounded bg-muted/60 p-3 text-[12px] leading-snug">{source}</pre>
        )}
      </div>
    </div>
  );
}
