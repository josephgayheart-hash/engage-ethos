import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBorderCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'lime' | 'purple' | 'blue' | 'pink';
}

const glowColors = {
  lime: 'hsl(var(--cyber-lime))',
  purple: 'hsl(var(--cyber-purple))',
  blue: 'hsl(var(--cyber-blue))',
  pink: 'hsl(340 75% 55%)',
};

export default function AnimatedBorderCard({ 
  children, 
  className,
  glowColor = 'lime' 
}: AnimatedBorderCardProps) {
  const color = glowColors[glowColor];
  
  return (
    <div className={cn("relative group", className)}>
      {/* Animated border glow */}
      <div 
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, ${color}, transparent, ${color})`,
          backgroundSize: '200% 100%',
          animation: 'border-flow 3s linear infinite',
        }}
      />
      
      {/* Glow effect */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500"
        style={{ background: color }}
      />
      
      {/* Card content */}
      <div className="relative bg-white rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
