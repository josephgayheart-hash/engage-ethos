import { useState } from 'react';
import { useContentDNAVersions, ContentDNAVersion, TimelineEntry } from '@/hooks/useContentDNAVersions';
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
  Dna,
  Target,
  Settings,
  Check,
  BookOpen,
  BarChart3,
  Camera,
  Palette,
  Globe,
  Sliders,
  Plus,
  Minus,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

interface ContentDNAVersionHistoryProps {
  contentDnaId?: string | null;
  profileId?: string | null;
  onRestore?: () => void;
}

const SECTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  samples: { label: 'Content Samples', icon: <FileText className="w-3 h-3" />, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  analysis: { label: 'DNA Analysis', icon: <Dna className="w-3 h-3" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  stories: { label: 'Story Bank', icon: <BookOpen className="w-3 h-3" />, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  facts: { label: 'Fact Book', icon: <BarChart3 className="w-3 h-3" />, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  photos: { label: 'Campus Photos', icon: <Camera className="w-3 h-3" />, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  design_refs: { label: 'Design References', icon: <Palette className="w-3 h-3" />, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  web_crawl: { label: 'Web Crawl', icon: <Globe className="w-3 h-3" />, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  tuning: { label: 'DNA Tuning', icon: <Sliders className="w-3 h-3" />, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  custom_instructions: { label: 'Custom Instructions', icon: <Settings className="w-3 h-3" />, color: 'text-violet-600 bg-violet-50 border-violet-200' },
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  added: <Plus className="w-3 h-3" />,
  removed: <Minus className="w-3 h-3" />,
  updated: <RefreshCw className="w-3 h-3" />,
  analyzed: <Dna className="w-3 h-3" />,
  imported: <Upload className="w-3 h-3" />,
  scraped: <Globe className="w-3 h-3" />,
  bulk_added: <Plus className="w-3 h-3" />,
  bulk_removed: <Minus className="w-3 h-3" />,
  restored: <RotateCcw className="w-3 h-3" />,
};

function getActivityDescription(entry: TimelineEntry): string {
  if (!entry.activity) return '';
  const { section, action, artifact_name, artifact_count } = entry.activity;
  const sectionLabel = SECTION_CONFIG[section]?.label || section;
  
  if (artifact_count && artifact_count > 1) {
    return `${action === 'imported' ? 'Imported' : action === 'added' ? 'Added' : action.charAt(0).toUpperCase() + action.slice(1)} ${artifact_count} items to ${sectionLabel}`;
  }
  
  const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
  if (artifact_name) {
    return `${actionLabel} "${artifact_name}" in ${sectionLabel}`;
  }
  return `${actionLabel} ${sectionLabel}`;
}

export function ContentDNAVersionHistory({ 
  contentDnaId, 
  profileId,
  onRestore 
}: ContentDNAVersionHistoryProps) {
  const { versions, timeline, isLoading, isRestoring, restoreVersion, compareVersions } = useContentDNAVersions({ 
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
    if (version.change_summary) {
      return version.change_summary.split('; ');
    }
    if (index === versions.length - 1) {
      return ['Initial Content DNA analysis'];
    }
    const previousVersion = versions[index + 1];
    if (!previousVersion) return ['Content DNA updated'];
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

  if (timeline.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <History className="w-5 h-5" />
            Activity & Version History
          </CardTitle>
          <CardDescription>
            Track all changes to your Content DNA over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm mt-1">
              Activity is automatically tracked when you add samples, stories, facts, run analysis, and more.
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
            Activity & Version History
          </CardTitle>
          <CardDescription>
            {timeline.length} event{timeline.length !== 1 ? 's' : ''} · {versions.length} version snapshot{versions.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {timeline.map((entry, index) => {
                if (entry.type === 'version' && entry.version) {
                  const version = entry.version;
                  const versionIndex = versions.findIndex(v => v.id === version.id);
                  const changes = getVersionChanges(version, versionIndex);
                  const isCurrent = versionIndex === 0;
                  
                  return (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        isCurrent 
                          ? 'border-secondary bg-secondary/5' 
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          isCurrent 
                            ? 'bg-secondary text-secondary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {version.version_number}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground text-sm">
                              Version {version.version_number}
                            </span>
                            {isCurrent && (
                              <Badge variant="secondary" className="text-[10px]">
                                <Check className="w-3 h-3 mr-1" />
                                Current
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <Clock className="w-3 h-3" />
                            {formatDate(version.created_at)}
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 mb-1">
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
                          
                          <div className="text-xs text-muted-foreground">
                            {version.sample_count} sample{version.sample_count !== 1 ? 's' : ''} at this version
                          </div>
                        </div>
                        
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
                }

                if (entry.type === 'activity' && entry.activity) {
                  const activity = entry.activity;
                  const config = SECTION_CONFIG[activity.section] || { label: activity.section, icon: <FileText className="w-3 h-3" />, color: 'text-muted-foreground bg-muted border-border' };
                  
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 px-4 py-2.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${config.color}`}>
                        {ACTION_ICONS[activity.action] || config.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          {getActivityDescription(entry)}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatDate(activity.created_at)}
                        </div>
                      </div>
                      
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${config.color}`}>
                        {config.icon}
                        <span className="ml-1">{config.label}</span>
                      </Badge>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

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
