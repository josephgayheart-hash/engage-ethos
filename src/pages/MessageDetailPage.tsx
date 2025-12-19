import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useMemo, useRef } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useJourneyExport } from "@/hooks/useJourneyExport";
import { SmsCharCounter } from "@/components/ui/sms-char-counter";
import { JourneyViewer, isJourneyContent, parseJourneyContent } from "@/components/library/JourneyViewer";
import { 
  ChevronRight, 
  ArrowLeft, 
  Copy, 
  Trash2, 
  History, 
  Map,
  Calendar,
  User,
  Tag,
  Mail,
  MessageSquare,
  Globe,
  Layout,
  FileText,
  GitBranch,
  FileDown,
  Printer,
  Send,
  Check,
  Pencil,
  MoreHorizontal,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const channelIcons = {
  'email': Mail,
  'sms': MessageSquare,
  'portal': Layout,
  'landing-page': Globe,
};

const MessageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { messages, deleteMessage, updateMessage } = useMessageLibrary();
  const { addTemplate } = useSharedLibrary();
  const [copied, setCopied] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const journeyContentRef = useRef<HTMLDivElement>(null);

  const message = messages.find(m => m.id === id);
  const isJourney = useMemo(() => message ? isJourneyContent(message.content) : false, [message]);
  const journeyData = useMemo(() => isJourney && message ? parseJourneyContent(message.content) : null, [message, isJourney]);

  const { isExporting, exportToPdf, printJourney } = useJourneyExport({
    title: message?.title || "Journey Export",
    containerRef: journeyContentRef,
  });

  if (!message) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="font-serif text-2xl font-bold mb-2">Message Not Found</h1>
            <p className="text-muted-foreground mb-6">This message may have been deleted or doesn't exist.</p>
            <Link to="/library">
              <Button>Back to My Library</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const ChannelIcon = channelIcons[message.channel as keyof typeof channelIcons] || FileText;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    deleteMessage(message.id);
    toast({ title: "Message deleted" });
    navigate("/library");
  };

  const handleStartEditTitle = () => {
    setEditedTitle(message.title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== message.title) {
      updateMessage(message.id, { title: editedTitle.trim() });
      toast({ title: "Title updated" });
    }
    setIsEditingTitle(false);
  };

  const handleSubmitToLibrary = () => {
    // Add to shared library as submitted
    const journeyWithMetadata = journeyData as (typeof journeyData & { _metadata?: any });
    
    addTemplate({
      title: message.title,
      intentStatement: `Strategy journey for ${message.audience || 'students'}`,
      content: message.content,
      status: 'submitted',
      version: '1.0',
      owner: 'Current User',
      maintainer: 'Current User',
      placeholders: [],
      requiredFields: {
        audience: message.audience ? [message.audience] : [],
        moment: message.moment ? [message.moment] : [],
        channel: message.channels || (message.channel ? [message.channel] : []),
      },
      useCases: {
        whenToUse: journeyWithMetadata?._metadata?.phases?.map((p: any) => p.focus) || [],
        whenNotToUse: [],
      },
      ethicalGuardrails: ['Review all touchpoints before publishing'],
      institutionalProfileId: message.institutionalProfileId,
      institutionalProfileName: message.institutionalProfileName,
    });

    // Mark as submitted in personal library
    updateMessage(message.id, { 
      submittedToLibrary: true, 
      submittedAt: new Date().toISOString() 
    });

    setShowSubmitDialog(false);
    toast({ 
      title: "Submitted to University Library",
      description: "Your journey has been sent for approval.",
    });
  };

  const handleRemixJourney = () => {
    // Navigate to strategy page with journey data for remixing (creates a copy)
    const journeyWithMetadata = journeyData as (typeof journeyData & { _metadata?: any });
    navigate('/strategy', { 
      state: { 
        editMode: 'remix',
        journeyData: journeyData,
        metadata: journeyWithMetadata?._metadata,
        originalTitle: message.title,
        originalId: message.id,
        source: 'personal'
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/library">My Library</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{message.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              {/* Top row: Back button + Title */}
              <div className="flex items-start gap-4 mb-4">
                <Link to="/library">
                  <Button variant="ghost" size="icon" className="shrink-0 -ml-2">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div className="flex-1 min-w-0">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-xl font-bold h-10 flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle();
                          if (e.key === 'Escape') setIsEditingTitle(false);
                        }}
                      />
                      <Button size="icon" variant="default" onClick={handleSaveTitle}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setIsEditingTitle(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ChannelIcon className="w-5 h-5 text-muted-foreground shrink-0" />
                      <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground truncate">
                        {message.title}
                      </h1>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="shrink-0 h-8 w-8"
                        onClick={handleStartEditTitle}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta info row */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-5 flex-wrap pl-10">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(message.createdAt).toLocaleDateString()}
                </span>
                {message.submittedToLibrary && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-200">
                    Submitted
                  </Badge>
                )}
                {message.remixedFrom && (
                  <Badge variant="outline" className="text-muted-foreground font-normal">
                    <GitBranch className="w-3 h-3 mr-1" />
                    From: {message.remixedFrom.title}
                  </Badge>
                )}
              </div>

              {/* Action buttons row */}
              <div className="flex items-center gap-2 pl-10 flex-wrap">
                {/* Primary action */}
                {!message.submittedToLibrary && isJourney && (
                  <Button onClick={() => setShowSubmitDialog(true)} size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Send to University Library
                  </Button>
                )}
                
                {isJourney && journeyData && (
                  <Button onClick={handleRemixJourney} variant="outline" size="sm">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Remix
                  </Button>
                )}

                <Button onClick={handleCopy} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? "Copied!" : "Copy"}
                </Button>

                {/* More actions dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4 mr-2" />
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isJourney && journeyData && (
                      <>
                        <DropdownMenuItem onClick={exportToPdf} disabled={isExporting}>
                          <FileDown className="w-4 h-4 mr-2" />
                          {isExporting ? "Exporting..." : "Export PDF"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={printJourney}>
                          <Printer className="w-4 h-4 mr-2" />
                          Print
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Submit to Library Dialog */}
          <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send to University Library</DialogTitle>
                <DialogDescription>
                  This will submit your journey "{message.title}" for approval. Once approved, it will be available to all users in the University Library.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  The journey will be reviewed by library administrators before being published.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitToLibrary} className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit for Approval
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Content Tabs */}
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="metadata">Details</TabsTrigger>
              <TabsTrigger value="versions" className="flex items-center gap-1">
                <History className="w-4 h-4" />
                Versions ({message.versions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {isJourney && journeyData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Map className="w-5 h-5 text-primary" />
                      Strategy Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div ref={journeyContentRef} data-pdf-section>
                      <JourneyViewer journey={journeyData} />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Message Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-6">
                      <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{message.content}</pre>
                      {message.channel === 'sms' && (
                        <SmsCharCounter text={message.content} className="mt-4" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="metadata" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Message Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Tag className="w-4 h-4" /> Channel
                      </p>
                      <Badge variant="secondary" className="text-sm">{message.channel}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <User className="w-4 h-4" /> Audience
                      </p>
                      <Badge variant="secondary" className="text-sm">{message.audience}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Moment</p>
                      <Badge variant="outline" className="text-sm">{message.moment}</Badge>
                    </div>
                    {message.domain && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Domain</p>
                        <Badge variant="outline" className="text-sm">{message.domain}</Badge>
                      </div>
                    )}
                    {message.goal && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Goal</p>
                        <Badge variant="outline" className="text-sm">{message.goal}</Badge>
                      </div>
                    )}
                    {message.tone && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Tone</p>
                        <Badge variant="outline" className="text-sm">{message.tone}</Badge>
                      </div>
                    )}
                  </div>

                  {message.senderRecommendation && (
                    <>
                      <Separator className="my-6" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Sender Recommendation</p>
                        <p className="text-sm">{message.senderRecommendation}</p>
                      </div>
                    </>
                  )}

                  {message.notes && (
                    <>
                      <Separator className="my-6" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                        <p className="text-sm">{message.notes}</p>
                      </div>
                    </>
                  )}

                  {message.institutionalProfileName && (
                    <>
                      <Separator className="my-6" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Institutional Profile</p>
                        <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                          {message.institutionalProfileName}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timestamps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                      <p className="text-sm">{new Date(message.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                      <p className="text-sm">{new Date(message.updatedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Mode</p>
                      <p className="text-sm capitalize">{message.mode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="versions" className="space-y-4">
              {message.versions.map((version, idx) => (
                <Card key={version.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Version {message.versions.length - idx}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {new Date(version.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {version.changeNotes && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        {version.changeNotes}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm bg-muted rounded-lg p-4 font-sans">
                      {version.content}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MessageDetailPage;
