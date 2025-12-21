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
        <div className="hidden md:grid md:grid-cols-[180px_1fr_140px_1fr_180px] md:items-center md:gap-0" style={{ minHeight: '360px' }}>
          
          {/* Left Column - 3 Input Cards */}
          <div className="flex flex-col gap-4 justify-between h-full py-2">
            {leftSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-44 h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center transition-all hover:border-[hsl(270_70%_60%_/_0.5)] hover:bg-[hsl(222_40%_18%)]">
                  <step.icon className="w-5 h-5 text-white/70" />
                </div>
                <span className="mt-2 text-white/50 text-xs text-center">{step.label}</span>
              </div>
            ))}
          </div>

          {/* Left Lines */}
          <div className="relative h-full flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(270 70% 55%)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(200 100% 55%)" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {/* Line from top card */}
              <path 
                d="M 0 30 Q 60 30, 100 90" 
                stroke="url(#lineGrad1)" 
                strokeWidth="2" 
                fill="none"
                strokeLinecap="round"
                className="animate-pulse-line"
              />
              
              {/* Line from middle card */}
              <path 
                d="M 0 90 L 100 90" 
                stroke="url(#lineGrad1)" 
                strokeWidth="2" 
                fill="none"
                strokeLinecap="round"
                className="animate-pulse-line"
                style={{ animationDelay: '0.3s' }}
              />
              
              {/* Line from bottom card */}
              <path 
                d="M 0 150 Q 60 150, 100 90" 
                stroke="url(#lineGrad1)" 
                strokeWidth="2" 
                fill="none"
                strokeLinecap="round"
                className="animate-pulse-line"
                style={{ animationDelay: '0.6s' }}
              />
            </svg>
          </div>

          {/* Center Hub */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-[hsl(222_40%_14%)] border border-white/15 flex items-center justify-center relative overflow-hidden shadow-[0_0_40px_hsl(270_70%_50%_/_0.15)]">
              {/* Animated glow ring */}
              <div 
                className="absolute inset-0 rounded-full opacity-60"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, hsl(270 70% 60% / 0.4) 25%, hsl(200 100% 60% / 0.4) 50%, transparent 75%)',
                  animation: 'spin 6s linear infinite',
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

          {/* Right Line */}
          <div className="relative h-full flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
              <path 
                d="M 0 90 L 100 90" 
                stroke="url(#lineGrad1)" 
                strokeWidth="2" 
                fill="none"
                strokeLinecap="round"
                className="animate-pulse-line"
                style={{ animationDelay: '0.9s' }}
              />
            </svg>
          </div>

          {/* Right Column - Output Card */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-44 h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center transition-all hover:border-[hsl(200_100%_60%_/_0.5)] hover:bg-[hsl(222_40%_18%)]">
              <rightStep.icon className="w-5 h-5 text-white/70" />
            </div>
            <span className="mt-2 text-white/50 text-xs text-center">{rightStep.label}</span>
          </div>
        </div>

        {/* Mobile Layout - Vertical */}
        <div className="md:hidden space-y-4">
          {leftSteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-48 h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-white/70" />
              </div>
              <span className="mt-2 text-white/50 text-xs text-center">{step.label}</span>
              {index < leftSteps.length - 1 && (
                <div className="w-0.5 h-4 bg-gradient-to-b from-[hsl(270_70%_60%_/_0.5)] to-[hsl(200_100%_60%_/_0.5)] mt-2" />
              )}
            </div>
          ))}
          
          <div className="w-0.5 h-4 bg-gradient-to-b from-[hsl(270_70%_60%_/_0.5)] to-[hsl(200_100%_60%_/_0.5)] mx-auto" />
          
          {/* Hub */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[hsl(222_40%_16%)] border border-white/15 flex items-center justify-center">
              <div className="text-center">
                <span className="text-white font-semibold text-[10px] leading-tight block">CampusVoice</span>
                <span className="text-white/50 text-[8px]">AI Engine</span>
              </div>
            </div>
          </div>
          
          <div className="w-0.5 h-4 bg-gradient-to-b from-[hsl(270_70%_60%_/_0.5)] to-[hsl(200_100%_60%_/_0.5)] mx-auto" />
          
          {/* Output */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center">
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
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .animate-pulse-line {
          animation: pulse-line 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
