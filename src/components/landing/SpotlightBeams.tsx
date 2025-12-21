import { useEffect, useState } from 'react';

export default function SpotlightBeams() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary spotlight beam - follows mouse slightly */}
      <div 
        className="absolute w-[800px] h-[800px] opacity-30 animate-spotlight-slow"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, 
            transparent 0deg, 
            hsl(var(--cyber-lime) / 0.4) 10deg, 
            transparent 40deg,
            transparent 120deg,
            hsl(var(--cyber-purple) / 0.3) 140deg,
            transparent 170deg,
            transparent 240deg,
            hsl(var(--cyber-blue) / 0.3) 260deg,
            transparent 290deg,
            transparent 360deg
          )`,
          left: `calc(${mousePosition.x * 0.3 + 20}% - 400px)`,
          top: `calc(${mousePosition.y * 0.2}% - 200px)`,
          filter: 'blur(60px)',
          transition: 'left 2s ease-out, top 2s ease-out',
        }}
      />
      
      {/* Secondary rotating beam */}
      <div 
        className="absolute w-[600px] h-[600px] opacity-20 animate-spotlight-reverse"
        style={{
          background: `conic-gradient(from 180deg at 50% 50%, 
            transparent 0deg, 
            hsl(var(--cyber-purple) / 0.5) 20deg, 
            transparent 60deg,
            transparent 180deg,
            hsl(var(--cyber-lime) / 0.4) 200deg,
            transparent 240deg,
            transparent 360deg
          )`,
          right: '-200px',
          top: '20%',
          filter: 'blur(80px)',
        }}
      />

      {/* Tertiary accent beam */}
      <div 
        className="absolute w-[500px] h-[500px] opacity-15 animate-spotlight-slow"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, 
            transparent 0deg, 
            hsl(var(--cyber-blue) / 0.6) 15deg, 
            transparent 50deg,
            transparent 270deg,
            hsl(var(--cyber-lime) / 0.3) 290deg,
            transparent 320deg,
            transparent 360deg
          )`,
          left: '10%',
          bottom: '-100px',
          filter: 'blur(70px)',
        }}
      />
    </div>
  );
}
