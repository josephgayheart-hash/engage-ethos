import type { AssetPlatform } from '@/types/library';

export function detectPlatform(url: string): AssetPlatform {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('canva.com')) return 'canva';
    if (hostname.includes('brandfolder.com')) return 'brandfolder';
    if (hostname.includes('bynder.com')) return 'bynder';
    if (hostname.includes('drive.google.com') || hostname.includes('docs.google.com')) return 'google-drive';
    if (hostname.includes('figma.com')) return 'figma';
    if (hostname.includes('dropbox.com')) return 'dropbox';
  } catch {
    // invalid URL
  }
  return 'other';
}

export function isDirectImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|svg|webp|bmp|ico)(\?.*)?$/i.test(url);
}

export function getPlatformLabel(type: AssetPlatform): string {
  const labels: Record<AssetPlatform, string> = {
    canva: 'Canva',
    brandfolder: 'Brandfolder',
    bynder: 'Bynder',
    'google-drive': 'Google Drive',
    figma: 'Figma',
    dropbox: 'Dropbox',
    other: 'Link',
  };
  return labels[type];
}

export function getPlatformColor(type: AssetPlatform): string {
  const colors: Record<AssetPlatform, string> = {
    canva: 'bg-[hsl(262,52%,47%)] text-white',
    brandfolder: 'bg-[hsl(210,80%,50%)] text-white',
    bynder: 'bg-[hsl(200,100%,40%)] text-white',
    'google-drive': 'bg-[hsl(45,93%,47%)] text-foreground',
    figma: 'bg-[hsl(340,75%,55%)] text-white',
    dropbox: 'bg-[hsl(210,80%,50%)] text-white',
    other: 'bg-muted text-muted-foreground',
  };
  return colors[type];
}
