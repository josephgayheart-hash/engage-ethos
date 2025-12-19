import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useMemo, useRef } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useJourneyExport } from "@/hooks/useJourneyExport";
import { SmsCharCounter } from "@/components/ui/sms-char-counter";
import { JourneyViewer, isJourneyContent, parseJourneyContent } from "@/components/library/JourneyViewer";
import { 
  ChevronRight, 
  ArrowLeft, 
  Copy, 
  Trash2, 
  CheckCircle, 
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
  Edit,
  GitBranch,
  FileDown,
  Printer
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [copied, setCopied] = useState(false);
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

  const handleApprove = () => {
    updateMessage(message.id, { approved: true });
    toast({ title: "Message approved" });
  };

  const handleDelete = () => {
    deleteMessage(message.id);
    toast({ title: "Message deleted" });
    navigate("/library");
  };

  const handleEditJourney = () => {
    // Navigate to strategy page with journey data for editing
    const journeyWithMetadata = journeyData as (typeof journeyData & { _metadata?: any });
    navigate('/strategy', { 
      state: { 
        editMode: 'edit',
        journeyId: message.id,
        journeyData: journeyData,
        metadata: journeyWithMetadata?._metadata
      } 
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
        originalTitle: message.title
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

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div className="flex items-start gap-4">
              <Link to="/library">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <ChannelIcon className="w-5 h-5 text-muted-foreground" />
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                    {message.title}
                  </h1>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created {new Date(message.createdAt).toLocaleDateString()}
                  </div>
                  {message.approved && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:shrink-0 flex-wrap">
              {isJourney && journeyData && (
                <>
                  <Button onClick={handleEditJourney} variant="outline" className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button onClick={handleRemixJourney} variant="outline" className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Remix
                  </Button>
                  <Button onClick={exportToPdf} variant="outline" className="flex items-center gap-2" disabled={isExporting}>
                    <FileDown className="w-4 h-4" />
                    {isExporting ? "Exporting..." : "Export PDF"}
                  </Button>
                  <Button onClick={printJourney} variant="outline" className="flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Print
                  </Button>
                </>
              )}
              <Button onClick={handleCopy} variant="outline" className="flex items-center gap-2">
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              {!message.approved && (
                <Button onClick={handleApprove} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Message</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this message? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

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
