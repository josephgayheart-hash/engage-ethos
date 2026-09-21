import { Link } from '@/lib/router-compat';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, MessageSquare, BarChart3, Target, BookOpen, Bot, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

const featureLinks = [
  { icon: MessageSquare, label: 'Message Builder', to: '/features/message-builder' },
  { icon: BarChart3, label: 'Content DNA Studio', to: '/features/content-dna' },
  { icon: Bot, label: 'AI Copywriter', to: '/features/ai-copywriter' },
  { icon: Target, label: 'Journey Designer', to: '/features/journey-designer' },
  { icon: BookOpen, label: 'Library', to: '/features/library' },
  { icon: Layers, label: 'More Capabilities', to: '/features' },
];

interface FeaturesDropdownProps {
  tone?: 'dark' | 'light';
}

export function FeaturesDropdown({ tone = 'dark' }: FeaturesDropdownProps) {
  const isLight = tone === 'light';
  const triggerClass = isLight
    ? 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
    : 'text-white/70 hover:text-white hover:bg-white/10';
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
        className={triggerClass}
        onClick={() => setOpen(!open)}
      >
        Features
        <ChevronDown className={`ml-1 h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border shadow-2xl p-2 z-50 animate-fade-in backdrop-blur-xl ${isLight ? 'border-border bg-card' : 'border-white/10 bg-[hsl(60_4%_13%)]'}`}>
          {featureLinks.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isLight ? 'text-foreground/75 hover:text-foreground hover:bg-muted' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              <f.icon className="w-4 h-4 text-[hsl(216_100%_50%)]" />
              {f.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
