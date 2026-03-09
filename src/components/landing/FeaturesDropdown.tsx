import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, MessageSquare, BarChart3, Target, PenTool, BookOpen, Image, Palette, Bot, Globe, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const featureLinks = [
  { icon: MessageSquare, label: 'Message Builder', to: '/features/message-builder' },
  { icon: BarChart3, label: 'Content DNA Studio', to: '/features/content-dna' },
  { icon: Image, label: 'AI Image Studio', to: '/features/image-studio' },
  { icon: Palette, label: 'Brand It Studio', to: '/features/brand-studio' },
  { icon: Bot, label: 'AI Copywriter', to: '/features/ai-copywriter' },
  { icon: Target, label: 'Journey Designer', to: '/features/journey-designer' },
  { icon: PenTool, label: 'Evaluator', to: '/features/evaluate' },
  { icon: Globe, label: 'WebCrawl', to: '/features/webcrawl' },
  { icon: BookOpen, label: 'Library', to: '/features/library' },
  { icon: BarChart, label: 'Brand Audit', to: '/features/brand-audit' },
];

export function FeaturesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <Button
        variant="ghost"
        size="sm"
        className="text-white/70 hover:text-white hover:bg-white/10"
        onClick={() => setOpen(!open)}
      >
        Features
        <ChevronDown className={`ml-1 h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border border-white/10 bg-[hsl(222_47%_15%)] backdrop-blur-xl shadow-2xl p-2 z-50 animate-fade-in">
          {featureLinks.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <f.icon className="w-4 h-4 text-[hsl(82_85%_55%)]" />
              {f.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
