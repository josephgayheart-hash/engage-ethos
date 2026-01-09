import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Download,
  FileText,
  Loader2,
  Sparkles,
  Target,
  MessageSquare,
  Users,
  BarChart3,
  Quote,
  List,
  GraduationCap,
  ArrowRight,
  Phone,
  Navigation,
  LayoutGrid
} from 'lucide-react';

export interface ParsedSection {
  id: string;
  type: string;
  title: string;
  content: string;
  wordCount: number;
  isRecommended: boolean;
}

interface SectionSelectorProps {
  sections: ParsedSection[];
  onImportSections: (sections: ParsedSection[], sampleType: string) => Promise<void>;
  isImporting: boolean;
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

export function SectionSelector({ sections, onImportSections, isImporting }: SectionSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => 
    new Set(sections.filter(s => s.isRecommended).map(s => s.id))
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [sampleType, setSampleType] = useState('web_copy');

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

  const handleImport = () => {
    const selectedSections = sections.filter(s => selectedIds.has(s.id));
    onImportSections(selectedSections, sampleType);
  };

  const selectedSections = sections.filter(s => selectedIds.has(s.id));
  const totalWords = selectedSections.reduce((acc, s) => acc + s.wordCount, 0);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Select Sections to Import
            </CardTitle>
            <CardDescription>
              {sections.length} sections detected • {selectedIds.size} selected • {totalWords.toLocaleString()} words
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={selectRecommended}>
              Recommended
            </Button>
            <Button variant="ghost" size="sm" onClick={selectAll}>
              All
            </Button>
            <Button variant="ghost" size="sm" onClick={selectNone}>
              None
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-64 pr-4">
          <div className="space-y-2">
            {sections.map((section) => {
              const config = SECTION_TYPE_CONFIG[section.type] || SECTION_TYPE_CONFIG['general'];
              const Icon = config.icon;
              const isSelected = selectedIds.has(section.id);
              const isExpanded = expandedIds.has(section.id);

              return (
                <Collapsible key={section.id} open={isExpanded} onOpenChange={() => toggleExpand(section.id)}>
                  <div 
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isSelected ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-transparent'
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
                      <Button variant="ghost" size="sm" className="shrink-0">
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
        </ScrollArea>

        <div className="flex items-center gap-4 pt-2 border-t">
          <div className="flex-1">
            <Select value={sampleType} onValueChange={setSampleType}>
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
          </div>
          <Button 
            onClick={handleImport}
            disabled={isImporting || selectedIds.size === 0}
            className="gap-2"
          >
            {isImporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Import {selectedIds.size} Section{selectedIds.size !== 1 ? 's' : ''}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
