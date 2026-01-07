import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  institution?: string;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function TestimonialCard({
  quote,
  author,
  role,
  institution,
  variant = 'default',
  className,
}: TestimonialCardProps) {
  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50",
        className
      )}>
        <Quote className="w-5 h-5 text-primary/60 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-foreground italic mb-2">"{quote}"</p>
          <p className="text-xs text-muted-foreground">
            — {author}, {role}
            {institution && <span className="text-muted-foreground/70"> • {institution}</span>}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className={cn(
        "relative p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20",
        className
      )}>
        <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/20" />
        <div className="relative z-10 pl-8">
          <p className="text-lg text-foreground italic mb-6 leading-relaxed">"{quote}"</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              {author.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-medium text-foreground">{author}</p>
              <p className="text-sm text-muted-foreground">
                {role}
                {institution && <span> • {institution}</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn(
      "p-6 rounded-xl bg-card border border-border shadow-sm",
      className
    )}>
      <Quote className="w-8 h-8 text-primary/40 mb-4" />
      <p className="text-foreground italic mb-4">"{quote}"</p>
      <div className="border-t border-border pt-4">
        <p className="font-medium text-foreground">{author}</p>
        <p className="text-sm text-muted-foreground">
          {role}
          {institution && <span className="text-muted-foreground/70"> • {institution}</span>}
        </p>
      </div>
    </div>
  );
}

export default TestimonialCard;
