import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Image, FileText } from 'lucide-react';
import type { ExternalAsset } from '@/types/library';
import { getPlatformLabel, getPlatformColor, isDirectImageUrl } from '@/lib/assetPlatform';

interface AssetCardProps {
  asset: ExternalAsset;
  onRemove?: () => void;
  compact?: boolean;
}

export function AssetCard({ asset, onRemove, compact }: AssetCardProps) {
  const thumbnailSrc = asset.thumbnail_url || (isDirectImageUrl(asset.url) ? asset.url : null);
  const platformLabel = getPlatformLabel(asset.type);
  const platformColor = getPlatformColor(asset.type);

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow">
      {/* Thumbnail area */}
      <div className={`relative bg-muted ${compact ? 'h-28' : 'h-36'} flex items-center justify-center overflow-hidden`}>
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={asset.label}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`flex flex-col items-center gap-2 text-muted-foreground ${thumbnailSrc ? 'hidden' : ''}`}>
          {isDirectImageUrl(asset.url) ? (
            <Image className="w-8 h-8" />
          ) : (
            <FileText className="w-8 h-8" />
          )}
          <span className="text-xs">{platformLabel}</span>
        </div>

        {/* Platform badge */}
        <Badge className={`absolute top-2 left-2 text-[10px] px-1.5 py-0.5 ${platformColor}`}>
          {platformLabel}
        </Badge>
      </div>

      <CardContent className="p-3">
        <p className="text-sm font-medium truncate">{asset.label}</p>
        {asset.notes && !compact && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{asset.notes}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={() => window.open(asset.url, '_blank', 'noopener')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Open in {platformLabel}
          </Button>
          {onRemove && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={onRemove}>
              Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
