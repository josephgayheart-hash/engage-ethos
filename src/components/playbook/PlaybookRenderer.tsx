import { useState, useMemo, useRef } from "react";
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
} from "lucide-react";

interface PlaybookSection {
  title: string;
  content: string;
  type: 'briefing' | 'agenda' | 'email' | 'template' | 'checklist' | 'general';
}

interface BrandColors {
  primary?: string;
  secondary?: string;
  tertiary?: string;
}

// Fallback palette when no profile colors
const DEFAULT_PALETTE = [
  { border: '#1F2A44', bg: 'rgba(31,42,68,0.05)' },   // navy
  { border: '#2C7A7B', bg: 'rgba(44,122,123,0.06)' },  // teal
  { border: '#D69E2E', bg: 'rgba(214,158,46,0.05)' },  // amber
  { border: '#805AD5', bg: 'rgba(128,90,213,0.04)' },   // purple
  { border: '#38A169', bg: 'rgba(56,161,105,0.05)' },   // green
  { border: '#DD6B20', bg: 'rgba(221,107,32,0.04)' },   // orange
];

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function buildPalette(brand: BrandColors | undefined) {
  const colors: { border: string; bg: string }[] = [];
  const validColors = [brand?.primary, brand?.secondary, brand?.tertiary].filter(
    (c): c is string => !!c && c.length >= 4
  );

  if (validColors.length === 0) return DEFAULT_PALETTE;

  // Generate palette entries cycling through brand colors
  for (let i = 0; i < 6; i++) {
    const hex = validColors[i % validColors.length];
    colors.push({ border: hex, bg: hexToRgba(hex, 0.05) });
  }
  return colors;
}

const typeIcons: Record<PlaybookSection['type'], React.ReactNode> = {
  briefing: <FileText className="w-4 h-4" />,
  agenda: <ClipboardList className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  template: <MessageSquare className="w-4 h-4" />,
  checklist: <ClipboardList className="w-4 h-4" />,
  general: <FileText className="w-4 h-4" />,
};

const typeLabels: Record<PlaybookSection['type'], string> = {
  briefing: 'Briefing',
  agenda: 'Agenda',
  email: 'Email Draft',
  template: 'Template',
  checklist: 'Checklist',
  general: 'Section',
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

const markdownClasses = "prose prose-sm max-w-none dark:prose-invert [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h4]:text-xs [&_h4]:font-semibold [&_h4]:mt-2 [&_h4]:mb-1 [&_ul]:my-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-1.5 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:my-0.5 [&_li]:leading-relaxed [&_p]:my-1.5 [&_p]:leading-relaxed [&_strong]:text-foreground [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-3 [&_blockquote]:bg-muted/30 [&_blockquote]:py-2 [&_blockquote]:pr-3 [&_blockquote]:rounded-r-md [&_hr]:my-4 [&_hr]:border-border [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2";

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
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 gap-1 text-xs opacity-60 hover:opacity-100 print:hidden shrink-0">
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
  brandColors?: BrandColors;
  orgName?: string;
}

export const PlaybookRenderer = ({
  content,
  title,
  outputLanguage,
  outputLanguageLabel,
  translationToggle,
  brandColors,
  orgName,
}: PlaybookRendererProps) => {
  const { toast } = useToast();
  const [copiedAll, setCopiedAll] = useState(false);

  const sections = useMemo(() => parseIntoSections(content), [content]);
  const palette = useMemo(() => buildPalette(brandColors), [brandColors]);
  const headerColor = brandColors?.primary || '#1F2A44';

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(content);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast({ title: "Entire playbook copied" });
  };

  return (
    <div className="space-y-0">
      {/* Print Header — branded banner */}
      <div className="hidden print:block print:mb-6">
        <div
          className="px-6 py-4 rounded-t-lg"
          style={{ backgroundColor: headerColor, color: '#fff' }}
        >
          <h1 className="text-2xl font-bold font-serif">{title}</h1>
          {orgName && <p className="text-sm opacity-80 mt-0.5">{orgName}</p>}
          <p className="text-xs opacity-60 mt-1">
            Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div
          className="h-1.5"
          style={{ backgroundColor: brandColors?.secondary || brandColors?.primary || '#2C7A7B' }}
        />
      </div>

      {/* Screen Header */}
      <div
        className="rounded-lg px-5 py-4 mb-4 print:hidden"
        style={{ backgroundColor: headerColor }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-lg font-bold text-white">{title}</h2>
            {orgName && <p className="text-xs text-white/70 mt-0.5">{orgName}</p>}
          </div>
          <div className="flex items-center gap-1">
            {outputLanguage !== 'en' && outputLanguageLabel && (
              <Badge variant="secondary" className="text-xs">
                {outputLanguageLabel}
              </Badge>
            )}
            <Button variant="secondary" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs h-8">
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCopyAll} className="gap-1.5 text-xs h-8">
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedAll ? 'Copied' : 'Copy All'}
            </Button>
          </div>
        </div>
        {/* Accent stripe */}
        {brandColors?.secondary && (
          <div
            className="h-1 rounded-full mt-3 -mb-1 opacity-60"
            style={{ backgroundColor: brandColors.secondary }}
          />
        )}
      </div>

      {translationToggle && (
        <div className="mb-4 print:hidden">{translationToggle}</div>
      )}

      {/* Sections with branded color blocks */}
      <div className="space-y-3 print:space-y-4">
        {sections.map((section, idx) => {
          const color = palette[idx % palette.length];
          const icon = typeIcons[section.type];
          return (
            <div
              key={idx}
              className="rounded-lg overflow-hidden print:break-inside-avoid"
              style={{
                borderLeft: `4px solid ${color.border}`,
                backgroundColor: color.bg,
              }}
            >
              {/* Section header bar */}
              <div
                className="flex items-center justify-between gap-2 px-4 py-2"
                style={{ backgroundColor: hexToRgba(color.border, 0.1) }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span style={{ color: color.border }} className="print:hidden shrink-0">{icon}</span>
                  <h3
                    className="font-serif font-semibold text-sm truncate"
                    style={{ color: color.border }}
                  >
                    {section.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 shrink-0 print:hidden"
                    style={{ borderColor: color.border, color: color.border }}
                  >
                    {typeLabels[section.type]}
                  </Badge>
                </div>
                <SectionCopyButton text={section.content} />
              </div>
              {/* Section content */}
              <div className={`px-4 py-3 ${markdownClasses}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
