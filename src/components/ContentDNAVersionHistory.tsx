import { useState } from 'react';
import { useContentDNAVersions, ContentDNAVersion } from '@/hooks/useContentDNAVersions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  History, 
  RotateCcw, 
  Clock, 
  Loader2, 
  FileText,
  ChevronRight,
  Dna,
  Target,
  Settings,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface ContentDNAVersionHistoryProps {
  contentDnaId?: string | null;
  profileId?: string | null;
  onRestore?: () => void;
}

export function ContentDNAVersionHistory({ 
  contentDnaId, 
  profileId,
  onRestore 
}: ContentDNAVersionHistoryProps) {
  const { versions, isLoading, isRestoring, restoreVersion, compareVersions } = useContentDNAVersions({ 
    contentDnaId, 
    profileId 
  });
  
  const [selectedVersion, setSelectedVersion] = useState<ContentDNAVersion | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getVersionChanges = (version: ContentDNAVersion, index: number) => {
    if (index === versions.length - 1) {
      return ['Initial version'];
    }
    const previousVersion = versions[index + 1];
    return compareVersions(previousVersion, version);
  };

  const handleRestoreClick = (version: ContentDNAVersion) => {
    setSelectedVersion(version);
    setShowRestoreDialog(true);
  };

  const handleConfirmRestore = async () => {
    if (!selectedVersion) return;
    
    const success = await restoreVersion(selectedVersion);
    if (success) {
      toast.success(`Restored to version ${selectedVersion.version_number}`);
      onRestore?.();
    } else {
      toast.error('Failed to restore version');
    }
    setShowRestoreDialog(false);
    setSelectedVersion(null);
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <History className="w-5 h-5" />
            Version History
          </CardTitle>
          <CardDescription>
            Track changes to your Content DNA over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No version history yet</p>
            <p className="text-sm mt-1">
              Versions are automatically saved when you analyze or update your Content DNA.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <History className="w-5 h-5" />
            Version History
          </CardTitle>
          <CardDescription>
            {versions.length} version{versions.length !== 1 ? 's' : ''} saved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {versions.map((version, index) => {
                const changes = getVersionChanges(version, index);
                const isCurrent = index === 0;
                
                return (
                  <div
                    key={version.id}
                    className={`relative p-4 rounded-lg border transition-colors ${
                      isCurrent 
                        ? 'border-secondary bg-secondary/5' 
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    {/* Version indicator line */}
                    {index < versions.length - 1 && (
                      <div className="absolute left-7 top-14 bottom-0 w-0.5 bg-border -mb-3" />
                    )}
                    
                    <div className="flex items-start gap-3">
                      {/* Version number circle */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isCurrent 
                          ? 'bg-secondary text-secondary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {version.version_number}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">
                            Version {version.version_number}
                          </span>
                          {isCurrent && (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Current
                            </Badge>
                          )}
                        </div>
                        
                        {/* Timestamp */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <Clock className="w-3 h-3" />
                          {formatDate(version.created_at)}
                        </div>
                        
                        {/* Changes */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {changes.map((change, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {change.includes('Voice') && <Dna className="w-3 h-3 mr-1" />}
                              {change.includes('Brand') && <Target className="w-3 h-3 mr-1" />}
                              {change.includes('Custom') && <Settings className="w-3 h-3 mr-1" />}
                              {change.includes('Sample') && <FileText className="w-3 h-3 mr-1" />}
                              {change}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Sample count */}
                        <div className="text-xs text-muted-foreground">
                          {version.sample_count} sample{version.sample_count !== 1 ? 's' : ''} at this version
                        </div>
                      </div>
                      
                      {/* Restore button */}
                      {!isCurrent && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestoreClick(version)}
                              disabled={isRestoring}
                              className="shrink-0"
                            >
                              {isRestoring && selectedVersion?.id === version.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RotateCcw className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Restore this version</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Version {selectedVersion?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore your Content DNA to version {selectedVersion?.version_number} from {selectedVersion ? formatDate(selectedVersion.created_at) : ''}.
              <br /><br />
              Your current version will be saved in history before restoring.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestore}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
