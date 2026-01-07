import { 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Users,
  Dna,
  PenTool,
  Map,
  ChevronRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProfileNode {
  id: string;
  name: string;
  type: "university" | "college" | "department";
  icon: React.ElementType;
  hasDNA: boolean;
  children?: ProfileNode[];
  features?: string[];
}

const profileHierarchy: ProfileNode = {
  id: "sgu",
  name: "Southern Gateway University",
  type: "university",
  icon: Building2,
  hasDNA: true,
  features: ["Master Brand Voice", "Brand Platform", "All Audiences"],
  children: [
    {
      id: "business",
      name: "College of Business",
      type: "college",
      icon: Briefcase,
      hasDNA: true,
      features: ["Professional Tone", "Industry Language", "MBA Focus"],
      children: [
        {
          id: "marketing",
          name: "Marketing Department",
          type: "department",
          icon: Users,
          hasDNA: true,
          features: ["Creative Messaging", "Campaign Voice"],
        },
        {
          id: "finance",
          name: "International Office",
          type: "department",
          icon: Users,
          hasDNA: false,
          features: ["Inherits College Voice"],
        },
      ],
    },
    {
      id: "engineering",
      name: "College of Engineering",
      type: "college",
      icon: GraduationCap,
      hasDNA: true,
      features: ["Technical Precision", "Innovation Focus"],
      children: [
        {
          id: "cs",
          name: "Computer Science",
          type: "department",
          icon: Users,
          hasDNA: true,
          features: ["Tech-Forward", "Startup Culture"],
        },
      ],
    },
    {
      id: "admissions",
      name: "Office of Admissions",
      type: "college",
      icon: Map,
      hasDNA: true,
      features: ["Warm Welcome", "Student-First", "Prospective Focus"],
    },
  ],
};

const typeColors = {
  university: "bg-primary text-primary-foreground",
  college: "bg-accent text-accent-foreground",
  department: "bg-muted text-foreground",
};

const typeBorderColors = {
  university: "border-primary/30",
  college: "border-accent/30",
  department: "border-border",
};

function ProfileCard({ profile, depth = 0 }: { profile: ProfileNode; depth?: number }) {
  const Icon = profile.icon;
  
  return (
    <div className={cn("space-y-3", depth > 0 && "ml-6 md:ml-8")}>
      <div className={cn(
        "bg-card rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow",
        typeBorderColors[profile.type]
      )}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            typeColors[profile.type]
          )}>
            <Icon className="w-5 h-5" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground">{profile.name}</h4>
              {profile.hasDNA && (
                <Badge variant="outline" className="text-xs gap-1 bg-primary/5 border-primary/20 text-primary">
                  <Dna className="w-3 h-3" />
                  Content DNA
                </Badge>
              )}
            </div>
            
            {/* Features */}
            {profile.features && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profile.features.map((feature, i) => (
                  <span key={i} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* DNA Status */}
          {profile.hasDNA && (
            <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
          )}
        </div>
      </div>
      
      {/* Children */}
      {profile.children && profile.children.length > 0 && (
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-5 top-0 bottom-4 w-0.5 bg-border hidden md:block" />
          
          <div className="space-y-3">
            {profile.children.map((child) => (
              <div key={child.id} className="relative">
                {/* Horizontal connector */}
                <div className="absolute left-5 top-6 w-3 h-0.5 bg-border hidden md:block" />
                <ProfileCard profile={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MultiLevelProfileShowcase() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
          <Building2 className="w-3 h-3 mr-1" />
          Multi-Level Brand Management
        </Badge>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
          One Platform. Every Voice.
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your institution's master brand while empowering colleges, departments, and units 
          with their own AI-powered Content DNA, Message Builder, and Journey Designer.
        </p>
      </div>
      
      {/* Profile Hierarchy */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl border border-border p-6 md:p-8">
        <ProfileCard profile={profileHierarchy} />
      </div>
      
      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Dna className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Inherited + Custom DNA</h3>
          <p className="text-sm text-muted-foreground">
            Sub-units inherit the master brand voice but can layer on their own vocabulary, tone adjustments, and specialized terminology.
          </p>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <PenTool className="w-6 h-6 text-accent" />
          </div>
          <h3 className="font-semibold mb-2">Decentralized Creation</h3>
          <p className="text-sm text-muted-foreground">
            Each college or department can generate their own messages and journeys—all while staying on-brand with the institution.
          </p>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">Centralized Governance</h3>
          <p className="text-sm text-muted-foreground">
            Admins maintain oversight with shared templates, approval workflows, and brand compliance scoring across all units.
          </p>
        </div>
      </div>
      
      {/* Use Cases */}
      <div className="bg-muted/30 rounded-xl p-6">
        <h3 className="font-semibold text-center mb-6">Perfect For:</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "Large Research Universities",
            "Multi-Campus Systems",
            "Colleges with Many Departments",
            "University Hospitals",
            "Athletic Departments",
            "Advancement & Alumni Offices",
            "Student Affairs Divisions"
          ].map((useCase, i) => (
            <Badge key={i} variant="secondary" className="px-4 py-2">
              <CheckCircle2 className="w-3 h-3 mr-1.5" />
              {useCase}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
