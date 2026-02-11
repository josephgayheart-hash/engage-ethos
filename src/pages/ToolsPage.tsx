import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  PenTool,
  FileText,
  Map,
  Upload,
  Phone,
  MessageCircle,
  BarChart3,
  Calendar,
  Type,
  Eye,
  Mic,
  Monitor,
  TrendingUp,
  Languages,
  Search,
  Globe,
  Settings,
  Sparkles,
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
  { id: 'benchmarks', title: 'Performance Benchmarks', description: 'Compare to higher-ed industry metrics', icon: TrendingUp, href: '/benchmarks' },
  { id: 'email-preview', title: 'Email Preview', description: 'Preview across devices and clients', icon: Monitor, href: '/email-preview' },
];

const utilityTools: ToolItem[] = [
  { id: 'campaign-dashboard', title: 'Campaign Dashboard', description: 'Track campaign performance metrics', icon: BarChart3, href: '/campaign-dashboard' },
  { id: 'calendar', title: 'Communication Calendar', description: 'Plan and schedule messaging timelines', icon: Calendar, href: '/calendar' },
  { id: 'subject-optimizer', title: 'Subject Line Optimizer', description: 'Optimize email subject lines', icon: Type, href: '/subject-optimizer' },
  { id: 'accessibility', title: 'Accessibility Checker', description: 'Verify accessibility compliance', icon: Eye, href: '/accessibility' },
  { id: 'translate', title: 'Translation Tool', description: 'Multilingual messaging support', icon: Languages, href: '/translate' },
  { id: 'call-script', title: 'Call Scripts', description: 'Phone outreach scripts', icon: Phone, href: '/call-script' },
  { id: 'playground', title: 'AI Copywriter', description: 'AI-powered messaging playground', icon: MessageCircle, href: '/playground' },
];

function ToolGrid({ tools, label }: { tools: ToolItem[]; label: string }) {
  return (
    <section>
      <h2 className="section-header mb-4">{label}</h2>
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
    </section>
  );
}

const ToolsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div>
            <h1 className="font-serif text-2xl font-bold mb-1">All Tools</h1>
            <p className="text-sm text-muted-foreground">Everything you need to create, analyze, and optimize communications.</p>
          </div>
          <ToolGrid tools={coreTools} label="Core Tools" />
          <ToolGrid tools={analysisTools} label="Analysis Tools" />
          <ToolGrid tools={utilityTools} label="Utility Tools" />
        </div>
      </main>
    </div>
  );
};

export default ToolsPage;
