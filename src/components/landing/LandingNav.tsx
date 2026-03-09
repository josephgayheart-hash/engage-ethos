import { Link } from 'react-router-dom';
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
          <Link to="/" className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              For Universities
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
          <Link to="/request-access">
            <Button
              size="sm"
              className="bg-gradient-to-r from-[hsl(82_85%_55%)] to-[hsl(82_85%_45%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_40%)] font-bold rounded-full px-5"
            >
              Get Early Access
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
