import DOMPurify from "dompurify";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Code as CodeIcon, Eye, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  source: string;
  title?: string;
  className?: string;
}

export function InlineSvg({ source, title, className }: Props) {
  const [view, setView] = useState<"preview" | "source">("preview");
  const [copied, setCopied] = useState(false);

  const cleaned = useMemo(() => {
    try {
      return DOMPurify.sanitize(source, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ["foreignObject"],
      });
    } catch {
      return "";
    }
  }, [source]);

  const copy = async () => {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "graphic").replace(/[^a-z0-9-_]+/gi, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!cleaned) return null;

  return (
    <div className={cn("my-3 rounded-xl border border-border/60 bg-card overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-1.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          <span>{title || "Graphic"}</span>
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
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={download}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="p-3">
        {view === "preview" ? (
          <div
            className="flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: cleaned }}
          />
        ) : (
          <pre className="overflow-x-auto rounded bg-muted/60 p-3 text-[12px] leading-snug">{source}</pre>
        )}
      </div>
    </div>
  );
}
