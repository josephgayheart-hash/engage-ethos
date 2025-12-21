import { Badge } from '@/components/ui/badge';
import { FileText, Wand2, CheckCircle, Send } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: 'Upload Your Brand',
    description: 'Add your brand guidelines, sample content, and institutional voice documents.',
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
    case 'pink': return 'hsl(340 75% 55%)';
    default: return 'hsl(82 85% 55%)';
  }
};

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(222_47%_11%)] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[hsl(200_100%_50%_/_0.1)] rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[hsl(82_85%_55%_/_0.2)] text-[hsl(82_85%_55%)] border-[hsl(82_85%_55%_/_0.4)]">
            How It Works
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl text-white mb-4">
            From <span className="text-[hsl(82_85%_55%)]">Brand Chaos</span> to{' '}
            <span className="text-[hsl(270_70%_60%)]">Brand Clarity</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Four simple steps to transform your institutional communications
          </p>
        </div>

        {/* Flow diagram layout */}
        <div className="relative flex items-center justify-start gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {/* Steps */}
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center gap-4 shrink-0 snap-start">
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
                  className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"
                  style={{ background: getColor(step.color) }}
                />
                
                {/* Card content */}
                <div className="relative bg-[hsl(222_47%_14%)] border border-white/10 rounded-xl p-5 w-56 shrink-0 transition-all duration-300 group-hover:border-transparent group-hover:-translate-y-1">
                  {/* Step number badge - positioned inside the card */}
                  <div 
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold leading-none text-[hsl(222_47%_11%)]"
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

                  <h3 className="font-semibold text-white mb-1.5 text-sm">
                    {step.title}
                  </h3>
                  <p className="text-white/50 text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector - only show between cards */}
              {index < steps.length - 1 && (
                <div className="flex items-center shrink-0" aria-hidden="true">
                  <div className="relative w-10 h-px">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/5" />
                    {/* Animated beam */}
                    <div 
                      className="absolute top-0 left-0 w-4 h-px bg-gradient-to-r from-transparent via-[hsl(82_85%_55%)] to-transparent"
                      style={{
                        animation: 'beam-travel 2s linear infinite',
                        animationDelay: `${index * 0.5}s`,
                      }}
                    />
                  </div>
                  <svg className="w-3 h-3 text-white/30" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2 6L9 6M9 6L6 3M9 6L6 9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary line */}
        <p className="text-center text-white/40 text-sm mt-12">
          Upload brand docs → AI analyzes your voice → Generate on-brand content → Deploy everywhere
        </p>
      </div>
    </section>
  );
}
