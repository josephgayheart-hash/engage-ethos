import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Sparkles, 
  Settings2, 
  Save, 
  BookOpen, 
  Building2,
  Check,
  Loader2,
  Wand2
} from 'lucide-react';
import { SaveToLibraryDialog } from '@/components/library/SaveToLibraryDialog';

interface AnalysisActionsCardProps {
  onNewAnalysis: () => void;
  onRewrite: () => void;
  showRewrite: boolean;
  isRewriting?: boolean;
  isDisabled?: boolean;
  onSaveDraft: () => Promise<void>;
  onSaveToPersonalLibrary: (name: string) => Promise<string | undefined>;
  onSaveToUniversityLibrary: (name: string) => Promise<string | undefined>;
  isSaving?: boolean;
  hasDraft?: boolean;
}

export function AnalysisActionsCard({ 
  onNewAnalysis, 
  onRewrite, 
  showRewrite,
  isRewriting,
  isDisabled,
  onSaveDraft,
  onSaveToPersonalLibrary,
  onSaveToUniversityLibrary,
  isSaving,
  hasDraft
}: AnalysisActionsCardProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveLibraryType, setSaveLibraryType] = useState<'personal' | 'shared'>('personal');
  const [justSavedDraft, setJustSavedDraft] = useState(false);

  const handleSaveDraft = async () => {
    await onSaveDraft();
    setJustSavedDraft(true);
    setTimeout(() => setJustSavedDraft(false), 2000);
  };

  const handleOpenSaveDialog = (type: 'personal' | 'shared') => {
    setSaveLibraryType(type);
    setSaveDialogOpen(true);
  };

  const handleSaveToLibrary = async (name: string): Promise<string | undefined> => {
    if (saveLibraryType === 'personal') {
      return await onSaveToPersonalLibrary(name);
    } else {
      return await onSaveToUniversityLibrary(name);
    }
  };

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="w-4 h-4 text-primary" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Primary Actions */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onNewAnalysis}
            disabled={isRewriting}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
          
          {/* Rewrite Button with Loading State */}
          <Button
            className="w-full justify-start bg-[hsl(270_70%_55%)] hover:bg-[hsl(270_70%_50%)] transition-all"
            onClick={onRewrite}
            disabled={showRewrite || isDisabled || isRewriting}
          >
            {isRewriting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="flex-1 text-left">Rewriting Content...</span>
              </>
            ) : showRewrite ? (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                <span className="flex-1 text-left">Rewrite Panel Open</span>
                <Check className="w-4 h-4 text-white/70" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Rewrite for Brand
              </>
            )}
          </Button>

          {/* Rewriting Progress Indicator */}
          {isRewriting && (
            <div className="p-3 rounded-lg bg-[hsl(270_70%_55%)]/10 border border-[hsl(270_70%_55%)]/20 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-[hsl(270_70%_55%)] animate-pulse" />
                </div>
                <span className="text-xs font-medium text-[hsl(270_70%_45%)]">
                  AI is transforming your content...
                </span>
              </div>
              <Progress value={undefined} className="h-1 [&>div]:animate-pulse" />
              <p className="text-[10px] text-muted-foreground">
                Applying brand voice and fixing issues
              </p>
            </div>
          )}

          <Separator className="my-3" />

          {/* Save Actions */}
          <p className="text-xs text-muted-foreground font-medium">Save & Share</p>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSaveDraft}
            disabled={isSaving || isRewriting}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : justSavedDraft ? (
              <Check className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {justSavedDraft ? 'Saved!' : hasDraft ? 'Update Draft' : 'Save to Drafts'}
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleOpenSaveDialog('personal')}
            disabled={isSaving || isRewriting}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Save to My Library
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleOpenSaveDialog('shared')}
            disabled={isSaving || isRewriting}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Submit to University Library
          </Button>
        </CardContent>
      </Card>

      <SaveToLibraryDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveToLibrary}
        libraryType={saveLibraryType}
      />
    </>
  );
}
