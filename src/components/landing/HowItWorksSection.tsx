import { Badge } from '@/components/ui/badge';
import { Upload, Sparkles, Send, ChevronRight } from 'lucide-react';

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(220_35%_92%)] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[hsl(270_70%_60%_/_0.06)] rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-[hsl(82_85%_55%_/_0.2)] text-[hsl(82_60%_35%)] border-[hsl(82_85%_55%_/_0.4)]">
            How It Works
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
            Your brand. <span className="text-[hsl(270_50%_50%)]">Amplified by AI.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Upload your brand assets, let AI learn your voice, and deploy on-brand content everywhere.
          </p>
        </div>

        {/* Simple 3-column layout */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-4 items-start">
          {/* Step 1: Input */}
          <div className="text-center group">
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[hsl(82_85%_55%_/_0.15)] mb-5 transition-transform group-hover:scale-105">
              <Upload className="w-9 h-9 text-[hsl(82_70%_40%)]" />
              <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[hsl(82_85%_55%)] text-white text-sm font-bold flex items-center justify-center">
                1
              </span>
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">Feed Your Brand</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Upload guidelines, sample content, and voice documents. We learn what makes you, you.
            </p>
          </div>

          {/* Arrow - desktop only */}
          <div className="hidden md:flex items-center justify-center self-center -mx-4">
            <ChevronRight className="w-8 h-8 text-[hsl(270_70%_60%_/_0.4)]" />
          </div>

          {/* Step 2: AI Magic */}
          <div className="text-center group md:col-start-2">
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[hsl(270_70%_60%_/_0.15)] mb-5 transition-transform group-hover:scale-105">
              <Sparkles className="w-9 h-9 text-[hsl(270_60%_50%)]" />
              <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[hsl(270_70%_60%)] text-white text-sm font-bold flex items-center justify-center">
                2
              </span>
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">AI Builds Your DNA</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Our AI creates your Content DNA and Brand Layer—your unique voice fingerprint.
            </p>
          </div>

          {/* Arrow - desktop only */}
          <div className="hidden md:flex items-center justify-center self-center -mx-4">
            <ChevronRight className="w-8 h-8 text-[hsl(270_70%_60%_/_0.4)]" />
          </div>

          {/* Step 3: Output */}
          <div className="text-center group md:col-start-3">
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[hsl(200_100%_50%_/_0.15)] mb-5 transition-transform group-hover:scale-105">
              <Send className="w-9 h-9 text-[hsl(200_100%_45%)]" />
              <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[hsl(200_100%_50%)] text-white text-sm font-bold flex items-center justify-center">
                3
              </span>
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">Create & Deploy</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Generate on-brand messages, build journeys, and push to your CRM—all governed.
            </p>
          </div>
        </div>
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
