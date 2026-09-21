import { Link } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import campusvoiceLogo from '@/assets/campusvoice-logo-new.png';
import { FeaturesDropdown } from './FeaturesDropdown';

export function LandingNav() {
  return (
    <nav className="relative z-20 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={campusvoiceLogo}
            alt="CampusVoice.AI"
            className="h-8 w-auto max-w-[160px] brightness-0 invert"
          />
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <FeaturesDropdown />
          <Link to="/for-enterprise" className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              For Enterprise
            </Button>
          </Link>
          <Link to="/for-agencies" className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              For Agencies
            </Button>
          </Link>
          <Link to="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Sign In
            </Button>
          </Link>
          <Link to="/login?signup=1" className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
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
