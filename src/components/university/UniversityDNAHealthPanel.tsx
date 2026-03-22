import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dna, 
  CheckCircle2,
  Circle,
  AlertTriangle,
  ExternalLink,
  FileText,
  Sparkles,
  Palette,
  Camera
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminAnalyticsData, TenantHealthScore } from '@/hooks/useAdminAnalytics';

interface UniversityDNAHealthPanelProps {
  analytics: AdminAnalyticsData | null;
  tenantHealth?: TenantHealthScore;
  isLoading?: boolean;
  expanded?: boolean;
}

interface ProfileDNAStatus {
  id: string;
  name: string;
  profileType: string;
  samplesCount: number;
  hasAnalysis: boolean;
  hasBrandPlatform: boolean;
}

export function UniversityDNAHealthPanel({ 
  analytics, 
  tenantHealth, 
  isLoading,
  expanded 
}: UniversityDNAHealthPanelProps) {
  const { tenant } = useAuth();
  const [profiles, setProfiles] = useState<ProfileDNAStatus[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [campusPhotoCount, setCampusPhotoCount] = useState(0);

  useEffect(() => {
    const fetchProfileDNA = async () => {
      if (!tenant?.id) return;
      
      setLoadingProfiles(true);
      
      // Fetch institutional profiles and campus photo count in parallel
      const [profilesResult, photosResult] = await Promise.all([
        supabase
          .from('institutional_profiles')
          .select('id, name, profile_type')
          .eq('tenant_id', tenant.id),
        supabase
          .from('campus_photo_samples')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('is_active', true)
      ]);

      setCampusPhotoCount(photosResult.count || 0);
      const profilesData = profilesResult.data;

      if (!profilesData) {
        setLoadingProfiles(false);
        return;
      }

      // Fetch DNA data for each profile
      const profileStatuses: ProfileDNAStatus[] = await Promise.all(
        profilesData.map(async (profile) => {
          const [samplesResult, analysisResult] = await Promise.all([
            supabase
              .from('content_dna_samples')
              .select('id', { count: 'exact', head: true })
              .eq('profile_id', profile.id),
            supabase
              .from('content_dna_analysis')
              .select('voice_analysis, brand_platform')
              .eq('profile_id', profile.id)
              .maybeSingle()
          ]);

          return {
            id: profile.id,
            name: profile.name,
            profileType: profile.profile_type,
            samplesCount: samplesResult.count || 0,
            hasAnalysis: !!analysisResult.data?.voice_analysis,
            hasBrandPlatform: !!analysisResult.data?.brand_platform
          };
        })
      );

      setProfiles(profileStatuses);
      setLoadingProfiles(false);
    };

    fetchProfileDNA();
  }, [tenant?.id]);

  if (isLoading || loadingProfiles) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-40" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dnaCompleteness = tenantHealth?.dna_completeness || 0;
  const dnaSamples = tenantHealth?.dna_samples || 0;
  const hasAnalysis = tenantHealth?.has_dna_analysis || false;

  // Calculate overall status
  const steps = [
    { label: 'Content Samples', done: dnaSamples > 0, icon: FileText },
    { label: 'Voice Analysis', done: hasAnalysis, icon: Sparkles },
    { label: 'Brand Platform', done: dnaCompleteness >= 80, icon: Palette },
    { label: 'Campus Photography', done: campusPhotoCount > 0, icon: Camera },
  ];

  const getProfileStatus = (profile: ProfileDNAStatus) => {
    if (profile.hasAnalysis && profile.hasBrandPlatform) return 'complete';
    if (profile.samplesCount > 0 || profile.hasAnalysis) return 'partial';
    return 'empty';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-700">Complete</Badge>;
      case 'partial':
        return <Badge className="bg-amber-100 text-amber-700">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Not Started</Badge>;
    }
  };

  return (
    <Card className={expanded ? '' : 'h-full'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Dna className="w-4 h-4" />
              Content DNA Health
            </CardTitle>
            <CardDescription>
              Voice profile and brand platform status
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/organization-settings?tab=profiles">
              Configure
              <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Completeness</span>
            <span className={`font-bold ${
              dnaCompleteness >= 70 ? 'text-green-600' : 
              dnaCompleteness >= 30 ? 'text-amber-600' : 
              'text-muted-foreground'
            }`}>
              {dnaCompleteness}%
            </span>
          </div>
          <Progress value={dnaCompleteness} className="h-2" />
        </div>

        {/* Setup Steps */}
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                step.done ? 'bg-green-50' : 'bg-muted/30'
              }`}
            >
              {step.done ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
              <step.icon className={`w-4 h-4 ${step.done ? 'text-green-600' : 'text-muted-foreground'}`} />
              <span className={`text-sm ${step.done ? 'text-green-700' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Profile List */}
        {(expanded || profiles.length <= 4) && profiles.length > 0 && (
          <>
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium mb-3">Profiles</h4>
              <ScrollArea className={expanded ? "h-[300px]" : "max-h-[200px]"}>
                <div className="space-y-2">
                  {profiles.map((profile) => {
                    const status = getProfileStatus(profile);
                    return (
                      <div 
                        key={profile.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium">{profile.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {profile.profileType} • {profile.samplesCount} samples
                          </p>
                        </div>
                        {getStatusBadge(status)}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {profiles.length === 0 && (
          <div className="text-center py-6 text-muted-foreground border-t mt-4">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <p className="text-sm">No profiles configured</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link to="/organization-settings?tab=profiles">
                Create Profile
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
