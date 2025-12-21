import { Badge } from '@/components/ui/badge';
import { FileText, Wand2, CheckCircle, Send } from 'lucide-react';
import AnimatedBorderCard from './AnimatedBorderCard';

const steps = [
  {
    icon: FileText,
    title: 'Upload Your Brand',
    description: 'Add your brand guidelines, sample content, and institutional voice documents.',
    color: 'lime' as const,
  },
  {
    icon: Wand2,
    title: 'AI Learns Your DNA',
    description: 'Our AI analyzes patterns, tone, and messaging pillars unique to your institution.',
    color: 'purple' as const,
  },
  {
    icon: CheckCircle,
    title: 'Generate & Score',
    description: 'Create on-brand content and get instant adherence scores with improvement suggestions.',
    color: 'blue' as const,
  },
  {
    icon: Send,
    title: 'Deploy Everywhere',
    description: 'Export to your CRM, share with teams, or push directly to marketing channels.',
    color: 'pink' as const,
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(222_47%_11%)] relative overflow-hidden">
      {/* Animated background beams */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-[600px] h-[600px] opacity-30 animate-spotlight-slow"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, 
              transparent 0deg, 
              hsl(var(--cyber-lime) / 0.3) 20deg, 
              transparent 60deg,
              transparent 180deg,
              hsl(var(--cyber-purple) / 0.2) 200deg,
              transparent 240deg,
              transparent 360deg
            )`,
            left: '-200px',
            top: '-100px',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] opacity-20 animate-spotlight-reverse"
          style={{
            background: `conic-gradient(from 180deg at 50% 50%, 
              transparent 0deg, 
              hsl(var(--cyber-blue) / 0.4) 30deg, 
              transparent 70deg,
              transparent 270deg,
              hsl(var(--cyber-lime) / 0.3) 300deg,
              transparent 340deg,
              transparent 360deg
            )`,
            right: '-150px',
            bottom: '-50px',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[hsl(var(--cyber-lime)_/_0.2)] text-[hsl(var(--cyber-lime))] border-[hsl(var(--cyber-lime)_/_0.4)]">
            How It Works
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl text-white mb-4">
            From <span className="text-[hsl(var(--cyber-lime))]">Brand Chaos</span> to{' '}
            <span className="text-[hsl(var(--cyber-purple))]">Brand Clarity</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Four simple steps to transform your institutional communications
          </p>
        </div>

        {/* Steps with connecting lines */}
        <div className="relative">
          {/* Connecting line - desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--cyber-lime)_/_0.3)] to-transparent" />
          
          {/* Animated beam on the line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-32 h-px animate-beam-flow">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-[hsl(var(--cyber-lime))] to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <AnimatedBorderCard 
                key={step.title} 
                glowColor={step.color}
                className="transform hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="p-6 relative">
                  {/* Step number */}
                  <div 
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[hsl(222_47%_11%)]"
                    style={{ 
                      background: step.color === 'lime' ? 'hsl(var(--cyber-lime))' :
                                  step.color === 'purple' ? 'hsl(var(--cyber-purple))' :
                                  step.color === 'blue' ? 'hsl(var(--cyber-blue))' :
                                  'hsl(340 75% 55%)'
                    }}
                  >
                    {index + 1}
                  </div>

                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{
                      background: step.color === 'lime' ? 'hsl(var(--cyber-lime) / 0.15)' :
                                  step.color === 'purple' ? 'hsl(var(--cyber-purple) / 0.15)' :
                                  step.color === 'blue' ? 'hsl(var(--cyber-blue) / 0.15)' :
                                  'hsl(340 75% 55% / 0.15)'
                    }}
                  >
                    <step.icon 
                      className="w-7 h-7"
                      style={{
                        color: step.color === 'lime' ? 'hsl(var(--cyber-lime))' :
                               step.color === 'purple' ? 'hsl(var(--cyber-purple))' :
                               step.color === 'blue' ? 'hsl(var(--cyber-blue))' :
                               'hsl(340 75% 55%)'
                      }}
                    />
                  </div>

                  <h3 className="font-semibold text-[hsl(222_47%_11%)] mb-2 text-lg">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </AnimatedBorderCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
