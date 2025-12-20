/**
 * WaveBackground - A solid colored header with wave divider at bottom
 * Matches the landing page style with blurred sprite accents
 */
export function WaveBackground({ variant = 'teal' }: { variant?: 'teal' | 'amber' }) {
  const bgColor = variant === 'teal' 
    ? 'bg-[hsl(173_40%_92%)]' 
    : 'bg-[hsl(48_100%_92%)]';

  return (
    <div className={`absolute inset-0 ${bgColor}`}>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20" />
      
      {/* Blurred sprite accents - varied colors */}
      <div className="absolute top-8 right-[15%] w-32 h-32 bg-[hsl(270_70%_60%_/_0.15)] rounded-full blur-2xl" />
      <div className="absolute top-4 left-[10%] w-40 h-40 bg-[hsl(82_85%_55%_/_0.12)] rounded-full blur-3xl" />
      <div className="absolute top-12 left-[45%] w-24 h-24 bg-[hsl(200_100%_50%_/_0.12)] rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-[30%] w-20 h-20 bg-[hsl(340_75%_55%_/_0.1)] rounded-full blur-xl" />
      <div className="absolute top-6 right-[40%] w-16 h-16 bg-[hsl(82_85%_55%_/_0.18)] rounded-full blur-xl" />
      
      {/* Wave divider at bottom - extends past container */}
      <div className="absolute -bottom-px left-0 right-0">
        <svg 
          viewBox="0 0 1440 60" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 md:h-16 block"
          preserveAspectRatio="none"
        >
          <path 
            d="M0 60L48 52C96 44 192 28 288 24C384 20 480 28 576 32C672 36 768 36 864 32C960 28 1056 20 1152 20C1248 20 1344 28 1392 32L1440 36V60H0Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </div>
  );
}
