import { X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImpersonationBannerProps {
  targetUserEmail: string;
  onExit: () => void;
}

export function ImpersonationBanner({ targetUserEmail, onExit }: ImpersonationBannerProps) {
  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        <span className="text-sm font-medium">
          Viewing as: <strong>{targetUserEmail}</strong>
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onExit}
        className="text-amber-950 hover:bg-amber-600 hover:text-amber-950"
      >
        <X className="w-4 h-4 mr-1" />
        Exit Impersonation
      </Button>
    </div>
  );
}
