import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
}

export default function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <span 
      className={cn(
        "bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--cyber-lime))] via-[hsl(var(--cyber-purple))] to-[hsl(var(--cyber-blue))] bg-[length:200%_auto] animate-gradient-shift",
        className
      )}
    >
      {children}
    </span>
  );
}
