import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { firecrawlApi, ScrapeResult } from '@/lib/api/firecrawl';
import { 
  Globe, 
  Loader2, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  XCircle,
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  Clock,
  Link2,
  BarChart3,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import type { ContentDNASample } from '@/hooks/useContentDNA';

// Sample types for web content
const WEB_SAMPLE_TYPES = [
  { value: 'web_copy', label: 'Website Copy' },
  { value: 'blog_post', label: 'Blog Post' },
  { value: 'news_story', label: 'News Story' },
  { value: 'press_release', label: 'Press Release' },
  { value: 'marketing', label: 'Marketing Material' },
  { value: 'brand_narrative', label: 'Brand Narrative' },
  { value: 'program_description', label: 'Program Description' },
  { value: 'other', label: 'Other' },
];

interface WebCrawlTabProps {
  samples: ContentDNASample[];
  onImportUrl: (url: string, content: string, options: {
    sampleType: string;
    title: string;
    sourceUrl: string;
  }) => Promise<any>;
  onDeleteSample: (sampleId: string) => Promise<void>;
}

interface ImportedUrl {
  url: string;
  status: 'pending' | 'success' | 'error';
  title?: string;
  wordCount?: number;
  error?: string;
}

export function WebCrawlTab({ samples, onImportUrl, onDeleteSample }: WebCrawlTabProps) {
  const { toast } = useToast();
  
  // Single URL import state
  const [singleUrl, setSingleUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [previewData, setPreviewData] = useState<ScrapeResult | null>(null);
  const [previewExpanded, setPreviewExpanded] = useState(true);
  const [selectedSampleType, setSelectedSampleType] = useState('web_copy');
  const [customTitle, setCustomTitle] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  // Bulk import state
  const [bulkUrls, setBulkUrls] = useState('');
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkResults, setBulkResults] = useState<ImportedUrl[]>([]);
  const [bulkSampleType, setBulkSampleType] = useState('web_copy');
  
  // Site discovery state
  const [discoveryUrl, setDiscoveryUrl] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredUrls, setDiscoveredUrls] = useState<string[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [discoveryFilter, setDiscoveryFilter] = useState('');
  const [discoverySampleType, setDiscoverySampleType] = useState('web_copy');
  const [isImportingSelected, setIsImportingSelected] = useState(false);
  
  // Stats
  const webCrawledSamples = samples.filter(s => s.source_url);
  const totalWebWords = webCrawledSamples.reduce((acc, s) => 
    acc + (s.content_text?.split(/\s+/).length || 0), 0
  );
  const uniqueDomains = new Set(
    webCrawledSamples
      .filter(s => s.source_url)
      .map(s => {
        try {
          return new URL(s.source_url!).hostname;
        } catch {
          return '';
        }
      })
      .filter(Boolean)
  );
  const lastImport = webCrawledSamples.length > 0 
    ? new Date(Math.max(...webCrawledSamples.map(s => new Date(s.created_at).getTime())))
    : null;

  // Handle single URL preview
  const handlePreview = async () => {
    if (!singleUrl.trim()) return;
    
    setIsScraping(true);
    setPreviewData(null);
    
    try {
      const response = await firecrawlApi.scrape(singleUrl, { formats: ['markdown'] });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to scrape URL');
      }
      
      setPreviewData(response.data);
      setPreviewExpanded(true);
      
      // Auto-fill title from metadata
      if (response.data.metadata?.title && !customTitle) {
        setCustomTitle(response.data.metadata.title);
      }
      
      toast({
        title: 'Content Retrieved',
        description: `Extracted ${response.data.markdown?.split(/\s+/).length || 0} words from the page.`,
      });
    } catch (error: any) {
      console.error('Scrape error:', error);
      toast({
        title: 'Scrape Failed',
        description: error.message || 'Could not retrieve content from this URL.',
        variant: 'destructive',
      });
    } finally {
      setIsScraping(false);
    }
  };

  // Handle single URL import
  const handleImportSingle = async () => {
    if (!previewData?.markdown) return;
    
    setIsImporting(true);
    try {
      await onImportUrl(singleUrl, previewData.markdown, {
        sampleType: selectedSampleType,
        title: customTitle || previewData.metadata?.title || 'Web Import',
        sourceUrl: singleUrl,
      });
      
      // Reset form
      setSingleUrl('');
      setPreviewData(null);
      setCustomTitle('');
      
      toast({
        title: 'Content Imported',
        description: 'Web content has been added to your Content DNA library.',
      });
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import content.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Handle bulk import
  const handleBulkImport = async () => {
    const urls = bulkUrls
      .split('\n')
      .map(u => u.trim())
      .filter(u => u && (u.startsWith('http') || !u.includes(' ')));
    
    if (urls.length === 0) {
      toast({
        title: 'No URLs',
        description: 'Please enter at least one URL to import.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsBulkImporting(true);
    setBulkResults(urls.map(url => ({ url, status: 'pending' })));
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        const response = await firecrawlApi.scrape(url, { formats: ['markdown'] });
        
        if (!response.success || !response.data?.markdown) {
          throw new Error(response.error || 'No content');
        }
        
        await onImportUrl(url, response.data.markdown, {
          sampleType: bulkSampleType,
          title: response.data.metadata?.title || `Import from ${new URL(url).hostname}`,
          sourceUrl: url,
        });
        
        setBulkResults(prev => prev.map((r, idx) => 
          idx === i ? { 
            ...r, 
            status: 'success', 
            title: response.data?.metadata?.title,
            wordCount: response.data?.markdown?.split(/\s+/).length 
          } : r
        ));
      } catch (error: any) {
        setBulkResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'error', error: error.message } : r
        ));
      }
    }
    
    setIsBulkImporting(false);
    toast({
      title: 'Bulk Import Complete',
      description: `Processed ${urls.length} URLs.`,
    });
  };

  // Handle site discovery
  const handleDiscoverSite = async () => {
    if (!discoveryUrl.trim()) return;
    
    setIsDiscovering(true);
    setDiscoveredUrls([]);
    setSelectedUrls(new Set());
    
    try {
      const response = await firecrawlApi.map(discoveryUrl, { limit: 100 });
      
      if (!response.success || !response.data?.links) {
        throw new Error(response.error || 'Failed to discover URLs');
      }
      
      setDiscoveredUrls(response.data.links);
      toast({
        title: 'Discovery Complete',
        description: `Found ${response.data.links.length} pages on this site.`,
      });
    } catch (error: any) {
      console.error('Discovery error:', error);
      toast({
        title: 'Discovery Failed',
        description: error.message || 'Could not discover pages on this site.',
        variant: 'destructive',
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  // Handle importing selected discovered URLs
  const handleImportSelected = async () => {
    if (selectedUrls.size === 0) return;
    
    setIsImportingSelected(true);
    const urls = Array.from(selectedUrls);
    let successCount = 0;
    let errorCount = 0;
    
    for (const url of urls) {
      try {
        const response = await firecrawlApi.scrape(url, { formats: ['markdown'] });
        
        if (response.success && response.data?.markdown) {
          await onImportUrl(url, response.data.markdown, {
            sampleType: discoverySampleType,
            title: response.data.metadata?.title || `Import from ${new URL(url).hostname}`,
            sourceUrl: url,
          });
          successCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }
    
    setIsImportingSelected(false);
    setSelectedUrls(new Set());
    
    toast({
      title: 'Import Complete',
      description: `Successfully imported ${successCount} pages. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
    });
  };

  // Filter discovered URLs
  const filteredDiscoveredUrls = discoveryFilter
    ? discoveredUrls.filter(url => url.toLowerCase().includes(discoveryFilter.toLowerCase()))
    : discoveredUrls;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{webCrawledSamples.length}</p>
                <p className="text-xs text-muted-foreground">Web Imports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalWebWords.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Words Imported</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Link2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueDomains.size}</p>
                <p className="text-xs text-muted-foreground">Unique Domains</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  {lastImport ? lastImport.toLocaleDateString() : 'Never'}
                </p>
                <p className="text-xs text-muted-foreground">Last Import</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single URL Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-primary" />
              Import from URL
            </CardTitle>
            <CardDescription>
              Scrape content from a single webpage to add to your DNA library
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://yourschool.edu/about"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
              />
              <Button 
                onClick={handlePreview} 
                disabled={isScraping || !singleUrl.trim()}
              >
                {isScraping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                <span className="ml-2">Preview</span>
              </Button>
            </div>
            
            {previewData && (
              <Collapsible open={previewExpanded} onOpenChange={setPreviewExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{previewData.metadata?.title || 'Content Retrieved'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <span>{previewData.markdown?.split(/\s+/).length || 0} words</span>
                      {previewExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Content Type</Label>
                      <Select value={selectedSampleType} onValueChange={setSelectedSampleType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WEB_SAMPLE_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Optional custom title"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Content Preview</Label>
                    <ScrollArea className="h-32 w-full rounded-md border p-3 bg-muted/30">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {previewData.markdown?.slice(0, 1000)}
                        {(previewData.markdown?.length || 0) > 1000 && '...'}
                      </p>
                    </ScrollArea>
                  </div>
                  
                  <Button 
                    onClick={handleImportSingle} 
                    disabled={isImporting}
                    className="w-full"
                  >
                    {isImporting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Add to Library
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>

        {/* Bulk URL Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5 text-primary" />
              Bulk Import
            </CardTitle>
            <CardDescription>
              Import multiple URLs at once (one per line)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={"https://yourschool.edu/about\nhttps://yourschool.edu/mission\nhttps://yourschool.edu/values"}
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              rows={4}
            />
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={bulkSampleType} onValueChange={setBulkSampleType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WEB_SAMPLE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleBulkImport} 
                disabled={isBulkImporting || !bulkUrls.trim()}
              >
                {isBulkImporting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Import All
              </Button>
            </div>
            
            {bulkResults.length > 0 && (
              <ScrollArea className="h-32 w-full rounded-md border">
                <div className="p-2 space-y-1">
                  {bulkResults.map((result, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {result.status === 'pending' && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                      {result.status === 'success' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                      {result.status === 'error' && <XCircle className="w-3 h-3 text-destructive" />}
                      <span className="truncate flex-1">{result.url}</span>
                      {result.wordCount && (
                        <span className="text-muted-foreground text-xs">{result.wordCount} words</span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Site Discovery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5 text-primary" />
            Site Discovery
          </CardTitle>
          <CardDescription>
            Enter a domain to discover all available pages, then select which ones to import
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="yourschool.edu"
              value={discoveryUrl}
              onChange={(e) => setDiscoveryUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDiscoverSite()}
            />
            <Button 
              onClick={handleDiscoverSite} 
              disabled={isDiscovering || !discoveryUrl.trim()}
            >
              {isDiscovering ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Discover Pages
            </Button>
          </div>
          
          {discoveredUrls.length > 0 && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Filter URLs..."
                    value={discoveryFilter}
                    onChange={(e) => setDiscoveryFilter(e.target.value)}
                    className="h-9"
                  />
                </div>
                <Select value={discoverySampleType} onValueChange={setDiscoverySampleType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WEB_SAMPLE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    if (selectedUrls.size === filteredDiscoveredUrls.length) {
                      setSelectedUrls(new Set());
                    } else {
                      setSelectedUrls(new Set(filteredDiscoveredUrls));
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  {selectedUrls.size === filteredDiscoveredUrls.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  onClick={handleImportSelected}
                  disabled={isImportingSelected || selectedUrls.size === 0}
                  size="sm"
                >
                  {isImportingSelected ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Import {selectedUrls.size} Selected
                </Button>
              </div>
              
              <ScrollArea className="h-64 w-full rounded-md border">
                <div className="p-2 space-y-1">
                  {filteredDiscoveredUrls.map((url, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedUrls.has(url)}
                        onCheckedChange={(checked) => {
                          const next = new Set(selectedUrls);
                          if (checked) {
                            next.add(url);
                          } else {
                            next.delete(url);
                          }
                          setSelectedUrls(next);
                        }}
                      />
                      <span className="text-sm truncate flex-1">{url}</span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </label>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground">
                Showing {filteredDiscoveredUrls.length} of {discoveredUrls.length} discovered pages
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Import History */}
      {webCrawledSamples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-primary" />
              Import History
            </CardTitle>
            <CardDescription>
              Web content that has been imported to your DNA library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Source URL</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Words</TableHead>
                    <TableHead>Imported</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webCrawledSamples.slice(0, 20).map((sample) => (
                    <TableRow key={sample.id}>
                      <TableCell className="font-medium max-w-48 truncate">
                        {sample.title || sample.file_name}
                      </TableCell>
                      <TableCell>
                        <a
                          href={sample.source_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline max-w-48 truncate"
                        >
                          {sample.source_url ? new URL(sample.source_url).hostname : 'N/A'}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {WEB_SAMPLE_TYPES.find(t => t.value === sample.sample_type)?.label || sample.sample_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sample.content_text?.split(/\s+/).length?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(sample.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onDeleteSample(sample.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
