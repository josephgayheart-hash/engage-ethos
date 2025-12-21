import { Badge } from '@/components/ui/badge';
import { Building2, Brain, Pencil, Library, Rocket } from 'lucide-react';

const leftSteps = [
  {
    icon: Building2,
    title: 'Institution Setup',
    description: 'Configure your institution profile and upload brand guidelines, sample content, and voice documents.',
    color: 'lime',
  },
  {
    icon: Brain,
    title: 'Content DNA & Brand Layer',
    description: 'Our AI learns your data and develops a unique Content DNA and Brand Layer for your institution.',
    color: 'purple',
  },
  {
    icon: Pencil,
    title: 'Message & Journey Design',
    description: 'Build on-brand messages and multi-channel communication journeys with AI scoring and governance.',
    color: 'blue',
  },
];

const rightSteps = [
  {
    icon: Library,
    title: 'University Library',
    description: 'Curate approved templates and messages with approval workflows and governance controls.',
    color: 'teal',
  },
  {
    icon: Rocket,
    title: 'Deploy Everywhere',
    description: 'Export to your CRM, share with teams, or push directly to enrollment marketing channels.',
    color: 'pink',
  },
];

const getColor = (color: string) => {
  switch (color) {
    case 'lime': return 'hsl(82 85% 55%)';
    case 'purple': return 'hsl(270 70% 60%)';
    case 'blue': return 'hsl(200 100% 50%)';
    case 'teal': return 'hsl(173 70% 45%)';
    case 'pink': return 'hsl(340 75% 55%)';
    default: return 'hsl(82 85% 55%)';
  }
};

interface StepCardProps {
  step: {
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    title: string;
    description: string;
    color: string;
  };
  index: number;
  side: 'left' | 'right';
}

function StepCard({ step, index, side }: StepCardProps) {
  const stepNumber = side === 'left' ? index + 1 : index + 4;
  
  return (
    <div className="relative group">
      {/* Animated border on hover */}
      <div 
        className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, ${getColor(step.color)}, transparent, ${getColor(step.color)})`,
          backgroundSize: '200% 100%',
          animation: 'border-flow 3s linear infinite',
        }}
      />
      
      {/* Glow effect on hover */}
      <div 
        className="absolute -inset-4 rounded-xl opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 pointer-events-none"
        style={{ background: getColor(step.color) }}
      />
      
      {/* Card content */}
      <div className="relative bg-white/90 backdrop-blur-sm border border-black/5 rounded-xl p-5 transition-all duration-300 group-hover:border-transparent group-hover:-translate-y-1 shadow-sm">
        {/* Step number badge */}
        <div 
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold leading-none text-white"
          style={{ background: getColor(step.color) }}
        >
          {stepNumber}
        </div>

        <div 
          className="w-11 h-11 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
          style={{ background: `${getColor(step.color)}20` }}
        >
          <step.icon 
            className="w-5 h-5"
            style={{ color: getColor(step.color) }}
          />
        </div>

        <h3 className="font-semibold text-foreground mb-1 text-sm pr-6">
          {step.title}
        </h3>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(220_35%_92%)] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-[5%] w-80 h-80 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-[5%] w-80 h-80 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[hsl(200_100%_50%_/_0.06)] rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-[hsl(82_85%_55%_/_0.2)] text-[hsl(82_60%_35%)] border-[hsl(82_85%_55%_/_0.4)]">
            How It Works
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
            From <span className="text-[hsl(82_60%_40%)]">Brand Chaos</span> to{' '}
            <span className="text-[hsl(270_50%_50%)]">Brand Clarity</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Five steps to transform your institutional communications with AI-powered governance
          </p>
        </div>

        {/* Hub-and-Spoke Layout - Desktop */}
        <div className="hidden lg:block relative">
          {/* SVG Curved Connectors */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            viewBox="0 0 1200 500"
            preserveAspectRatio="xMidYMid meet"
            style={{ zIndex: 0 }}
          >
            <defs>
              {/* Gradient for left connectors */}
              <linearGradient id="leftGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(82 85% 55%)" />
                <stop offset="50%" stopColor="hsl(270 70% 60%)" />
                <stop offset="100%" stopColor="hsl(200 100% 50%)" />
              </linearGradient>
              {/* Gradient for right connectors */}
              <linearGradient id="rightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(200 100% 50%)" />
                <stop offset="50%" stopColor="hsl(173 70% 45%)" />
                <stop offset="100%" stopColor="hsl(340 75% 55%)" />
              </linearGradient>
            </defs>
            
            {/* Left side curves to center */}
            {/* Step 1 to Hub */}
            <path 
              d="M 280 80 Q 450 80, 530 250" 
              stroke="url(#leftGradient)" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
              className="opacity-30"
            />
            <path 
              d="M 280 80 Q 450 80, 530 250" 
              stroke="url(#leftGradient)" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 12"
              className="animate-path-flow"
              style={{ animationDelay: '0s' }}
            />
            
            {/* Step 2 to Hub */}
            <path 
              d="M 280 250 Q 400 250, 530 250" 
              stroke="url(#leftGradient)" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
              className="opacity-30"
            />
            <path 
              d="M 280 250 Q 400 250, 530 250" 
              stroke="url(#leftGradient)" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 12"
              className="animate-path-flow"
              style={{ animationDelay: '0.5s' }}
            />
            
            {/* Step 3 to Hub */}
            <path 
              d="M 280 420 Q 450 420, 530 250" 
              stroke="url(#leftGradient)" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
              className="opacity-30"
            />
            <path 
              d="M 280 420 Q 450 420, 530 250" 
              stroke="url(#leftGradient)" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 12"
              className="animate-path-flow"
              style={{ animationDelay: '1s' }}
            />
            
            {/* Hub to right side curves */}
            {/* Hub to Step 4 */}
            <path 
              d="M 670 250 Q 750 165, 920 165" 
              stroke="url(#rightGradient)" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
              className="opacity-30"
            />
            <path 
              d="M 670 250 Q 750 165, 920 165" 
              stroke="url(#rightGradient)" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 12"
              className="animate-path-flow"
              style={{ animationDelay: '1.5s' }}
            />
            
            {/* Hub to Step 5 */}
            <path 
              d="M 670 250 Q 750 335, 920 335" 
              stroke="url(#rightGradient)" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
              className="opacity-30"
            />
            <path 
              d="M 670 250 Q 750 335, 920 335" 
              stroke="url(#rightGradient)" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 12"
              className="animate-path-flow"
              style={{ animationDelay: '2s' }}
            />
          </svg>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center relative" style={{ minHeight: '500px' }}>
            {/* Left Column - Steps 1-3 */}
            <div className="flex flex-col gap-6 justify-center relative z-10">
              {leftSteps.map((step, index) => (
                <StepCard key={step.title} step={step} index={index} side="left" />
              ))}
            </div>

            {/* Center Hub */}
            <div className="relative flex items-center justify-center z-10">
              {/* Outer glow ring */}
              <div className="absolute w-44 h-44 rounded-full bg-gradient-to-br from-[hsl(82_85%_55%_/_0.2)] via-[hsl(270_70%_60%_/_0.2)] to-[hsl(200_100%_50%_/_0.2)] blur-xl animate-pulse-subtle" />
              
              {/* Main hub circle */}
              <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-[hsl(82_85%_55%)] via-[hsl(270_70%_60%)] to-[hsl(200_100%_50%)] p-[3px] shadow-2xl">
                <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
                  <Brain className="w-10 h-10 text-[hsl(270_70%_55%)] mb-1" />
                  <span className="text-xs font-bold text-foreground text-center leading-tight">
                    CampusVoice<br/>AI
                  </span>
                </div>
              </div>
              
              {/* Rotating accent ring */}
              <div 
                className="absolute w-44 h-44 rounded-full border-2 border-dashed border-[hsl(82_85%_55%_/_0.3)] animate-spin"
                style={{ animationDuration: '20s' }}
              />
            </div>

            {/* Right Column - Steps 4-5 */}
            <div className="flex flex-col gap-6 justify-center relative z-10">
              {rightSteps.map((step, index) => (
                <StepCard key={step.title} step={step} index={index} side="right" />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet: Vertical flow */}
        <div className="lg:hidden space-y-4">
          {/* All steps in vertical order */}
          {[...leftSteps, ...rightSteps].map((step, index) => (
            <div key={step.title} className="relative">
              <StepCard 
                step={step} 
                index={index < 3 ? index : index - 3} 
                side={index < 3 ? 'left' : 'right'} 
              />
              
              {/* Connector between cards */}
              {index < 4 && (
                <div className="flex justify-center py-2">
                  <div className="relative w-1 h-6 rounded-full overflow-hidden bg-[hsl(270_70%_60%_/_0.2)]">
                    <div 
                      className="absolute top-0 left-0 w-full h-3 bg-gradient-to-b from-[hsl(82_85%_55%)] to-[hsl(270_70%_60%)]"
                      style={{
                        animation: 'beam-travel-vertical 1.5s ease-in-out infinite',
                        animationDelay: `${index * 0.3}s`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary line */}
        <p className="text-center text-muted-foreground text-sm mt-10">
          Setup → DNA & Brand → Design → Library → Deploy
        </p>
      </div>

      {/* Wave Divider to Value Props (Yellow) */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1440 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path 
            d="M0 80L48 70C96 60 192 40 288 35C384 30 480 40 576 45C672 50 768 50 864 45C960 40 1056 30 1152 30C1248 30 1344 40 1392 45L1440 50V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" 
            fill="hsl(48 100% 90%)"
          />
        </svg>
      </div>
    </section>
  );
}
