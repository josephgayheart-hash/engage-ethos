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
  Tag
} from "lucide-react";
import type { MessageContext, EvaluationResult } from "@/types/persist";

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

    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a .txt, .docx, or .pdf file.",
      });
      return;
    }

    setFileName(file.name);

    // For text files, read directly
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text();
      setMessageContent(text);
      if (!messageTitle) {
        setMessageTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      toast({
        title: "File Loaded",
        description: `Content from "${file.name}" has been loaded.`,
      });
    } else {
      // For PDF/DOCX, inform user to paste content manually for now
      toast({
        title: "File Selected",
        description: "For PDF/DOCX files, please copy and paste the content directly. Full parsing coming soon!",
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
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
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

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Upload File</Label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.docx,.doc"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
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

              {/* Action Buttons */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                  {evaluationResult && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleSaveToLibrary}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save to My Library
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowShareDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Submit to Shared Library
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {(messageContent || evaluationResult) && (
                    <Button variant="ghost" onClick={handleReset}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Start Over
                    </Button>
                  )}
                  <Button 
                    onClick={handleEvaluate}
                    disabled={!canProcess || isProcessing}
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Evaluate Communication
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
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
