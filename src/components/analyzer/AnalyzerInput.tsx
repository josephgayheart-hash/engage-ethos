import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  FileText, 
  Loader2, 
  Search,
  Eye,
  ArrowRight
} from 'lucide-react';

interface AnalyzerInputProps {
  onAnalyze: (content: string, url?: string) => void;
  isAnalyzing: boolean;
  disabled?: boolean;
}

export function AnalyzerInput({ onAnalyze, isAnalyzing, disabled }: AnalyzerInputProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('paste');
  const [pastedContent, setPastedContent] = useState('');
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedContent, setScrapedContent] = useState('');
  const [scrapedTitle, setScrapedTitle] = useState('');

  const handleScrape = async () => {
    if (!url.trim()) return;

    setIsScraping(true);
    setScrapedContent('');
    setScrapedTitle('');

    try {
      const response = await firecrawlApi.scrape(url, { formats: ['markdown'] });

      if (!response.success || !response.data?.markdown) {
        throw new Error(response.error || 'Failed to retrieve content');
      }

      setScrapedContent(response.data.markdown);
      setScrapedTitle(response.data.metadata?.title || '');

      toast({
        title: 'Content Retrieved',
        description: `Extracted ${response.data.markdown.split(/\s+/).length} words from the page.`,
      });
    } catch (error: any) {
      toast({
        title: 'Scrape Failed',
        description: error.message || 'Could not retrieve content from this URL.',
        variant: 'destructive',
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleAnalyzeClick = () => {
    if (activeTab === 'paste') {
      onAnalyze(pastedContent);
    } else {
      onAnalyze(scrapedContent, url);
    }
  };

  const hasContent = activeTab === 'paste' ? pastedContent.trim() : scrapedContent.trim();
  const wordCount = hasContent ? (activeTab === 'paste' ? pastedContent : scrapedContent).split(/\s+/).length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-[hsl(200_100%_45%)]" />
          Content Input
        </CardTitle>
        <CardDescription>
          Paste text directly or import from a URL to analyze against your Content DNA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Paste Text
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Import from URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="space-y-4">
            <Textarea
              placeholder="Paste the content you want to analyze here...

For example:
- Email copy
- Website text
- Marketing materials
- Social media posts"
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            {pastedContent && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{wordCount} words</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://example.edu/about"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
              />
              <Button
                onClick={handleScrape}
                disabled={isScraping || !url.trim()}
                variant="outline"
              >
                {isScraping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                <span className="ml-2">Fetch</span>
              </Button>
            </div>

            {scrapedContent && (
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
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={handleAnalyzeClick}
            disabled={!hasContent || isAnalyzing || disabled}
            className="w-full bg-[hsl(200_100%_45%)] hover:bg-[hsl(200_100%_40%)]"
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
