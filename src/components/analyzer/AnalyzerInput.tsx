import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  Loader2, 
  Search,
  Eye,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle2,
  Sparkles,
  Target,
  Users,
  BarChart3,
  Quote,
  List,
  GraduationCap,
  Phone,
  Navigation,
  LayoutGrid
} from 'lucide-react';

interface ParsedSection {
  id: string;
  type: string;
  title: string;
  content: string;
  wordCount: number;
  isRecommended: boolean;
}

interface AnalyzerInputProps {
  onAnalyze: (content: string, url?: string) => void;
  isAnalyzing: boolean;
  disabled?: boolean;
}

const SECTION_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'hero': { label: 'Hero', icon: Sparkles, color: 'text-primary' },
  'about': { label: 'About', icon: Users, color: 'text-blue-500' },
  'mission': { label: 'Mission', icon: Target, color: 'text-green-500' },
  'value-proposition': { label: 'Value Props', icon: CheckCircle2, color: 'text-purple-500' },
  'statistics': { label: 'Statistics', icon: BarChart3, color: 'text-orange-500' },
  'testimonial': { label: 'Testimonial', icon: Quote, color: 'text-pink-500' },
  'feature-list': { label: 'Features', icon: List, color: 'text-cyan-500' },
  'program-description': { label: 'Program', icon: GraduationCap, color: 'text-indigo-500' },
  'call-to-action': { label: 'CTA', icon: ArrowRight, color: 'text-amber-500' },
  'contact': { label: 'Contact', icon: Phone, color: 'text-gray-500' },
  'navigation': { label: 'Navigation', icon: Navigation, color: 'text-gray-400' },
  'footer': { label: 'Footer', icon: LayoutGrid, color: 'text-gray-400' },
  'general': { label: 'General', icon: FileText, color: 'text-muted-foreground' },
};

export function AnalyzerInput({ onAnalyze, isAnalyzing, disabled }: AnalyzerInputProps) {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [scrapedContent, setScrapedContent] = useState('');
  const [scrapedTitle, setScrapedTitle] = useState('');
  const [sections, setSections] = useState<ParsedSection[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleScrape = async () => {
    if (!url.trim()) return;

    setIsScraping(true);
    setScrapedContent('');
    setScrapedTitle('');
    setSections([]);
    setSelectedIds(new Set());

    try {
      const response = await firecrawlApi.scrape(url, { formats: ['markdown'] });

      if (!response.success || !response.data?.markdown) {
        throw new Error(response.error || 'Failed to retrieve content');
      }

      setScrapedContent(response.data.markdown);
      setScrapedTitle(response.data.metadata?.title || '');

      // Now parse sections
      setIsParsing(true);
      const { data: parseData, error: parseError } = await supabase.functions.invoke('parse-web-sections', {
        body: { markdown: response.data.markdown, url }
      });

      if (parseError) {
        console.error('Parse error:', parseError);
        // Fall back to using the whole content
        toast({
          title: 'Content Retrieved',
          description: `Extracted ${response.data.markdown.split(/\s+/).length} words. Section parsing unavailable.`,
        });
      } else if (parseData?.sections) {
        setSections(parseData.sections);
        // Auto-select recommended sections
        const recommendedIds = new Set<string>(
          parseData.sections.filter((s: ParsedSection) => s.isRecommended).map((s: ParsedSection) => s.id)
        );
        setSelectedIds(recommendedIds);
        
        toast({
          title: 'Content Retrieved',
          description: `Found ${parseData.sections.length} sections. ${recommendedIds.size} recommended for analysis.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Scrape Failed',
        description: error.message || 'Could not retrieve content from this URL.',
        variant: 'destructive',
      });
    } finally {
      setIsScraping(false);
      setIsParsing(false);
    }
  };

  const toggleSection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectRecommended = () => {
    setSelectedIds(new Set(sections.filter(s => s.isRecommended).map(s => s.id)));
  };

  const selectAll = () => {
    setSelectedIds(new Set(sections.map(s => s.id)));
  };

  const selectNone = () => {
    setSelectedIds(new Set());
  };

  const handleAnalyzeClick = () => {
    if (sections.length > 0 && selectedIds.size > 0) {
      // Combine selected sections
      const selectedContent = sections
        .filter(s => selectedIds.has(s.id))
        .map(s => s.content)
        .join('\n\n');
      onAnalyze(selectedContent, url);
    } else if (scrapedContent) {
      // Fall back to full content
      onAnalyze(scrapedContent, url);
    }
  };

  const selectedSections = sections.filter(s => selectedIds.has(s.id));
  const totalWords = selectedSections.reduce((acc, s) => acc + s.wordCount, 0);
  const hasContent = sections.length > 0 ? selectedIds.size > 0 : scrapedContent.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Content Input
        </CardTitle>
        <CardDescription>
          Import content from a URL to analyze against your Content DNA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Input */}
        <div className="flex gap-2">
          <Input
            placeholder="https://example.edu/about"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
          />
          <Button
            onClick={handleScrape}
            disabled={isScraping || isParsing || !url.trim()}
            variant="outline"
          >
            {isScraping || isParsing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span className="ml-2">{isParsing ? 'Parsing...' : 'Fetch'}</span>
          </Button>
        </div>

        {/* Section Selector */}
        {sections.length > 0 && (
          <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">
                  {sections.length} sections detected
                </span>
                <Badge variant="outline" className="text-xs">
                  {selectedIds.size} selected • {totalWords.toLocaleString()} words
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={selectRecommended} className="text-xs h-7 px-2">
                  Recommended
                </Button>
                <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-7 px-2">
                  All
                </Button>
                <Button variant="ghost" size="sm" onClick={selectNone} className="text-xs h-7 px-2">
                  None
                </Button>
              </div>
            </div>

            <div className="max-h-[280px] overflow-y-auto space-y-2 pr-2">
              {sections.map((section) => {
                const config = SECTION_TYPE_CONFIG[section.type] || SECTION_TYPE_CONFIG['general'];
                const Icon = config.icon;
                const isSelected = selectedIds.has(section.id);
                const isExpanded = expandedIds.has(section.id);

                return (
                  <Collapsible key={section.id} open={isExpanded} onOpenChange={() => toggleExpand(section.id)}>
                    <div 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        isSelected ? 'bg-primary/5 border-primary/30' : 'bg-background border-transparent'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSection(section.id)}
                        className="shrink-0"
                      />
                      <Icon className={`w-4 h-4 ${config.color} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{section.title}</span>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {config.label}
                          </Badge>
                          {section.isRecommended && (
                            <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30 shrink-0">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {section.wordCount} words
                        </p>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="shrink-0 h-7 w-7 p-0">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="ml-10 mt-2 p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                        <p className="whitespace-pre-wrap line-clamp-6">
                          {section.content.slice(0, 500)}
                          {section.content.length > 500 && '...'}
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        )}

        {/* Fallback: Show scraped content if no sections parsed */}
        {scrapedContent && sections.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                {scrapedTitle && (
                  <p className="font-medium text-sm">{scrapedTitle}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {scrapedContent.split(/\s+/).length} words extracted
                </p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-500/30">
                Ready to Analyze
              </Badge>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30 max-h-[150px] overflow-y-auto">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {scrapedContent.slice(0, 500)}
                {scrapedContent.length > 500 && '...'}
              </p>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleAnalyzeClick}
            disabled={!hasContent || isAnalyzing || disabled}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Analyzing Content...
              </>
            ) : (
              <>
                Analyze Against Content DNA
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
