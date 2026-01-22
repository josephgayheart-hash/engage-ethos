import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  Route, 
  ClipboardCheck, 
  Dna,
  Globe,
  Layers,
  TrendingUp
} from 'lucide-react';
import { FeatureAdoption } from '@/hooks/useAdminAnalytics';

interface FeatureAdoptionCardProps {
  data: FeatureAdoption[];
  isLoading?: boolean;
}

const featureIcons: Record<string, React.ReactNode> = {
  'Message Builder': <MessageSquare className="w-4 h-4" />,
  'Journey Designer': <Route className="w-4 h-4" />,
  'Evaluator': <ClipboardCheck className="w-4 h-4" />,
  'Content DNA Studio': <Dna className="w-4 h-4" />,
  'Web Analyzer': <Globe className="w-4 h-4" />,
  'Brand Audit': <Layers className="w-4 h-4" />
};

const featureColors: Record<string, string> = {
  'Message Builder': 'bg-blue-100 text-blue-600',
  'Journey Designer': 'bg-purple-100 text-purple-600',
  'Evaluator': 'bg-green-100 text-green-600',
  'Content DNA Studio': 'bg-orange-100 text-orange-600',
  'Web Analyzer': 'bg-cyan-100 text-cyan-600',
  'Brand Audit': 'bg-pink-100 text-pink-600'
};

export function FeatureAdoptionCard({ data, isLoading }: FeatureAdoptionCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Feature Adoption</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by usage
  const sortedData = [...data].sort((a, b) => b.total_usage - a.total_usage);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Feature Adoption
            </CardTitle>
            <CardDescription>Usage across institutions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedData.map((feature) => (
            <div 
              key={feature.feature} 
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className={`p-2 rounded-lg ${featureColors[feature.feature] || 'bg-muted text-muted-foreground'}`}>
                {featureIcons[feature.feature] || <MessageSquare className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{feature.feature}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {feature.tenants_using} institutions
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground">
                      {feature.total_usage} uses
                    </span>
                  </div>
                </div>
                <Progress value={feature.percentage} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
