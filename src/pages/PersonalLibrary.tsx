import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { MessageDetailDialog } from "@/components/library/MessageDetailDialog";
import type { SavedMessage, LibraryFilters, SortOption } from "@/types/library";
import { 
  Search, 
  Filter,
  ArrowLeft,
  Copy,
  Trash2,
  Download,
  CheckCircle,
  FileText,
  Mail,
  MessageSquare,
  Globe,
  Layout
} from "lucide-react";

const channelIcons = {
  'email': Mail,
  'sms': MessageSquare,
  'portal': Layout,
  'landing-page': Globe,
};

const PersonalLibrary = () => {
  const { toast } = useToast();
  const { messages, deleteMessage, duplicateMessage, exportMessage, filterMessages, updateMessage } = useMessageLibrary();
  const [filters, setFilters] = useState<LibraryFilters>({ search: '' });
  const [sort, setSort] = useState<SortOption>('newest');
  const [selectedMessage, setSelectedMessage] = useState<SavedMessage | null>(null);

  const filteredMessages = filterMessages(filters, sort);

  const handleDelete = (id: string) => {
    deleteMessage(id);
    toast({ title: "Message deleted" });
  };

  const handleDuplicate = (id: string) => {
    duplicateMessage(id);
    toast({ title: "Message duplicated" });
  };

  const handleExport = (id: string) => {
    exportMessage(id);
    toast({ title: "Message exported" });
  };

  const handleApprove = (id: string) => {
    updateMessage(id, { approved: true });
    toast({ title: "Message approved" });
  };

  const ChannelIcon = (channel: string) => {
    const Icon = channelIcons[channel as keyof typeof channelIcons] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                Personal Message Library
              </h1>
              <p className="text-muted-foreground mt-1">
                Your saved messages and evaluations
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
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
                <Select value={filters.channel || 'all'} onValueChange={(v) => setFilters(f => ({ ...f, channel: v === 'all' ? undefined : v }))}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="portal">Portal</SelectItem>
                    <SelectItem value="landing-page">Landing Page</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.audience || 'all'} onValueChange={(v) => setFilters(f => ({ ...f, audience: v === 'all' ? undefined : v }))}>
                  <SelectTrigger className="w-full md:w-[150px]">
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
                <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
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
                <Link to="/">
                  <Button>Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <Card key={message.id} className="card-elevated cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedMessage(message)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {ChannelIcon(message.channel)}
                          <h3 className="font-semibold text-foreground truncate">{message.title}</h3>
                          {message.approved && (
                            <Badge variant="outline" className="shrink-0">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
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
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicate(message.id)} title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleExport(message.id)} title="Export">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(message.id)} title="Delete">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                      <span>Created: {new Date(message.createdAt).toLocaleDateString()}</span>
                      <span>Versions: {message.versions.length}</span>
                      <span className="capitalize">{message.mode}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedMessage && (
        <MessageDetailDialog
          message={selectedMessage}
          open={!!selectedMessage}
          onOpenChange={(open) => !open && setSelectedMessage(null)}
          onApprove={() => handleApprove(selectedMessage.id)}
          onDelete={() => {
            handleDelete(selectedMessage.id);
            setSelectedMessage(null);
          }}
        />
      )}
    </div>
  );
};

export default PersonalLibrary;
