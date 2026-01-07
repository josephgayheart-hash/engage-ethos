import { 
  Building2, 
  Dna, 
  Palette, 
  Users, 
  Clock, 
  Mail, 
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
  example: string | string[];
  color: string;
  bgColor: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: Building2,
    title: "Institutional Profile",
    description: "Select your institution or sub-unit to ground all content in your specific context.",
    example: "Southern Gateway University",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    number: 2,
    icon: Dna,
    title: "Content DNA",
    description: "Your institution's unique voice patterns, vocabulary, and communication style.",
    example: "Warm, accessible tone • Gateway metaphors • Student-first language",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
  {
    number: 3,
    icon: Palette,
    title: "Brand Layer",
    description: "Choose which brand pillars, proof points, and commitments to emphasize.",
    example: ["Opportunity", "Community", "Innovation"],
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    number: 4,
    icon: Users,
    title: "Audience & Context",
    description: "Define who you're speaking to and their journey moment.",
    example: "First-Year Students • Early Term Check-In",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  {
    number: 5,
    icon: Mail,
    title: "Channel Selection",
    description: "Pick the channels you need—each gets optimized content.",
    example: ["Email", "SMS", "Portal"],
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
  },
];

function StepCard({ step, isLast }: { step: Step; isLast: boolean }) {
  return (
    <div className="relative">
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow h-full">
        {/* Step Number Badge */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-4",
          step.bgColor, step.color
        )}>
          {step.number}
        </div>
        
        {/* Icon and Title */}
        <div className="flex items-center gap-2 mb-2">
          <step.icon className={cn("w-5 h-5", step.color)} />
          <h4 className="font-semibold text-foreground">{step.title}</h4>
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">
          {step.description}
        </p>
        
        {/* Example Value */}
        <div className="mt-auto">
          <div className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Example</div>
          {Array.isArray(step.example) ? (
            <div className="flex flex-wrap gap-1.5">
              {step.example.map((item, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <div className={cn(
              "text-sm font-medium px-3 py-2 rounded-lg border",
              step.bgColor, step.color, "border-current/20"
            )}>
              {step.example}
            </div>
          )}
        </div>
      </div>
      
      {/* Arrow connector (hidden on last item and mobile) */}
      {!isLast && (
        <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
          <ArrowRight className="w-6 h-6 text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
}

export function BuilderStepsShowcase() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
          How the Message Builder Works
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Each layer filters and refines your content, ensuring every message is perfectly aligned 
          with your institution's voice and your audience's needs.
        </p>
      </div>
      
      {/* Steps Grid - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
        {steps.map((step, i) => (
          <StepCard key={step.number} step={step} isLast={i === steps.length - 1} />
        ))}
      </div>
      
      {/* Result Preview */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-purple-500/5 rounded-2xl border border-border p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-semibold text-lg mb-2">Result: Brand-Aligned Content</h3>
            <p className="text-muted-foreground text-sm">
              The AI generates content that sounds like <strong>Southern Gateway University</strong>—not generic 
              higher ed speak—tailored for <strong>first-year students</strong> checking in during 
              <strong> early term</strong>, delivered across <strong>email, SMS, and portal</strong>.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Badge className="bg-accent/20 text-accent border-accent/30 text-sm px-4 py-1.5">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              On-Brand Output
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
