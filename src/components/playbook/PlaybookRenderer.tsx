import { useState, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  Check,
  Printer,
  Mail,
  ClipboardList,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PlaybookSection {
  title: string;
  content: string;
  type: 'briefing' | 'agenda' | 'email' | 'template' | 'checklist' | 'general';
}

const sectionStyles: Record<PlaybookSection['type'], { border: string; bg: string; icon: React.ReactNode; accent: string }> = {
  briefing: {
    border: 'border-l-4 border-l-primary',
    bg: 'bg-primary/[0.03]',
    icon: <FileText className="w-4 h-4 text-primary" />,
    accent: 'text-primary',
  },
  agenda: {
    border: 'border-l-4 border-l-accent',
    bg: 'bg-accent/[0.05]',
    icon: <ClipboardList className="w-4 h-4 text-accent" />,
    accent: 'text-accent',
  },
  email: {
    border: 'border-l-4 border-l-secondary',
    bg: 'bg-secondary/[0.06]',
    icon: <Mail className="w-4 h-4 text-secondary" />,
    accent: 'text-secondary',
  },
  template: {
    border: 'border-l-4 border-l-[hsl(var(--cyber-purple))]',
    bg: 'bg-[hsl(var(--cyber-purple))]/[0.04]',
    icon: <MessageSquare className="w-4 h-4 text-[hsl(var(--cyber-purple))]" />,
    accent: 'text-[hsl(var(--cyber-purple))]',
  },
  checklist: {
    border: 'border-l-4 border-l-[hsl(var(--status-strong))]',
    bg: 'bg-[hsl(var(--status-strong))]/[0.04]',
    icon: <ClipboardList className="w-4 h-4 text-[hsl(var(--status-strong))]" />,
    accent: 'text-[hsl(var(--status-strong))]',
  },
  general: {
    border: 'border-l-4 border-l-muted-foreground/30',
    bg: 'bg-muted/30',
    icon: <FileText className="w-4 h-4 text-muted-foreground" />,
    accent: 'text-muted-foreground',
  },
};

function classifySection(title: string): PlaybookSection['type'] {
  const lower = title.toLowerCase();
  if (lower.includes('email') || lower.includes('invite') || lower.includes('thank you') || lower.includes('reminder') || lower.includes('follow-up') || lower.includes('follow up') || lower.includes('nudge') || lower.includes('announcement') || lower.includes('notification') || lower.includes('message')) return 'email';
  if (lower.includes('agenda') || lower.includes('run sheet') || lower.includes('schedule') || lower.includes('time block')) return 'agenda';
  if (lower.includes('checklist') || lower.includes('planning') || lower.includes('rsvp') || lower.includes('tracking')) return 'checklist';
  if (lower.includes('template') || lower.includes('debrief') || lower.includes('report') || lower.includes('roi') || lower.includes('review') || lower.includes('assessment')) return 'template';
  if (lower.includes('briefing') || lower.includes('background') || lower.includes('talking point') || lower.includes('discussion') || lower.includes('value prop') || lower.includes('guide')) return 'briefing';
  return 'general';
}

function parseIntoSections(markdown: string): PlaybookSection[] {
  const lines = markdown.split('\n');
  const sections: PlaybookSection[] = [];
  let currentTitle = '';
  let currentLines: string[] = [];

  const flush = () => {
    if (currentTitle || currentLines.length > 0) {
      const content = currentLines.join('\n').trim();
      if (content) {
        sections.push({
          title: currentTitle || 'Overview',
          content,
          type: classifySection(currentTitle || content.slice(0, 100)),
        });
      }
    }
  };

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)/);
    const h1Match = line.match(/^#\s+(.+)/);
    if (h2Match || h1Match) {
      flush();
      currentTitle = (h2Match?.[1] || h1Match?.[1] || '').replace(/\*\*/g, '').trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  flush();
  return sections;
}

const markdownClasses = "prose prose-sm max-w-none dark:prose-invert [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h4]:text-xs [&_h4]:font-semibold [&_h4]:mt-2 [&_h4]:mb-1 [&_ul]:my-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-1.5 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:my-0.5 [&_li]:leading-relaxed [&_p]:my-1.5 [&_p]:leading-relaxed [&_strong]:text-foreground [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-3 [&_blockquote]:bg-muted/30 [&_blockquote]:py-2 [&_blockquote]:pr-3 [&_blockquote]:rounded-r-md [&_hr]:my-4 [&_hr]:border-border [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:bg-primary/[0.06] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2";

function SectionCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Section copied" });
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 gap-1 text-xs opacity-70 hover:opacity-100 print:hidden">
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
}

interface PlaybookRendererProps {
  content: string;
  title: string;
  outputLanguage: string;
  outputLanguageLabel?: string;
  translationToggle?: React.ReactNode;
}

export const PlaybookRenderer = ({
  content,
  title,
  outputLanguage,
  outputLanguageLabel,
  translationToggle,
}: PlaybookRendererProps) => {
  const { toast } = useToast();
  const [copiedAll, setCopiedAll] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const sections = parseIntoSections(content);

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(content);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast({ title: "Entire playbook copied" });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div ref={printRef} className="space-y-0">
      {/* Print Header — only visible on print */}
      <div className="hidden print:block print:mb-6">
        <div className="border-b-4 border-[hsl(var(--primary))] pb-4 mb-4">
          <h1 className="text-2xl font-bold font-serif text-[hsl(var(--primary))]">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Screen Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 print:hidden">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-lg font-bold text-foreground">{title}</h2>
          {outputLanguage !== 'en' && outputLanguageLabel && (
            <Badge variant="outline" className="gap-1 text-xs">
              {outputLanguageLabel}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyAll} className="gap-1.5 text-xs">
            {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAll ? 'Copied All' : 'Copy All'}
          </Button>
        </div>
      </div>

      {translationToggle && (
        <div className="mb-4 print:hidden">{translationToggle}</div>
      )}

      {/* Sections */}
      <div className="space-y-3 print:space-y-4">
        {sections.map((section, idx) => {
          const style = sectionStyles[section.type];
          return (
            <div
              key={idx}
              className={`rounded-lg ${style.border} ${style.bg} p-4 print:break-inside-avoid print:border-l-4 print:p-3`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="print:hidden">{style.icon}</span>
                  <h3 className={`font-serif font-semibold text-sm ${style.accent} print:text-[hsl(var(--primary))]`}>
                    {section.title}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 print:hidden">
                    {section.type}
                  </Badge>
                </div>
                <SectionCopyButton text={section.content} />
              </div>
              <div className={markdownClasses}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
