import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, FlaskConical } from "lucide-react";

interface BetaBannerProps {
  variant?: 'full' | 'compact' | 'badge';
  className?: string;
}

export function BetaBanner({ variant = 'full', className = '' }: BetaBannerProps) {
  if (variant === 'badge') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 cursor-help ${className}`}
          >
            <FlaskConical className="w-3 h-3 mr-1" />
            Beta
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-sm">
            CampusVoice.AI is currently in beta. Features and functionality may change as we refine the platform based on feedback.
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center gap-2 py-2 px-4 bg-amber-50 border-b border-amber-200 ${className}`}>
        <FlaskConical className="w-4 h-4 text-amber-600" />
        <span className="text-sm text-amber-700 font-medium">Beta Release</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-amber-500 cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm">
              We welcome feedback as we refine CampusVoice.AI for higher education institutions.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-full">
          <FlaskConical className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-amber-800">Beta Release</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-amber-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm font-medium mb-1">What does beta mean?</p>
                <p className="text-sm text-muted-foreground">
                  Beta software is feature-complete but still being tested and refined. 
                  You may encounter occasional issues, and features may change based on feedback.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-amber-700">
            CampusVoice.AI is currently in beta. Features and functionality may change as we refine the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
