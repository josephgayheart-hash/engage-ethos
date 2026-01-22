import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  MessageSquare,
  Route,
  FileCheck,
  Library,
  CheckCircle2,
  Circle,
  ExternalLink
} from 'lucide-react';
import type { AdminAnalyticsData, TenantHealthScore } from '@/hooks/useAdminAnalytics';

interface UniversityFeatureAdoptionPanelProps {
  analytics: AdminAnalyticsData | null;
  tenantHealth?: TenantHealthScore;
  isLoading?: boolean;
  expanded?: boolean;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  count: number;
  isUsed: boolean;
  link: string;
}

function FeatureCard({ icon, name, description, count, isUsed, link }: FeatureCardProps) {
  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      isUsed ? 'bg-green-50/50 border-green-200' : 'hover:bg-muted/30'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isUsed ? 'bg-green-100' : 'bg-muted'}`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">{name}</h4>
              {isUsed ? (
                <CheckCircle2 className="w-3 h-3 text-green-600" />
              ) : (
                <Circle className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
            <p className={`text-lg font-bold mt-1 ${isUsed ? 'text-green-700' : 'text-muted-foreground'}`}>
              {count}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <Link to={link}>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function UniversityFeatureAdoptionPanel({ 
  analytics, 
  tenantHealth, 
  isLoading,
  expanded 
}: UniversityFeatureAdoptionPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-40" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const messagesGenerated = tenantHealth?.messages_generated || 0;
  const journeysCreated = tenantHealth?.journeys_created || 0;
  const evaluationsRun = tenantHealth?.evaluations_run || 0;
  const libraryItems = tenantHealth?.library_items || 0;

  const features = [
    {
      icon: <MessageSquare className="w-4 h-4 text-purple-600" />,
      name: 'Message Builder',
      description: 'AI-powered content generation',
      count: messagesGenerated,
      isUsed: messagesGenerated > 0,
      link: '/build'
    },
    {
      icon: <Route className="w-4 h-4 text-indigo-600" />,
      name: 'Journey Designer',
      description: 'Communication flow creation',
      count: journeysCreated,
      isUsed: journeysCreated > 0,
      link: '/strategy'
    },
    {
      icon: <FileCheck className="w-4 h-4 text-teal-600" />,
      name: 'Content Evaluator',
      description: 'Brand voice scoring',
      count: evaluationsRun,
      isUsed: evaluationsRun > 0,
      link: '/evaluate'
    },
    {
      icon: <Library className="w-4 h-4 text-orange-600" />,
      name: 'Content Library',
      description: 'Saved templates & messages',
      count: libraryItems,
      isUsed: libraryItems > 0,
      link: '/shared-library'
    }
  ];

  const featuresUsed = features.filter(f => f.isUsed).length;
  const adoptionPercentage = Math.round((featuresUsed / features.length) * 100);

  return (
    <Card className={expanded ? '' : 'h-full'}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Feature Adoption
        </CardTitle>
        <CardDescription>
          Which platform features your team is using
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Adoption */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Features Adopted</span>
            <span className="font-bold">
              {featuresUsed} of {features.length}
            </span>
          </div>
          <Progress value={adoptionPercentage} className="h-2" />
          <div className="flex items-center gap-2 flex-wrap">
            {features.map((feature, i) => (
              <Badge 
                key={i}
                variant={feature.isUsed ? 'default' : 'outline'}
                className={feature.isUsed ? 'bg-green-100 text-green-700' : 'text-muted-foreground'}
              >
                {feature.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div className={`grid ${expanded ? 'md:grid-cols-2' : 'grid-cols-1'} gap-3 pt-2`}>
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* Recommendations */}
        {featuresUsed < features.length && (
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium mb-2">Recommendations</h4>
            <div className="space-y-2">
              {features.filter(f => !f.isUsed).slice(0, 2).map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    <span className="text-sm">Try {feature.name}</span>
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0" asChild>
                    <Link to={feature.link}>Get Started</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
