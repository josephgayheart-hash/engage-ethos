import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Sparkles } from 'lucide-react';
import { InstitutionalProfileSelector } from '@/components/InstitutionalProfileSelector';

interface VoiceProfileCardProps {
  selectedProfileId: string | null;
  onProfileChange: (profileId: string | null) => void;
  hasDNA: boolean;
}

export function VoiceProfileCard({ 
  selectedProfileId, 
  onProfileChange, 
  hasDNA 
}: VoiceProfileCardProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="w-4 h-4 text-primary" />
          Voice Profile Match
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InstitutionalProfileSelector
          selectedProfileId={selectedProfileId}
          onProfileChange={onProfileChange}
          compact
        />
        
        {hasDNA && (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/15">
            <Sparkles className="w-3 h-3 mr-1" />
            DNA Active
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
