import { Upload, Database, Zap, Library } from 'lucide-react';

const leftSteps = [
  { icon: Upload, label: 'Upload Your Content' },
  { icon: Database, label: 'Import Brand Assets' },
  { icon: Zap, label: 'Define Your Voice' },
];

const rightStep = { icon: Library, label: 'University Library' };

export default function HowItWorksSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[hsl(222_47%_11%)] relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(270_50%_20%_/_0.15),_transparent_70%)]" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl mb-4">
            <span className="text-white">How It </span>
            <span className="bg-gradient-to-r from-[hsl(200_100%_60%)] to-[hsl(270_70%_65%)] bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Transform your brand guidelines into on-brand content in four simple steps
          </p>
        </div>

        {/* Hub and Spoke Diagram - Desktop */}
        <div className="hidden md:block relative" style={{ height: '320px' }}>
          
          {/* Single SVG for all connecting lines */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(270 70% 60%)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(200 100% 60%)" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            
            {/* Line 1: Top card to Hub */}
            <path 
              d="M 18 15 Q 35 15, 50 50" 
              stroke="url(#lineGrad)" 
              strokeWidth="0.4" 
              fill="none"
              strokeLinecap="round"
              className="animate-pulse-line"
            />
            
            {/* Line 2: Middle card to Hub */}
            <path 
              d="M 18 50 Q 35 50, 50 50" 
              stroke="url(#lineGrad)" 
              strokeWidth="0.4" 
              fill="none"
              strokeLinecap="round"
              className="animate-pulse-line delay-1"
            />
            
            {/* Line 3: Bottom card to Hub */}
            <path 
              d="M 18 85 Q 35 85, 50 50" 
              stroke="url(#lineGrad)" 
              strokeWidth="0.4" 
              fill="none"
              strokeLinecap="round"
              className="animate-pulse-line delay-2"
            />
            
            {/* Line 4: Hub to University Library */}
            <path 
              d="M 50 50 Q 65 50, 82 50" 
              stroke="url(#lineGrad)" 
              strokeWidth="0.4" 
              fill="none"
              strokeLinecap="round"
              className="animate-pulse-line delay-3"
            />
          </svg>

          {/* Left Cards - Positioned absolutely */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-2" style={{ width: '170px' }}>
            {leftSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center transition-all hover:border-[hsl(270_70%_60%_/_0.5)] hover:bg-[hsl(222_40%_18%)]">
                  <step.icon className="w-5 h-5 text-white/70" />
                </div>
                <span className="mt-2 text-white/50 text-xs text-center">{step.label}</span>
              </div>
            ))}
          </div>

          {/* Center Hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-28 h-28 rounded-full bg-[hsl(222_40%_14%)] border border-white/15 flex items-center justify-center relative overflow-hidden shadow-[0_0_40px_hsl(270_70%_50%_/_0.2)]">
              {/* Animated glow ring */}
              <div 
                className="absolute inset-0 rounded-full opacity-70"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, hsl(270 70% 60% / 0.5) 20%, hsl(200 100% 60% / 0.5) 40%, transparent 60%)',
                  animation: 'spin 5s linear infinite',
                }}
              />
              <div className="absolute inset-[3px] rounded-full bg-[hsl(222_40%_14%)] flex items-center justify-center">
                <div className="text-center">
                  <span className="text-white font-semibold text-xs leading-tight block">CampusVoice</span>
                  <span className="text-white/50 text-[10px]">AI Engine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card - Positioned absolutely */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center" style={{ width: '170px' }}>
            <div className="w-full h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center transition-all hover:border-[hsl(200_100%_60%_/_0.5)] hover:bg-[hsl(222_40%_18%)]">
              <rightStep.icon className="w-5 h-5 text-white/70" />
            </div>
            <span className="mt-2 text-white/50 text-xs text-center">{rightStep.label}</span>
          </div>
        </div>

        {/* Mobile Layout - Vertical */}
        <div className="md:hidden space-y-3">
          {leftSteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-52 h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-white/70" />
              </div>
              <span className="mt-2 text-white/50 text-xs text-center">{step.label}</span>
              <div className="w-0.5 h-3 bg-gradient-to-b from-[hsl(270_70%_60%_/_0.5)] to-[hsl(200_100%_60%_/_0.5)] mt-2" />
            </div>
          ))}
          
          {/* Hub */}
          <div className="flex justify-center py-2">
            <div className="w-20 h-20 rounded-full bg-[hsl(222_40%_16%)] border border-white/15 flex items-center justify-center">
              <div className="text-center">
                <span className="text-white font-semibold text-[10px] leading-tight block">CampusVoice</span>
                <span className="text-white/50 text-[8px]">AI Engine</span>
              </div>
            </div>
          </div>
          
          <div className="w-0.5 h-3 bg-gradient-to-b from-[hsl(270_70%_60%_/_0.5)] to-[hsl(200_100%_60%_/_0.5)] mx-auto" />
          
          {/* Output */}
          <div className="flex flex-col items-center">
            <div className="w-52 h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center">
              <rightStep.icon className="w-5 h-5 text-white/70" />
            </div>
            <span className="mt-2 text-white/50 text-xs text-center">{rightStep.label}</span>
          </div>
        </div>
      </div>

      {/* Wave Divider to next section */}
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-line {
          0%, 100% { 
            opacity: 0.4;
            stroke-width: 0.3;
          }
          50% { 
            opacity: 1;
            stroke-width: 0.5;
          }
        }
        
        .animate-pulse-line {
          animation: pulse-line 2.5s ease-in-out infinite;
        }
        
        .delay-1 {
          animation-delay: 0.4s;
        }
        
        .delay-2 {
          animation-delay: 0.8s;
        }
        
        .delay-3 {
          animation-delay: 1.2s;
        }
      `}</style>
    </section>
  );
}
