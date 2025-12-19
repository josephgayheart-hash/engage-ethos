import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { ContextSelector } from "@/components/ContextSelector";
import { EvaluationResults } from "@/components/EvaluationResults";
import { LibraryNav } from "@/components/LibraryNav";
import { CreateTemplateDialog } from "@/components/library/CreateTemplateDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useInstitutionalConfig } from "@/hooks/useInstitutionalConfig";
import { evaluateMessage } from "@/lib/evaluateMessage";
import { extractTextFromFile, getAcceptString } from "@/lib/documentParser";
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  FileText, 
  X, 
  Save, 
  Share2, 
  RefreshCw,
  Plus,
  Tag,
  FolderOpen,
  Sparkles
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { MessageContext, EvaluationResult } from "@/types/uplaybook";

const BYOCPage = () => {
  const { toast } = useToast();
  const { addMessage } = useMessageLibrary();
  const { addTemplate } = useSharedLibrary();
  const { config: institutionalConfig } = useInstitutionalConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messageContent, setMessageContent] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [context, setContext] = useState<MessageContext>({
    audience: undefined,
    moment: undefined,
    channel: undefined,
  });
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const canProcess = messageContent.trim().length > 20;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const { text, success, message } = await extractTextFromFile(file);
    
    if (success && text) {
      setMessageContent(text);
      if (!messageTitle) {
        setMessageTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      toast({
        title: "File Loaded",
        description: message || `Content from "${file.name}" has been loaded.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Could not extract content",
        description: message || "Please copy and paste the content directly.",
      });
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !customTags.includes(trimmedTag)) {
      setCustomTags([...customTags, trimmedTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleEvaluate = async () => {
    if (!canProcess) return;
    
    setIsProcessing(true);
    setEvaluationResult(null);
    
    try {
      const result = await evaluateMessage(messageContent, context, institutionalConfig);
      setEvaluationResult(result);
      
      toast({
        title: "Evaluation Complete",
        description: "Your communication has been analyzed using the five-pillar framework.",
      });
    } catch (error) {
      console.error("Evaluation failed:", error);
      toast({
        variant: "destructive",
        title: "Evaluation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToLibrary = () => {
    const title = messageTitle || `Imported: ${messageContent.slice(0, 40)}${messageContent.length > 40 ? '...' : ''}`;
    
    addMessage({
      title,
      content: messageContent,
      channel: context.channel,
      audience: context.audience,
      cohort: context.cohort ? [context.cohort] : undefined,
      domain: context.domain,
      moment: context.moment,
      goal: context.goal,
      tone: context.tone,
      approved: false,
      mode: 'evaluated',
      notes: customTags.length > 0 ? `Tags: ${customTags.join(', ')}` : undefined,
    });

    toast({
      title: "Saved to Library",
      description: "Your communication has been saved to your personal library.",
    });
  };

  const handleShareToLibrary = (templateData: any) => {
    const newTemplate = addTemplate({
      ...templateData,
      content: messageContent,
    });

    toast({
      title: "Submitted to Shared Library",
      description: "Your template has been submitted for review.",
    });

    setShowShareDialog(false);
  };

  const handleReset = () => {
    setMessageContent("");
    setMessageTitle("");
    setFileName(null);
    setCustomTags([]);
    setEvaluationResult(null);
    setContext({
      audience: undefined,
      moment: undefined,
      channel: undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Import & Evaluate</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Upload className="w-7 h-7 text-pillar-consensus" />
                Bring Your Own Comm
              </h1>
              <p className="text-muted-foreground mt-1">
                Import, evaluate, tag, and share your existing communications
              </p>
            </div>
            <AIBadge />
          </div>

          {/* Library Navigation */}
          <LibraryNav mode="messages" />

          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Import Your Communication</CardTitle>
              <CardDescription>
                Upload a file or paste your content directly to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="message-title">Title (Optional)</Label>
                <Input
                  id="message-title"
                  placeholder="Give your communication a descriptive title..."
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  className="bg-background"
                />
              </div>

              {/* File Upload & Google Drive */}
              <div className="space-y-2">
                <Label>Import Source</Label>
                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={getAcceptString()}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </Button>
                  
                  {/* Google Drive - Coming Soon */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        disabled
                        className="flex items-center gap-2 opacity-60"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Google Drive
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
                          Coming Soon
                        </Badge>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Import from Google Drive - feature in development</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {fileName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      {fileName}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setFileName(null)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: .txt, .docx, .pdf
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or paste content</span>
                </div>
              </div>

              {/* Content Textarea */}
              <div className="space-y-2">
                <Label htmlFor="message-content">Message Content</Label>
                <Textarea
                  id="message-content"
                  placeholder="Paste your email, SMS, or other communication here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="min-h-[200px] bg-background resize-y"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{messageContent.length} characters</span>
                  {messageContent.length < 20 && messageContent.length > 0 && (
                    <span className="text-destructive">Minimum 20 characters required</span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Context Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Categorize Your Communication</Label>
                <ContextSelector context={context} onChange={setContext} mode="evaluator" />
              </div>

              <Separator />

              {/* Custom Tags */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Custom Tags
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add custom tags to help others find and understand this communication
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-background max-w-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {customTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {customTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Action Buttons - Three Clear Options */}
              <div className="space-y-4">
                <Label className="text-base font-medium">What would you like to do?</Label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Evaluate */}
                  <Button 
                    onClick={handleEvaluate}
                    disabled={!canProcess || isProcessing}
                    className="flex items-center justify-center gap-2 h-auto py-4"
                    variant={evaluationResult ? "outline" : "default"}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <div className="text-left">
                          <div className="font-medium">Evaluate</div>
                          <div className="text-xs opacity-80">AI Analysis</div>
                        </div>
                      </>
                    )}
                  </Button>
                  
                  {/* Save to My Library */}
                  <Button
                    variant="outline"
                    onClick={handleSaveToLibrary}
                    disabled={!canProcess}
                    className="flex items-center justify-center gap-2 h-auto py-4"
                  >
                    <Save className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-medium">Save to My Library</div>
                      <div className="text-xs text-muted-foreground">Personal use</div>
                    </div>
                  </Button>
                  
                  {/* Submit to Shared Library */}
                  <Button
                    variant="outline"
                    onClick={() => setShowShareDialog(true)}
                    disabled={!canProcess}
                    className="flex items-center justify-center gap-2 h-auto py-4"
                  >
                    <Share2 className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-medium">Submit to Shared</div>
                      <div className="text-xs text-muted-foreground">For review</div>
                    </div>
                  </Button>
                </div>

                {!canProcess && messageContent.length > 0 && (
                  <p className="text-sm text-destructive">
                    Please enter at least 20 characters to continue.
                  </p>
                )}

                {(messageContent || evaluationResult) && (
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Start Over
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {evaluationResult && (
            <div className="animate-fade-in">
              <EvaluationResults result={evaluationResult} />
            </div>
          )}
        </div>
      </main>

      {/* Share to Library Dialog */}
      <CreateTemplateDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        onSubmit={handleShareToLibrary}
        initialContent={messageContent}
      />
    </div>
  );
};

export default BYOCPage;
