import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  RefreshCw, 
  Sparkles, 
  Settings2, 
  Save, 
  BookOpen, 
  Building2,
  Check,
  Loader2
} from 'lucide-react';
import { SaveToLibraryDialog } from '@/components/library/SaveToLibraryDialog';

interface AnalysisActionsCardProps {
  onNewAnalysis: () => void;
  onRewrite: () => void;
  showRewrite: boolean;
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
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
          
          <Button
            className="w-full justify-start bg-[hsl(270_70%_55%)] hover:bg-[hsl(270_70%_50%)]"
            onClick={onRewrite}
            disabled={showRewrite || isDisabled}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Rewrite for Brand
          </Button>

          <Separator className="my-3" />

          {/* Save Actions */}
          <p className="text-xs text-muted-foreground font-medium">Save & Share</p>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSaveDraft}
            disabled={isSaving}
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
            disabled={isSaving}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Save to My Library
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleOpenSaveDialog('shared')}
            disabled={isSaving}
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
