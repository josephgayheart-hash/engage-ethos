import { Upload, Database, Zap, Download } from 'lucide-react';

const leftSteps = [
  { icon: Upload, label: 'Upload Your Content' },
  { icon: Database, label: 'Import Brand Assets' },
  { icon: Zap, label: 'Define Your Voice' },
];

const rightStep = { icon: Download, label: 'Deploy Everywhere' };

export default function HowItWorksSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[hsl(222_47%_11%)] relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(270_50%_20%_/_0.15),_transparent_70%)]" />
      
      <div className="max-w-6xl mx-auto relative z-10">
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

        {/* Hub and Spoke Diagram */}
        <div className="relative" style={{ minHeight: '420px' }}>
          
          {/* SVG Curved Lines */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 420"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Gradient for lines */}
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(270 70% 60%)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(200 100% 60%)" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            
            {/* Lines from left cards to center hub */}
            {/* Card 1 to Hub */}
            <path 
              d="M 200 70 Q 350 70, 500 210" 
              stroke="url(#lineGradient)" 
              strokeWidth="2" 
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Card 2 to Hub */}
            <path 
              d="M 200 210 Q 350 210, 500 210" 
              stroke="url(#lineGradient)" 
              strokeWidth="2" 
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Card 3 to Hub */}
            <path 
              d="M 200 350 Q 350 350, 500 210" 
              stroke="url(#lineGradient)" 
              strokeWidth="2" 
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Hub to right card */}
            <path 
              d="M 500 210 Q 650 210, 800 210" 
              stroke="url(#lineGradient)" 
              strokeWidth="2" 
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          {/* Layout Grid */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-8 relative z-10">
            
            {/* Left Column - Input Cards */}
            <div className="flex flex-col gap-6">
              {leftSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-44 h-20 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center transition-all hover:border-white/20 hover:bg-[hsl(222_40%_18%)]">
                    <step.icon className="w-7 h-7 text-white/70" />
                  </div>
                  <span className="mt-3 text-white/60 text-sm text-center">{step.label}</span>
                </div>
              ))}
            </div>

            {/* Center Hub */}
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-[hsl(222_40%_16%)] border border-white/20 flex items-center justify-center relative">
                {/* Subtle glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(270_70%_60%_/_0.1)] to-[hsl(200_100%_60%_/_0.1)]" />
                <div className="text-center relative z-10">
                  <span className="text-white font-semibold text-sm leading-tight block">CampusVoice</span>
                  <span className="text-white/60 text-xs">AI Engine</span>
                </div>
              </div>
            </div>

            {/* Right Column - Output Card */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-44 h-20 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center transition-all hover:border-white/20 hover:bg-[hsl(222_40%_18%)]">
                <rightStep.icon className="w-7 h-7 text-white/70" />
              </div>
              <span className="mt-3 text-white/60 text-sm text-center">{rightStep.label}</span>
            </div>
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
    </section>
  );
}
