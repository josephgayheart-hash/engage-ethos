import { Link } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import campusvoiceLogo from '@/assets/campusvoice-logo-new.png';
import { FeaturesDropdown } from './FeaturesDropdown';
import { cn } from '@/lib/utils';

interface LandingNavProps {
  /** "dark" = nav sits on a dark band (default). "light" = nav sits on a light band. */
  tone?: 'dark' | 'light';
}

export function LandingNav({ tone = 'dark' }: LandingNavProps) {
  const isLight = tone === 'light';
  const linkClass = isLight
    ? 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
    : 'text-white/70 hover:text-white hover:bg-white/10';

  return (
    <nav className="relative z-20 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={campusvoiceLogo}
            alt="CampusVoice.AI"
            className={cn('h-8 w-auto max-w-[160px]', isLight ? '' : 'brightness-0 invert')}
          />
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <FeaturesDropdown tone={tone} />
          <Link to="/for-enterprise" className="hidden sm:block">
            <Button variant="ghost" size="sm" className={linkClass}>
              For Enterprise
            </Button>
          </Link>
          <Link to="/for-agencies" className="hidden sm:block">
            <Button variant="ghost" size="sm" className={linkClass}>
              For Agencies
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm" className={linkClass}>
              Sign In
            </Button>
          </Link>
          <Link to="/login?signup=1" className="hidden sm:block">
            <Button variant="ghost" size="sm" className={linkClass}>
              Create Account
            </Button>
          </Link>
          <Link to="/try-copywriter">
            <Button
              size="sm"
              className="bg-[hsl(216_100%_50%)] text-white hover:bg-[hsl(216_100%_45%)] font-semibold rounded-lg px-6 shadow-[0_8px_24px_-10px_hsl(216_100%_50%_/_0.6)] border-0"
            >
              Try It Free
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
