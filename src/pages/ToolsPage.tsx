import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PenTool,
  FileText,
  Map,
  Upload,
  Phone,
  MessageCircle,
  Search,
  Mic,
  ArrowRight,
  LayoutGrid,
  List,
  ImageIcon,
} from "lucide-react";

interface ToolItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const coreTools: ToolItem[] = [
  { id: 'build', title: 'Message Builder', description: 'Generate AI-powered messages for any channel', icon: PenTool, href: '/build' },
  { id: 'evaluate', title: 'Evaluate Message', description: 'Score content against persuasion frameworks', icon: FileText, href: '/evaluate' },
  { id: 'strategy', title: 'Journey Designer', description: 'Map multi-channel communication campaigns', icon: Map, href: '/strategy' },
  { id: 'byoc', title: 'Bring Your Own Comm', description: 'Import docs, PDFs & emails for evaluation', icon: Upload, href: '/byoc' },
];

const analysisTools: ToolItem[] = [
  { id: 'web-analyzer', title: 'Web Content Analyzer', description: 'Scan & score web pages for brand alignment', icon: Search, href: '/web-analyzer' },
  { id: 'brand-voice', title: 'Content DNA Scorer', description: 'Check brand voice alignment of any text', icon: Mic, href: '/brand-voice' },
];

const utilityTools: ToolItem[] = [
  { id: 'image-generator', title: 'Image Generator', description: 'Create on-brand campus photography with AI', icon: ImageIcon, href: '/image-generator' },
  { id: 'call-script', title: 'Call Scripts', description: 'Phone outreach scripts', icon: Phone, href: '/call-script' },
  { id: 'playground', title: 'AI Copywriter', description: 'AI-powered messaging playground', icon: MessageCircle, href: '/playground' },
];

function ToolGrid({ tools, label, compact }: { tools: ToolItem[]; label: string; compact: boolean }) {
  return (
    <section>
      <h2 className="section-header mb-4">{label}</h2>
      {compact ? (
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button key={tool.id} variant="outline" size="sm" asChild className="gap-1.5">
                <Link to={tool.href}>
                  <Icon className="w-4 h-4" />
                  {tool.title}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.id} to={tool.href}>
                <Card className="h-full cursor-pointer card-interactive group">
                  <CardContent className="p-4">
                    <div className="icon-container icon-container-md bg-muted mb-3 group-hover:bg-primary/10 transition-colors">
                      <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

const ToolsPage = () => {
  const [compact, setCompact] = useState(() => {
    try { return localStorage.getItem('campusvoice_tools_compact') === 'true'; } catch { return false; }
  });

  const toggleCompact = () => {
    const next = !compact;
    setCompact(next);
    try { localStorage.setItem('campusvoice_tools_compact', String(next)); } catch {}
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold mb-1">All Tools</h1>
              <p className="text-sm text-muted-foreground">Everything you need to create, analyze, and optimize communications.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCompact}
              className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7"
            >
              {compact ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
              {compact ? "Detailed" : "Compact"}
            </Button>
          </div>
          <ToolGrid tools={coreTools} label="Core Tools" compact={compact} />
          <ToolGrid tools={analysisTools} label="Analysis Tools" compact={compact} />
          <ToolGrid tools={utilityTools} label="Utility Tools" compact={compact} />
        </div>
      </main>
    </div>
  );
};

export default ToolsPage;
