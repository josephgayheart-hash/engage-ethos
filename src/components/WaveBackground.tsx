/**
 * WaveBackground - A solid colored header with wave divider at bottom
 * Matches the landing page style with blurred sprite accents
 */
export function WaveBackground({ variant = 'teal' }: { variant?: 'teal' | 'amber' }) {
  const bgColor = variant === 'teal' 
    ? 'bg-[hsl(173_40%_92%)]' 
    : 'bg-[hsl(48_100%_92%)]';
  
  const waveColor = variant === 'teal'
    ? 'hsl(0 0% 100%)' // white/background for teal
    : 'hsl(0 0% 100%)';

  return (
    <div className={`absolute inset-0 ${bgColor}`}>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20" />
      
      {/* Blurred sprite accents - varied colors */}
      <div className="absolute top-8 right-[15%] w-32 h-32 bg-[hsl(270_70%_60%_/_0.15)] rounded-full blur-2xl" />
      <div className="absolute top-4 left-[10%] w-40 h-40 bg-[hsl(82_85%_55%_/_0.12)] rounded-full blur-3xl" />
      <div className="absolute top-12 left-[45%] w-24 h-24 bg-[hsl(200_100%_50%_/_0.12)] rounded-full blur-2xl" />
      <div className="absolute bottom-16 right-[30%] w-20 h-20 bg-[hsl(340_75%_55%_/_0.1)] rounded-full blur-xl" />
      <div className="absolute top-6 right-[40%] w-16 h-16 bg-[hsl(82_85%_55%_/_0.18)] rounded-full blur-xl" />
      
      {/* Wave divider at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1440 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path 
            d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C672 50 768 50 864 45C960 40 1056 30 1152 30C1248 30 1344 40 1392 45L1440 50V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" 
            fill={waveColor}
          />
        </svg>
      </div>
    </div>
  );
}
