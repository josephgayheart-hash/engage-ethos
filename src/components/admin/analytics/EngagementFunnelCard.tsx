import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  Dna, 
  MessageSquare, 
  Repeat, 
  Zap,
  ChevronRight
} from 'lucide-react';
import { EngagementFunnel } from '@/hooks/useAdminAnalytics';

interface EngagementFunnelCardProps {
  data: EngagementFunnel;
  isLoading?: boolean;
}

interface FunnelStepProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  percentage: number;
  color: string;
}

function FunnelStep({ icon, label, value, total, percentage, color }: FunnelStepProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium truncate">{label}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{value}</span>
            <Badge variant="secondary" className="text-[10px]">
              {percentage}%
            </Badge>
          </div>
        </div>
        <Progress value={percentage} className="h-1.5" />
      </div>
    </div>
  );
}

export function EngagementFunnelCard({ data, isLoading }: EngagementFunnelCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Engagement Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-14 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.total_signups || 1;
  
  const steps = [
    {
      icon: <Users className="w-4 h-4 text-blue-600" />,
      label: "Total Signups",
      value: data.total_signups,
      percentage: 100,
      color: "bg-blue-100"
    },
    {
      icon: <UserCheck className="w-4 h-4 text-green-600" />,
      label: "Completed Login",
      value: data.completed_onboarding,
      percentage: Math.round((data.completed_onboarding / total) * 100),
      color: "bg-green-100"
    },
    {
      icon: <Dna className="w-4 h-4 text-orange-600" />,
      label: "Configured DNA",
      value: data.configured_dna,
      percentage: Math.round((data.configured_dna / total) * 100),
      color: "bg-orange-100"
    },
    {
      icon: <MessageSquare className="w-4 h-4 text-purple-600" />,
      label: "Created First Message",
      value: data.first_message,
      percentage: Math.round((data.first_message / total) * 100),
      color: "bg-purple-100"
    },
    {
      icon: <Repeat className="w-4 h-4 text-indigo-600" />,
      label: "Repeat Users (7d+)",
      value: data.repeat_users,
      percentage: Math.round((data.repeat_users / total) * 100),
      color: "bg-indigo-100"
    },
    {
      icon: <Zap className="w-4 h-4 text-amber-600" />,
      label: "Power Users (10+ actions)",
      value: data.power_users,
      percentage: Math.round((data.power_users / total) * 100),
      color: "bg-amber-100"
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Engagement Funnel
        </CardTitle>
        <CardDescription>User journey from signup to power user</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={step.label}>
              <FunnelStep
                icon={step.icon}
                label={step.label}
                value={step.value}
                total={total}
                percentage={step.percentage}
                color={step.color}
              />
              {index < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
