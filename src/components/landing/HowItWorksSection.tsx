import { Badge } from '@/components/ui/badge';
import { FileText, Wand2, CheckCircle, Library, Send } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: 'Set Up & Upload',
    description: 'Configure your institution profile and upload brand guidelines, sample content, and voice documents.',
    color: 'lime',
  },
  {
    icon: Wand2,
    title: 'AI Learns Your DNA',
    description: 'Our AI analyzes patterns, tone, and messaging pillars unique to your institution.',
    color: 'purple',
  },
  {
    icon: CheckCircle,
    title: 'Generate & Score',
    description: 'Create on-brand content and get instant adherence scores with improvement suggestions.',
    color: 'blue',
  },
  {
    icon: Library,
    title: 'Build Your Library',
    description: 'Curate approved templates and messages in a shared library your entire team can access.',
    color: 'teal',
  },
  {
    icon: Send,
    title: 'Deploy Everywhere',
    description: 'Export to your CRM, share with teams, or push directly to marketing channels.',
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

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(220_40%_88%)] relative overflow-visible">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[hsl(270_70%_60%_/_0.08)] rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[hsl(82_85%_55%_/_0.08)] rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[hsl(82_85%_55%_/_0.2)] text-[hsl(82_60%_35%)] border-[hsl(82_85%_55%_/_0.4)]">
            How It Works
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
            From <span className="text-[hsl(82_60%_40%)]">Brand Chaos</span> to{' '}
            <span className="text-[hsl(270_50%_50%)]">Brand Clarity</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Five simple steps to transform your institutional communications
          </p>
        </div>

        {/* Flow diagram layout - grid on desktop, scroll on mobile */}
        <div className="relative py-6">
          {/* Desktop: centered grid */}
          <div className="hidden lg:grid lg:grid-cols-5 lg:gap-3 lg:items-stretch">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex">
                {/* Card */}
                <div className="relative group flex-1 flex">
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
                    className="absolute -inset-4 rounded-xl opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-500 pointer-events-none"
                    style={{ background: getColor(step.color) }}
                  />
                  
                  {/* Card content */}
                  <div className="relative flex-1 bg-white/80 backdrop-blur-sm border border-black/5 rounded-xl p-4 transition-all duration-300 group-hover:border-transparent group-hover:-translate-y-1 shadow-sm flex flex-col">
                    {/* Step number badge */}
                    <div 
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold leading-none text-white"
                      style={{ background: getColor(step.color) }}
                    >
                      {index + 1}
                    </div>

                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                      style={{ background: `${getColor(step.color)}20` }}
                    >
                      <step.icon 
                        className="w-5 h-5"
                        style={{ color: getColor(step.color) }}
                      />
                    </div>

                    <h3 className="font-semibold text-foreground mb-1 text-xs">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Arrow connector between cards - desktop only */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 flex items-center" aria-hidden="true">
                    <div className="relative w-4 h-1 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-[hsl(270_70%_60%_/_0.3)]" />
                      <div 
                        className="absolute top-0 left-0 w-3 h-full bg-gradient-to-r from-[hsl(270_70%_60%)] via-[hsl(82_85%_50%)] to-[hsl(270_70%_60%)]"
                        style={{
                          animation: 'beam-travel 1.5s ease-in-out infinite',
                          animationDelay: `${index * 0.4}s`,
                        }}
                      />
                    </div>
                    <svg className="w-2 h-2 text-[hsl(82_85%_45%)]" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M2 6L9 6M9 6L6 3M9 6L6 9" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile/Tablet: horizontal scroll */}
          <div className="lg:hidden overflow-x-auto overflow-y-visible -mx-4 px-4">
            <div className="flex items-center gap-4 py-4 w-max">
              {steps.map((step, index) => (
                <div key={step.title} className="flex items-center gap-4">
                  {/* Card */}
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
                      className="absolute -inset-4 rounded-xl opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-500 pointer-events-none"
                      style={{ background: getColor(step.color) }}
                    />
                    
                    {/* Card content */}
                    <div className="relative bg-white/80 backdrop-blur-sm border border-black/5 rounded-xl p-5 w-52 transition-all duration-300 group-hover:border-transparent group-hover:-translate-y-1 shadow-sm">
                      {/* Step number badge */}
                      <div 
                        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold leading-none text-white"
                        style={{ background: getColor(step.color) }}
                      >
                        {index + 1}
                      </div>

                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                        style={{ background: `${getColor(step.color)}20` }}
                      >
                        <step.icon 
                          className="w-6 h-6"
                          style={{ color: getColor(step.color) }}
                        />
                      </div>

                      <h3 className="font-semibold text-foreground mb-1.5 text-sm">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connector */}
                  {index < steps.length - 1 && (
                    <div className="flex items-center shrink-0" aria-hidden="true">
                      <div className="relative w-8 h-1 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-[hsl(270_70%_60%_/_0.3)]" />
                        <div 
                          className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-[hsl(270_70%_60%)] via-[hsl(82_85%_50%)] to-[hsl(270_70%_60%)]"
                          style={{
                            animation: 'beam-travel 1.5s ease-in-out infinite',
                            animationDelay: `${index * 0.4}s`,
                          }}
                        />
                      </div>
                      <svg className="w-3 h-3 text-[hsl(82_85%_45%)]" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M2 6L9 6M9 6L6 3M9 6L6 9" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary line */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          Upload → Learn → Generate → Library → Deploy
        </p>
      </div>
    </section>
  );
}
