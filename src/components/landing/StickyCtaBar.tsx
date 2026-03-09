import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';

export function StickyCtaBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const handleScroll = () => {
      // Show after scrolling past hero (~600px)
      setVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  if (dismissed || !visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in"
      style={{ animationDuration: '300ms' }}
    >
      <div
        className="backdrop-blur-xl border-t border-white/10 px-4 py-3"
        style={{ background: 'hsla(222, 47%, 14%, 0.92)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <p className="text-white/80 text-sm hidden sm:block">
            <span className="font-semibold text-white">Ready to transform your messaging?</span>{' '}
            Join institutions already using CampusVoice.
          </p>
          <p className="text-white/80 text-sm sm:hidden font-semibold">
            Get started with CampusVoice
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-[hsl(82_85%_55%)] to-[hsl(82_85%_45%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_40%)] shadow-[0_0_20px_hsl(82_85%_55%_/_0.3)] font-bold rounded-full px-5"
            >
              <Link to="/request-access">
                Get Early Access
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-full text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
