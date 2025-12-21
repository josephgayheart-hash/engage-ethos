interface GlowOrbsProps {
  variant?: 'hero' | 'section';
}

export default function GlowOrbs({ variant = 'hero' }: GlowOrbsProps) {
  if (variant === 'hero') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orb - lime */}
        <div 
          className="absolute w-64 h-64 rounded-full blur-3xl animate-float-slow"
          style={{
            background: 'hsl(var(--cyber-lime) / 0.15)',
            top: '10%',
            right: '15%',
          }}
        />
        
        {/* Medium floating orb - purple */}
        <div 
          className="absolute w-48 h-48 rounded-full blur-3xl animate-float-medium"
          style={{
            background: 'hsl(var(--cyber-purple) / 0.2)',
            bottom: '20%',
            left: '10%',
            animationDelay: '1s',
          }}
        />
        
        {/* Small floating orb - blue */}
        <div 
          className="absolute w-32 h-32 rounded-full blur-2xl animate-float-fast"
          style={{
            background: 'hsl(var(--cyber-blue) / 0.25)',
            top: '40%',
            left: '25%',
            animationDelay: '0.5s',
          }}
        />
        
        {/* Accent orb - pink */}
        <div 
          className="absolute w-24 h-24 rounded-full blur-2xl animate-float-medium"
          style={{
            background: 'hsl(340 75% 55% / 0.15)',
            bottom: '30%',
            right: '25%',
            animationDelay: '1.5s',
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute w-40 h-40 rounded-full blur-3xl animate-pulse-subtle"
        style={{
          background: 'hsl(var(--cyber-lime) / 0.1)',
          top: '20%',
          right: '10%',
        }}
      />
      <div 
        className="absolute w-32 h-32 rounded-full blur-2xl animate-pulse-subtle"
        style={{
          background: 'hsl(var(--cyber-purple) / 0.12)',
          bottom: '25%',
          left: '15%',
          animationDelay: '1s',
        }}
      />
    </div>
  );
}
