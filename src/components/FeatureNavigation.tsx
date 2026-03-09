import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  BarChart3, 
  Target, 
  BookOpen,
  Dna,
  ArrowRight,
  Image,
  Palette,
  Bot,
  Globe,
  BarChart,
} from "lucide-react";

const allFeatures = [
  {
    id: "message-builder",
    icon: MessageSquare,
    title: "Message Builder",
    description: "Generate brand-aligned content grounded in your brand promise and positioning.",
    link: "/features/message-builder",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-300",
  },
  {
    id: "content-dna",
    icon: Dna,
    title: "Content DNA Studio",
    description: "Upload samples or scrape from your website, tune voice dimensions, and build your AI voice foundation.",
    link: "/features/content-dna",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-300",
  },
  {
    id: "image-studio",
    icon: Image,
    title: "AI Image Studio",
    description: "Generate on-brand photography and graphic designs across 19 communication formats.",
    link: "/features/image-studio",
    color: "text-pink-600",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-300",
  },
  {
    id: "brand-studio",
    icon: Palette,
    title: "AI Brand Studio",
    description: "Layer logos, headlines, CTAs, and brand patterns onto any image with Smart Layer masking.",
    link: "/features/brand-studio",
    color: "text-violet-600",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-300",
  },
  {
    id: "ai-copywriter",
    icon: Bot,
    title: "AI Copywriter",
    description: "A brand-aware messaging assistant that knows your voice, facts, and stories.",
    link: "/features/ai-copywriter",
    color: "text-teal-600",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-300",
  },
  {
    id: "journey-designer",
    icon: Target,
    title: "Journey Designer",
    description: "Map multi-channel strategies with duration, intensity, and ramp-up controls.",
    link: "/features/journey-designer",
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-300",
  },
  {
    id: "evaluate",
    icon: BarChart3,
    title: "Message Evaluator",
    description: "Score your existing content against persuasion science principles.",
    link: "/features/evaluate",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-300",
  },
  {
    id: "webcrawl",
    icon: Globe,
    title: "WebCrawl Intelligence",
    description: "Automatically extract brand voice from your institutional website.",
    link: "/features/webcrawl",
    color: "text-sky-600",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-300",
  },
  {
    id: "library",
    icon: BookOpen,
    title: "Content Library",
    description: "Governed content with approval workflows and shared templates.",
    link: "/features/library",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-300",
  },
  {
    id: "brand-audit",
    icon: BarChart,
    title: "Brand Audit & Scoring",
    description: "Audit touchpoints across your institution and track brand consistency.",
    link: "/features/brand-audit",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-300",
  },
];

interface FeatureNavigationProps {
  currentFeatureId: string;
}

export function FeatureNavigation({ currentFeatureId }: FeatureNavigationProps) {
  const otherFeatures = allFeatures.filter(f => f.id !== currentFeatureId);
  // Show max 4 at a time to keep it clean
  const displayFeatures = otherFeatures.slice(0, 4);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
              Explore More Features
            </h2>
            <p className="text-muted-foreground">
              Discover the complete CampusVoice toolkit for higher ed communications.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayFeatures.map((feature) => (
              <Link
                key={feature.id}
                to={feature.link}
                className={`group bg-card border-2 ${feature.borderColor} rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
              >
                <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {feature.description}
                </p>
                <div className={`flex items-center gap-1 text-xs font-medium ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <span>Learn more</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
