import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { WaveBackground } from "@/components/WaveBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { CreateTemplateDialog } from "@/components/library/CreateTemplateDialog";
import type { SavedMessage, LibraryFilters, SortOption } from "@/types/library";
import { 
  Search, 
  ArrowLeft,
  Copy,
  Trash2,
  Download,
  CheckCircle,
  FileText,
  Mail,
  MessageSquare,
  Globe,
  Layout,
  Filter,
  X,
  Library,
  Calendar,
  User,
  ChevronRight,
  Building2
} from "lucide-react";

const channelIcons = {
  'email': Mail,
  'sms': MessageSquare,
  'portal': Layout,
  'landing-page': Globe,
};

const PersonalLibrary = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin, isApprover } = useAuth();
  const { messages, deleteMessage, duplicateMessage, exportMessage, filterMessages, updateMessage } = useMessageLibrary();
  const { addTemplate } = useSharedLibrary();
  const { getProfileHierarchy } = useInstitutionalProfiles();
  const [filters, setFilters] = useState<LibraryFilters>({ search: '' });
  const [sort, setSort] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [submitToSharedOpen, setSubmitToSharedOpen] = useState(false);
  const [messageToSubmit, setMessageToSubmit] = useState<SavedMessage | null>(null);

  const filteredMessages = filterMessages(filters, sort);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMessage(id);
    toast({ title: "Message deleted" });
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateMessage(id);
    toast({ title: "Message duplicated" });
  };

  const handleExport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    exportMessage(id);
    toast({ title: "Message exported" });
  };

  const handleSubmitToShared = (message: SavedMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessageToSubmit(message);
    setSubmitToSharedOpen(true);
  };

  const handleCreateTemplate = (template: any) => {
    // Auto-publish for admins and approvers
    const templateWithStatus = {
      ...template,
      status: (isAdmin || isApprover) ? 'published' : template.status || 'submitted',
    };
    addTemplate(templateWithStatus);
    // Mark the original message as submitted to University Library
    if (messageToSubmit) {
      updateMessage(messageToSubmit.id, {
        submittedToLibrary: true,
        submittedAt: new Date().toISOString(),
      });
    }
    toast({
      title: (isAdmin || isApprover) ? "Template published" : "Template submitted",
      description: (isAdmin || isApprover) 
        ? "Your message has been published to the University Library."
        : "Your message has been submitted to the University Library for review.",
    });
    setMessageToSubmit(null);
  };

  const handleCardClick = (id: string) => {
    navigate(`/library/${id}`);
  };

  const clearFilters = () => {
    setFilters({ search: '' });
  };

  const hasActiveFilters = filters.channel || filters.audience || filters.domain || filters.moment;

  const ChannelIcon = (channel: string) => {
    const Icon = channelIcons[channel as keyof typeof channelIcons] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header with wave background */}
      <div className="relative overflow-hidden pb-12">
        <WaveBackground variant="teal" />
        
        <div className="relative container mx-auto px-4 pt-10 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
              <span>/</span>
              <span className="text-foreground">Personal Library</span>
            </div>

            {/* Header */}
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="icon-container icon-container-lg bg-accent/10">
                  <Library className="w-6 h-6 text-accent" />
                </div>
                Personal Message Library
              </h1>
              <p className="text-muted-foreground mt-1 ml-14">
                Your saved messages and evaluations
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-6xl mx-auto">

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={filters.search}
                      onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                  <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                    <SelectTrigger className="w-full md:w-[140px]">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && <Badge variant="secondary" className="ml-1">{[filters.channel, filters.audience, filters.domain, filters.moment].filter(Boolean).length}</Badge>}
                  </Button>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1">
                      <X className="w-4 h-4" />
                      Clear
                    </Button>
                  )}
                </div>

                {showFilters && (
                  <div className="flex flex-wrap gap-4 pt-4 border-t">
                    <Select value={filters.channel || 'all'} onValueChange={(v) => setFilters(f => ({ ...f, channel: v === 'all' ? undefined : v }))}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Channels</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="portal">Portal</SelectItem>
                        <SelectItem value="landing-page">Landing Page</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                        <SelectItem value="direct-mail">Direct Mail</SelectItem>
                        <SelectItem value="phone-call">Phone Script</SelectItem>
                        <SelectItem value="talking-points">Talking Points</SelectItem>
                        <SelectItem value="digital-ad-search">Search Ads</SelectItem>
                        <SelectItem value="digital-ad-social">Social Ads</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.audience || 'all'} onValueChange={(v) => setFilters(f => ({ ...f, audience: v === 'all' ? undefined : v }))}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Audiences</SelectItem>
                        <SelectItem value="prospective">Prospective</SelectItem>
                        <SelectItem value="first-year">First-Year</SelectItem>
                        <SelectItem value="continuing">Continuing</SelectItem>
                        <SelectItem value="at-risk">At-Risk</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.domain || 'all'} onValueChange={(v) => setFilters(f => ({ ...f, domain: v === 'all' ? undefined : v }))}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Domains</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="wellbeing">Wellbeing</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.moment || 'all'} onValueChange={(v) => setFilters(f => ({ ...f, moment: v === 'all' ? undefined : v }))}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Moment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Moments</SelectItem>
                        <SelectItem value="recruitment">Recruitment</SelectItem>
                        <SelectItem value="orientation">Orientation</SelectItem>
                        <SelectItem value="registration">Registration</SelectItem>
                        <SelectItem value="early-term">Early Term</SelectItem>
                        <SelectItem value="midterm">Midterm</SelectItem>
                        <SelectItem value="finals">Finals</SelectItem>
                        <SelectItem value="re-engagement">Re-engagement</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages List */}
          {filteredMessages.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-serif text-lg font-semibold mb-2">No messages yet</h3>
                <p className="text-muted-foreground mb-4">
                  Evaluate or generate messages to build your library.
                </p>
                <Link to="/dashboard">
                  <Button>Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <Card 
                  key={message.id} 
                  className="card-elevated cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group" 
                  onClick={() => handleCardClick(message.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {ChannelIcon(message.channel)}
                          <h3 className="font-semibold text-foreground truncate">{message.title}</h3>
                          {message.approved && (
                            <Badge variant="default" className="shrink-0 bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                          {message.submittedToLibrary && (
                            <Badge variant="secondary" className="shrink-0 bg-blue-50 text-blue-600 border-blue-200">
                              <Library className="w-3 h-3 mr-1" />
                              In University Library
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {message.content}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{message.audience}</Badge>
                          <Badge variant="outline">{message.moment}</Badge>
                          {message.domain && <Badge variant="outline">{message.domain}</Badge>}
                          {/* Show profile hierarchy if available */}
                          {message.institutionalProfileId && (() => {
                            const hierarchy = getProfileHierarchy(message.institutionalProfileId);
                            if (hierarchy.profiles.length > 0) {
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                                      <Building2 className="w-3 h-3" />
                                      {hierarchy.profiles.length > 1 
                                        ? `${hierarchy.profiles[0].name} > ${hierarchy.profiles[hierarchy.profiles.length - 1].name}`
                                        : hierarchy.profiles[0].name
                                      }
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="max-w-xs">
                                    <div className="text-xs">
                                      <p className="font-medium mb-1">Profile Hierarchy</p>
                                      <div className="flex items-center flex-wrap gap-0.5">
                                        {hierarchy.profiles.map((profile, idx) => (
                                          <span key={profile.id} className="flex items-center">
                                            <span>{profile.name}</span>
                                            {idx < hierarchy.profiles.length - 1 && (
                                              <ChevronRight className="w-3 h-3 mx-0.5" />
                                            )}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            }
                            return null;
                          })()}
                          {!message.institutionalProfileId && message.institutionalProfileName && (
                            <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                              <Building2 className="w-3 h-3 mr-1" />
                              {message.institutionalProfileName}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={(e) => handleSubmitToShared(message, e)} title="Submit to University Library">
                          <Library className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => handleDuplicate(message.id, e)} title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => handleExport(message.id, e)} title="Export">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => handleDelete(message.id, e)} title="Delete">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground flex-wrap">
                      {message.createdByName && (
                        <>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {message.createdByName}
                          </div>
                          <span>•</span>
                        </>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(message.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <span>•</span>
                      <span>{message.versions.length} version{message.versions.length !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span className="capitalize">{message.mode}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateTemplateDialog
        open={submitToSharedOpen}
        onOpenChange={setSubmitToSharedOpen}
        onSubmit={handleCreateTemplate}
        initialContent={messageToSubmit?.content || ''}
      />
    </div>
  );
};

export default PersonalLibrary;
