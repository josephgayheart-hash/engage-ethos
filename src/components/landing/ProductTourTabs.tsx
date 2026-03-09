import { useState } from 'react';
import { Image, Palette, MessageSquare } from 'lucide-react';
import { ImageStudioShowcase, BrandStudioShowcase, AICopywriterShowcase } from '@/components/landing/ProductShowcases';

const tabs = [
  { key: 'image', label: 'AI Image Studio', icon: Image },
  { key: 'brand', label: 'Brand Studio', icon: Palette },
  { key: 'copywriter', label: 'AI Copywriter', icon: MessageSquare },
];

export default function ProductTourTabs() {
  const [active, setActive] = useState('image');

  return (
    <div className="space-y-10">
      {/* Tab bar */}
      <div className="flex justify-center">
        <div className="inline-flex gap-1 p-1 rounded-full bg-muted/60 border border-border/50">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                active === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active showcase */}
      <div className="transition-opacity duration-300">
        {active === 'image' && <ImageStudioShowcase />}
        {active === 'brand' && <BrandStudioShowcase />}
        {active === 'copywriter' && <AICopywriterShowcase />}
      </div>
    </div>
  );
}
