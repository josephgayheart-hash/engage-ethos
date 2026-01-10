import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { firecrawlApi } from "@/lib/api/firecrawl";
import {
  Search,
  Loader2,
  Plus,
  ExternalLink,
  Trash2,
  Edit3,
  RefreshCw,
  Radar,
  GraduationCap,
  Mail,
  User,
  FileText,
  Sparkles,
  Linkedin,
  MessageSquare,
  Send,
  Copy,
  Check,
  Phone,
  MoreHorizontal,
  UserSearch,
  Wand2,
} from "lucide-react";

interface SearchResult {
  url: string;
  title: string;
  description?: string;
  markdown?: string;
}

interface ExtractedContact {
  name: string;
  title: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface SalesProspect {
  id: string;
  university_name: string;
  url: string;
  source_article_url: string | null;
  source_article_title: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_title: string | null;
  contact_phone: string | null;
  linkedin_url: string | null;
  extracted_contacts: unknown;
  notes: string | null;
  status: string;
  brand_launch_date: string | null;
  discovered_at: string;
  created_by_user_id: string | null;
}
  notes: string | null;
  status: string;
  brand_launch_date: string | null;
  discovered_at: string;
  created_by_user_id: string | null;
}

const SUGGESTED_QUERIES = [
  "university rebrand announcement 2025",
  "college new brand identity launch",
  "higher education brand refresh",
  "university visual identity unveil",
  "college logo redesign announcement",
  "university marketing rebrand",
];

const TIME_FILTERS = [
  { value: "", label: "All time" },
  { value: "qdr:d", label: "Past 24 hours" },
  { value: "qdr:w", label: "Past week" },
  { value: "qdr:m", label: "Past month" },
  { value: "qdr:m3", label: "Past 3 months" },
  { value: "qdr:y", label: "Past year" },
];

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "qualified", label: "Qualified", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "closed", label: "Closed", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "not_interested", label: "Not Interested", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

export const BrandRadarTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState(SUGGESTED_QUERIES[0]);
  const [timeFilter, setTimeFilter] = useState("qdr:m");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  const [prospects, setProspects] = useState<SalesProspect[]>([]);
  const [isLoadingProspects, setIsLoadingProspects] = useState(true);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [editingProspect, setEditingProspect] = useState<SalesProspect | null>(null);
  
  // Extraction state
  const [extractingContacts, setExtractingContacts] = useState<string | null>(null);
  const [extractedContacts, setExtractedContacts] = useState<ExtractedContact[]>([]);
  
  // LinkedIn lookup state
  const [findingLinkedIn, setFindingLinkedIn] = useState<string | null>(null);
  
  // Outreach state
  const [outreachDialogOpen, setOutreachDialogOpen] = useState(false);
  const [outreachProspect, setOutreachProspect] = useState<SalesProspect | null>(null);
  const [outreachType, setOutreachType] = useState<'linkedin_dm' | 'email'>('email');
  const [generatingOutreach, setGeneratingOutreach] = useState(false);
  const [outreachContent, setOutreachContent] = useState({ subject: '', body: '', call_to_action: '' });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Email sending state
  const [sendingEmail, setSendingEmail] = useState(false);
  
  const [formData, setFormData] = useState({
    university_name: "",
    url: "",
    source_article_url: "",
    source_article_title: "",
    contact_name: "",
    contact_email: "",
    contact_title: "",
    contact_phone: "",
    linkedin_url: "",
    notes: "",
    status: "new",
    brand_launch_date: "",
  });

  // Fetch prospects
  const fetchProspects = async () => {
    setIsLoadingProspects(true);
    try {
      const { data, error } = await supabase
        .from('sales_prospects')
        .select('*')
        .order('discovered_at', { ascending: false });

      if (error) throw error;
      setProspects((data || []) as unknown as SalesProspect[]);
    } catch (error) {
      console.error('Error fetching prospects:', error);
      toast({
        title: "Error",
        description: "Failed to load prospects",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProspects(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  // Search for rebrands
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const response = await firecrawlApi.search(searchQuery, {
        limit: 15,
        tbs: timeFilter || undefined,
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Search failed');
      }
      
      setSearchResults(response.data || []);
      
      if ((response.data || []).length === 0) {
        toast({
          title: "No results",
          description: "Try a different search query or time filter",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Extract contacts from article
  const handleExtractContacts = async (result: SearchResult) => {
    setExtractingContacts(result.url);
    setExtractedContacts([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-article-contacts', {
        body: { 
          markdown: result.markdown || result.description,
          title: result.title,
          url: result.url
        }
      });

      if (error) throw error;
      
      if (data?.success && data.data) {
        const contacts = data.data.contacts || [];
        setExtractedContacts(contacts);
        
        // Pre-fill form with extracted data
        setSelectedResult(result);
        setFormData({
          university_name: data.data.university_name || extractUniversityName(result.title || ""),
          url: extractDomainUrl(result.url),
          source_article_url: result.url,
          source_article_title: result.title || "",
          contact_name: contacts[0]?.name || "",
          contact_email: contacts[0]?.email || "",
          contact_title: contacts[0]?.title || "",
          contact_phone: contacts[0]?.phone || "",
          linkedin_url: "",
          notes: result.description || "",
          status: "new",
          brand_launch_date: data.data.brand_launch_date || "",
        });
        setAddDialogOpen(true);
        
        toast({
          title: contacts.length > 0 ? `Found ${contacts.length} contact(s)` : "No contacts found",
          description: contacts.length > 0 
            ? `Extracted: ${contacts.map((c: ExtractedContact) => c.name).join(', ')}`
            : "You can add contact info manually",
        });
      } else {
        throw new Error(data?.error || 'Extraction failed');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : "Could not extract contacts",
        variant: "destructive",
      });
      // Fall back to manual add
      handleAddFromResult(result);
    } finally {
      setExtractingContacts(null);
    }
  };

  // Find LinkedIn profile
  const handleFindLinkedIn = async (prospect: SalesProspect) => {
    if (!prospect.contact_name) {
      toast({
        title: "Contact name required",
        description: "Add a contact name first to search for their LinkedIn profile",
        variant: "destructive",
      });
      return;
    }
    
    setFindingLinkedIn(prospect.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('find-linkedin-profile', {
        body: { 
          name: prospect.contact_name,
          title: prospect.contact_title,
          institution: prospect.university_name
        }
      });

      if (error) throw error;
      
      if (data?.success && data.data?.linkedin_url) {
        // Update the prospect with LinkedIn URL
        const { error: updateError } = await supabase
          .from('sales_prospects')
          .update({ linkedin_url: data.data.linkedin_url })
          .eq('id', prospect.id);
          
        if (updateError) throw updateError;
        
        toast({
          title: "LinkedIn profile found",
          description: `Confidence: ${data.data.confidence}`,
        });
        
        fetchProspects();
      } else {
        toast({
          title: "No LinkedIn profile found",
          description: "Try searching manually or check the contact name",
        });
      }
    } catch (error) {
      console.error('LinkedIn search error:', error);
      toast({
        title: "LinkedIn search failed",
        description: error instanceof Error ? error.message : "Could not find profile",
        variant: "destructive",
      });
    } finally {
      setFindingLinkedIn(null);
    }
  };

  // Generate outreach message
  const handleGenerateOutreach = async (prospect: SalesProspect, type: 'linkedin_dm' | 'email') => {
    setOutreachProspect(prospect);
    setOutreachType(type);
    setOutreachDialogOpen(true);
    setGeneratingOutreach(true);
    setOutreachContent({ subject: '', body: '', call_to_action: '' });
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-outreach-message', {
        body: { 
          contact_name: prospect.contact_name || 'there',
          contact_title: prospect.contact_title,
          university_name: prospect.university_name,
          brand_launch_date: prospect.brand_launch_date,
          source_article_title: prospect.source_article_title,
          message_type: type
        }
      });

      if (error) throw error;
      
      if (data?.success && data.data) {
        setOutreachContent(data.data);
      } else {
        throw new Error(data?.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Outreach generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Could not generate message",
        variant: "destructive",
      });
    } finally {
      setGeneratingOutreach(false);
    }
  };

  // Send email
  const handleSendEmail = async () => {
    if (!outreachProspect?.contact_email) {
      toast({
        title: "Email required",
        description: "Add an email address to the prospect first",
        variant: "destructive",
      });
      return;
    }
    
    setSendingEmail(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-prospect-email', {
        body: { 
          prospect_id: outreachProspect.id,
          to_email: outreachProspect.contact_email,
          to_name: outreachProspect.contact_name || '',
          subject: outreachContent.subject,
          body: outreachContent.body,
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: "Email sent!",
          description: `Message sent to ${outreachProspect.contact_email}`,
        });
        setOutreachDialogOpen(false);
        fetchProspects();
      } else {
        throw new Error(data?.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email send error:', error);
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  // Open add dialog with result data
  const handleAddFromResult = (result: SearchResult) => {
    setSelectedResult(result);
    setExtractedContacts([]);
    setFormData({
      university_name: extractUniversityName(result.title || ""),
      url: extractDomainUrl(result.url),
      source_article_url: result.url,
      source_article_title: result.title || "",
      contact_name: "",
      contact_email: "",
      contact_title: "",
      contact_phone: "",
      linkedin_url: "",
      notes: result.description || "",
      status: "new",
      brand_launch_date: "",
    });
    setAddDialogOpen(true);
  };

  // Extract university name from title
  const extractUniversityName = (title: string): string => {
    const patterns = [
      /^([\w\s]+(?:University|College|Institute))/i,
      /(University of [\w\s]+)/i,
      /([\w\s]+(?:State|Tech|A&M))/i,
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) return match[1].trim();
    }
    
    return title.split(/[-–—|:]/).filter(part => part.trim())[0]?.trim() || title;
  };

  // Extract domain URL from full URL
  const extractDomainUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}`;
    } catch {
      return url;
    }
  };

  // Save new prospect
  const handleSaveProspect = async () => {
    if (!formData.university_name || !formData.url) {
      toast({
        title: "Required fields",
        description: "University name and URL are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const insertData: Record<string, unknown> = {
        university_name: formData.university_name,
        url: formData.url,
        source_article_url: formData.source_article_url || null,
        source_article_title: formData.source_article_title || null,
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_title: formData.contact_title || null,
        contact_phone: formData.contact_phone || null,
        linkedin_url: formData.linkedin_url || null,
        notes: formData.notes || null,
        status: formData.status,
        brand_launch_date: formData.brand_launch_date || null,
        extracted_contacts: extractedContacts.length > 0 ? extractedContacts : null,
        created_by_user_id: user?.id || null,
      };
      
      const { error } = await supabase
        .from('sales_prospects')
        .insert(insertData as never);

      if (error) throw error;

      toast({
        title: "Prospect saved",
        description: `${formData.university_name} added to prospects`,
      });
      
      setAddDialogOpen(false);
      setExtractedContacts([]);
      fetchProspects();
    } catch (error) {
      console.error('Error saving prospect:', error);
      toast({
        title: "Error",
        description: "Failed to save prospect",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog
  const handleEdit = (prospect: SalesProspect) => {
    setEditingProspect(prospect);
    setFormData({
      university_name: prospect.university_name,
      url: prospect.url,
      source_article_url: prospect.source_article_url || "",
      source_article_title: prospect.source_article_title || "",
      contact_name: prospect.contact_name || "",
      contact_email: prospect.contact_email || "",
      contact_title: prospect.contact_title || "",
      contact_phone: prospect.contact_phone || "",
      linkedin_url: prospect.linkedin_url || "",
      notes: prospect.notes || "",
      status: prospect.status,
      brand_launch_date: prospect.brand_launch_date || "",
    });
    setEditDialogOpen(true);
  };

  // Update prospect
  const handleUpdateProspect = async () => {
    if (!editingProspect) return;

    try {
      const { error } = await supabase
        .from('sales_prospects')
        .update({
          university_name: formData.university_name,
          url: formData.url,
          source_article_url: formData.source_article_url || null,
          source_article_title: formData.source_article_title || null,
          contact_name: formData.contact_name || null,
          contact_email: formData.contact_email || null,
          contact_title: formData.contact_title || null,
          contact_phone: formData.contact_phone || null,
          linkedin_url: formData.linkedin_url || null,
          notes: formData.notes || null,
          status: formData.status,
          brand_launch_date: formData.brand_launch_date || null,
        })
        .eq('id', editingProspect.id);

      if (error) throw error;

      toast({
        title: "Prospect updated",
        description: `${formData.university_name} has been updated`,
      });
      
      setEditDialogOpen(false);
      fetchProspects();
    } catch (error) {
      console.error('Error updating prospect:', error);
      toast({
        title: "Error",
        description: "Failed to update prospect",
        variant: "destructive",
      });
    }
  };

  // Delete prospect
  const handleDelete = async (prospect: SalesProspect) => {
    if (!confirm(`Delete ${prospect.university_name} from prospects?`)) return;

    try {
      const { error } = await supabase
        .from('sales_prospects')
        .delete()
        .eq('id', prospect.id);

      if (error) throw error;

      toast({
        title: "Prospect deleted",
        description: `${prospect.university_name} removed from prospects`,
      });
      
      fetchProspects();
    } catch (error) {
      console.error('Error deleting prospect:', error);
      toast({
        title: "Error",
        description: "Failed to delete prospect",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return <Badge className={`${option.color} text-xs`}>{option.label}</Badge>;
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Search Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Radar className="w-4 h-4" />
            Brand Launch Radar
          </CardTitle>
          <CardDescription>
            Search for universities with recent brand launches or rebrands
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Suggested queries */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((query) => (
              <Button
                key={query}
                variant={searchQuery === query ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setSearchQuery(query)}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {query.replace(" 2025", "")}
              </Button>
            ))}
          </div>

          {/* Search controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search for university rebrands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Time filter" />
              </SelectTrigger>
              <SelectContent>
                {TIME_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value || "all"}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isSearching} className="gap-2">
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3 mt-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Search Results ({searchResults.length})
              </h3>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-4">
                  {searchResults.map((result, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sm text-primary hover:underline line-clamp-2 flex items-center gap-1"
                          >
                            {result.title || result.url}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {result.description || 'No description available'}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">
                            {result.url}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1"
                            disabled={extractingContacts === result.url}
                            onClick={() => handleExtractContacts(result)}
                          >
                            {extractingContacts === result.url ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <UserSearch className="w-3 h-3" />
                            )}
                            Extract & Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleAddFromResult(result)}
                          >
                            <Plus className="w-3 h-3" />
                            Manual
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Prospects */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Saved Prospects ({prospects.length})
              </CardTitle>
              <CardDescription>
                Universities identified as potential sales targets
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProspects}
              disabled={isLoadingProspects}
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingProspects ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingProspects ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : prospects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Radar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No prospects saved yet</p>
              <p className="text-sm">Search above to find universities with recent rebrands</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>University</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Discovered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prospects.map((prospect) => (
                    <TableRow key={prospect.id}>
                      <TableCell>
                        <div>
                          <a
                            href={prospect.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sm hover:text-primary hover:underline flex items-center gap-1"
                          >
                            {prospect.university_name}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {prospect.source_article_title && (
                            <a
                              href={prospect.source_article_url || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-muted-foreground hover:underline block truncate max-w-[200px]"
                            >
                              Source: {prospect.source_article_title}
                            </a>
                          )}
                          {prospect.brand_launch_date && (
                            <span className="text-[10px] text-muted-foreground block">
                              Launch: {prospect.brand_launch_date}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(prospect.status)}</TableCell>
                      <TableCell>
                        {prospect.contact_name ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <p className="font-medium">{prospect.contact_name}</p>
                              {prospect.linkedin_url && (
                                <a
                                  href={prospect.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0077B5] hover:opacity-80"
                                >
                                  <Linkedin className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            {prospect.contact_title && (
                              <p className="text-[10px] text-muted-foreground">{prospect.contact_title}</p>
                            )}
                            {prospect.contact_email && (
                              <a
                                href={`mailto:${prospect.contact_email}`}
                                className="text-[10px] text-primary hover:underline flex items-center gap-1"
                              >
                                <Mail className="w-2.5 h-2.5" />
                                {prospect.contact_email}
                              </a>
                            )}
                            {prospect.contact_phone && (
                              <a
                                href={`tel:${prospect.contact_phone}`}
                                className="text-[10px] text-primary hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-2.5 h-2.5" />
                                {prospect.contact_phone}
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(prospect.discovered_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(prospect)}>
                                <Edit3 className="w-3 h-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {!prospect.linkedin_url && prospect.contact_name && (
                                <DropdownMenuItem 
                                  onClick={() => handleFindLinkedIn(prospect)}
                                  disabled={findingLinkedIn === prospect.id}
                                >
                                  {findingLinkedIn === prospect.id ? (
                                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                  ) : (
                                    <Linkedin className="w-3 h-3 mr-2" />
                                  )}
                                  Find LinkedIn
                                </DropdownMenuItem>
                              )}
                              {prospect.linkedin_url && (
                                <DropdownMenuItem asChild>
                                  <a href={prospect.linkedin_url} target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="w-3 h-3 mr-2" />
                                    View LinkedIn
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleGenerateOutreach(prospect, 'linkedin_dm')}>
                                <MessageSquare className="w-3 h-3 mr-2" />
                                Draft LinkedIn DM
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleGenerateOutreach(prospect, 'email')}>
                                <Mail className="w-3 h-3 mr-2" />
                                Draft Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(prospect)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Prospect
            </DialogTitle>
          </DialogHeader>
          
          {/* Show extracted contacts if any */}
          {extractedContacts.length > 1 && (
            <div className="bg-muted/50 p-3 rounded-md mb-4">
              <p className="text-xs font-medium mb-2">Multiple contacts found - select one:</p>
              <div className="space-y-2">
                {extractedContacts.map((contact, idx) => (
                  <Button
                    key={idx}
                    variant={formData.contact_name === contact.name ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => setFormData({
                      ...formData,
                      contact_name: contact.name,
                      contact_title: contact.title || '',
                      contact_email: contact.email || '',
                      contact_phone: contact.phone || '',
                    })}
                  >
                    <User className="w-3 h-3 mr-2 flex-shrink-0" />
                    <div className="truncate">
                      <span className="font-medium">{contact.name}</span>
                      {contact.title && <span className="text-muted-foreground"> - {contact.title}</span>}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <ProspectForm
            formData={formData}
            setFormData={setFormData}
            onSave={handleSaveProspect}
            onCancel={() => {
              setAddDialogOpen(false);
              setExtractedContacts([]);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Edit Prospect
            </DialogTitle>
          </DialogHeader>
          <ProspectForm
            formData={formData}
            setFormData={setFormData}
            onSave={handleUpdateProspect}
            onCancel={() => setEditDialogOpen(false)}
            isEdit
          />
        </DialogContent>
      </Dialog>

      {/* Outreach Dialog */}
      <Dialog open={outreachDialogOpen} onOpenChange={setOutreachDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {outreachType === 'linkedin_dm' ? (
                <>
                  <Linkedin className="w-4 h-4 text-[#0077B5]" />
                  LinkedIn Message for {outreachProspect?.contact_name || outreachProspect?.university_name}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Email for {outreachProspect?.contact_name || outreachProspect?.university_name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {generatingOutreach ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating personalized message...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {outreachType === 'email' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Subject Line</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(outreachContent.subject, 'subject')}
                    >
                      {copiedField === 'subject' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <Input
                    value={outreachContent.subject}
                    onChange={(e) => setOutreachContent({ ...outreachContent, subject: e.target.value })}
                  />
                </div>
              )}
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Message</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(outreachContent.body, 'body')}
                  >
                    {copiedField === 'body' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <Textarea
                  value={outreachContent.body}
                  onChange={(e) => setOutreachContent({ ...outreachContent, body: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleCopy(
                    outreachType === 'email' 
                      ? `Subject: ${outreachContent.subject}\n\n${outreachContent.body}`
                      : outreachContent.body,
                    'all'
                  )}
                >
                  {copiedField === 'all' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy All
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateOutreach(outreachProspect!, outreachType)}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                {outreachType === 'email' && outreachProspect?.contact_email && (
                  <Button
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                  >
                    {sendingEmail ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Email
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Reusable form component
interface ProspectFormProps {
  formData: {
    university_name: string;
    url: string;
    source_article_url: string;
    source_article_title: string;
    contact_name: string;
    contact_email: string;
    contact_title: string;
    contact_phone: string;
    linkedin_url: string;
    notes: string;
    status: string;
    brand_launch_date: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<ProspectFormProps['formData']>>;
  onSave: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const ProspectForm = ({ formData, setFormData, onSave, onCancel, isEdit }: ProspectFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="university_name">University Name *</Label>
          <Input
            id="university_name"
            value={formData.university_name}
            onChange={(e) => setFormData({ ...formData, university_name: e.target.value })}
            placeholder="e.g., State University"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="url">University URL *</Label>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://www.university.edu"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="brand_launch_date">Brand Launch Date</Label>
          <Input
            id="brand_launch_date"
            value={formData.brand_launch_date}
            onChange={(e) => setFormData({ ...formData, brand_launch_date: e.target.value })}
            placeholder="e.g., Jan 2025"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Contact Information
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact_name">Contact Name</Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              placeholder="John Smith"
            />
          </div>
          <div>
            <Label htmlFor="contact_title">Title</Label>
            <Input
              id="contact_title"
              value={formData.contact_title}
              onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })}
              placeholder="VP of Marketing"
            />
          </div>
          <div>
            <Label htmlFor="contact_email">Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="jsmith@university.edu"
            />
          </div>
          <div>
            <Label htmlFor="contact_phone">Phone</Label>
            <Input
              id="contact_phone"
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Source & Notes
        </h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="source_article_title">Source Article Title</Label>
            <Input
              id="source_article_title"
              value={formData.source_article_title}
              onChange={(e) => setFormData({ ...formData, source_article_title: e.target.value })}
              placeholder="Article headline"
            />
          </div>
          <div>
            <Label htmlFor="source_article_url">Source Article URL</Label>
            <Input
              id="source_article_url"
              value={formData.source_article_url}
              onChange={(e) => setFormData({ ...formData, source_article_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          {isEdit ? "Update Prospect" : "Save Prospect"}
        </Button>
      </DialogFooter>
    </div>
  );
};
