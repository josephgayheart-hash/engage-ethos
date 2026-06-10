import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { MermaidDiagram } from "./MermaidDiagram";
import { InlineSvg } from "./InlineSvg";

const HEX_RE = /(#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3}))\b/g;

function HexSwatch({ hex }: { hex: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 align-middle font-mono text-[12px] leading-none">
      <span
        className="h-3 w-3 rounded-sm border border-border/60 shadow-sm"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <span>{hex}</span>
    </span>
  );
}

function injectHex(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string") {
    if (!HEX_RE.test(node)) return node;
    HEX_RE.lastIndex = 0;
    const parts: React.ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = HEX_RE.exec(node)) !== null) {
      if (m.index > last) parts.push(node.slice(last, m.index));
      parts.push(<HexSwatch key={`h-${i++}`} hex={m[1]} />);
      last = m.index + m[1].length;
    }
    if (last < node.length) parts.push(node.slice(last));
    return parts;
  }
  if (Array.isArray(node)) return node.map((c, i) => <React.Fragment key={i}>{injectHex(c)}</React.Fragment>);
  if (React.isValidElement(node)) {
    // Don't recurse into code blocks / inline code / links / swatches
    const type = node.type as any;
    const tag = typeof type === "string" ? type : "";
    if (tag === "code" || tag === "pre" || tag === "a") return node;
    const children = (node.props as any)?.children;
    if (children == null) return node;
    return React.cloneElement(node, node.props as any, injectHex(children));
  }
  return node;
}

const Wrap =
  (Tag: keyof JSX.IntrinsicElements, className?: string) =>
  ({ node, children, ...props }: any) => (
    <Tag {...props} className={cn(className, props.className)}>
      {injectHex(children)}
    </Tag>
  );

interface Props {
  children: string;
  className?: string;
}

export function RichMarkdown({ children, className }: Props) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none text-[15px] leading-relaxed",
        "prose-p:my-3 prose-headings:mt-5 prose-headings:mb-2",
        "prose-strong:text-foreground prose-strong:font-semibold prose-em:text-foreground",
        "prose-pre:my-3 prose-pre:rounded-xl prose-pre:bg-muted prose-pre:text-foreground prose-pre:border prose-pre:border-border/60",
        "prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px]",
        "prose-li:my-1 prose-ul:my-3 prose-ol:my-3",
        "prose-blockquote:border-l-2 prose-blockquote:border-primary/40 prose-blockquote:bg-muted/40 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:not-italic prose-blockquote:text-foreground/90",
        "prose-hr:border-border/60",
        "prose-a:text-primary prose-a:underline-offset-2 hover:prose-a:underline",
        "prose-img:rounded-lg prose-img:border prose-img:border-border/60",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          p: Wrap("p"),
          li: Wrap("li"),
          h1: Wrap("h1"),
          h2: Wrap("h2"),
          h3: Wrap("h3"),
          h4: Wrap("h4"),
          h5: Wrap("h5"),
          h6: Wrap("h6"),
          strong: Wrap("strong"),
          em: Wrap("em"),
          td: Wrap("td", "border border-border/60 px-3 py-1.5 align-top"),
          th: Wrap("th", "border border-border/60 bg-muted px-3 py-1.5 text-left font-semibold"),
          table: ({ node, children, ...props }: any) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-border/60">
              <table {...props} className="w-full border-collapse text-[14px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ node, ...props }: any) => <thead {...props} className="bg-muted/60" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
