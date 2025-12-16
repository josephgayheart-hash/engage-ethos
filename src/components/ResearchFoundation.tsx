import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink } from "lucide-react";

export function ResearchFoundation() {
  const foundations = [
    {
      title: "Cialdini's Persuasion Principles",
      description: "Authority, consensus, consistency, reciprocity, liking, and scarcity as universal persuasion mechanisms.",
      citation: "Cialdini, R. B. (2001)"
    },
    {
      title: "Susceptibility to Persuasion",
      description: "Individual differences in responsiveness to specific persuasive strategies.",
      citation: "Kaptein, M. (2009)"
    },
    {
      title: "Elaboration Likelihood Model",
      description: "Central vs. peripheral routes to persuasion based on motivation and ability.",
      citation: "Petty & Cacioppo (1986)"
    },
    {
      title: "MAIN Model",
      description: "Communication technology affordances: Modality, Agency, Interactivity, Navigability.",
      citation: "Sundar (2008)"
    },
    {
      title: "Higher Education Research",
      description: "Authoritative message framing increases students' intentions to engage in positive academic behaviors.",
      citation: "Morrison et al. (2021)"
    },
    {
      title: "Higher Ed Persuasion Framework",
      description: "Applying persuasion principles specifically to higher education student communication contexts.",
      citation: "Gayheart (2025)"
    }
  ];

  return (
    <section id="about" className="py-12 border-t border-border">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Research Foundation
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          PERSIST evaluations are grounded in peer-reviewed persuasion and communication research 
          that has been tested in higher education contexts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {foundations.map((foundation, index) => (
          <Card 
            key={index} 
            className="card-elevated hover:shadow-elevated-lg transition-shadow duration-300"
          >
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-base text-foreground">
                {foundation.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {foundation.description}
              </p>
              <Badge variant="outline" className="text-xs">
                {foundation.citation}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <ExternalLink className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-foreground mb-1">
                Ethical Commitment
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                PERSIST is designed for ethical persuasion—communication that influences 
                while preserving autonomy (O'Keefe). This tool provides decision support 
                for marketers, enrollment teams, and student success professionals. 
                It does not predict individual student behavior, diagnose psychological traits, 
                replace human judgment, or guarantee engagement outcomes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
