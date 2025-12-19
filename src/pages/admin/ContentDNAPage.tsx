import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useContentDNA, ContentDNASample } from '@/hooks/useContentDNA';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Home, 
  Upload, 
  FileText, 
  Trash2, 
  Sparkles, 
  Clock, 
  Loader2,
  ChevronRight,
  Building2,
  Dna,
  BookOpen,
  Settings,
  MessageSquare,
  TrendingUp,
  Quote,
  Lightbulb,
  CheckCircle2,
  User
} from 'lucide-react';

const SAMPLE_TYPES = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS/Text' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'news_story', label: 'News Story' },
  { value: 'speech', label: 'Speech/Remarks' },
  { value: 'social', label: 'Social Media' },
  { value: 'web_copy', label: 'Website Copy' },
  { value: 'marketing', label: 'Marketing Material' },
  { value: 'other', label: 'Other' },
];

export default function ContentDNAPage() {
  const { tenant, profile, isAdmin } = useAuth();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if accessed via admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  const {
    samples,
    analysis,
    isLoading,
    isAnalyzing,
    isSaving,
    addSample,
    deleteSample,
    analyzeVoice,
    updateCustomInstructions,
  } = useContentDNA();

  // Upload state
  const [textInput, setTextInput] = useState('');
  const [sampleTitle, setSampleTitle] = useState('');
  const [sampleType, setSampleType] = useState('email');
  const [sourceDescription, setSourceDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Instructions state
  const [customInstructions, setCustomInstructions] = useState(analysis?.custom_instructions || '');

  // Update local instructions when analysis loads
  useState(() => {
    if (analysis?.custom_instructions) {
      setCustomInstructions(analysis.custom_instructions);
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      await addSample(text, file.name, {
        sampleType,
        title: sampleTitle || file.name,
        sourceDescription: sourceDescription || undefined,
        fileType: file.type,
        fileSize: file.size,
      });
      
      // Reset form
      setSampleTitle('');
      setSourceDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    setIsUploading(true);
    try {
      await addSample(textInput, `Pasted content - ${new Date().toLocaleDateString()}`, {
        sampleType,
        title: sampleTitle || `${SAMPLE_TYPES.find(t => t.value === sampleType)?.label || 'Content'} Sample`,
        sourceDescription: sourceDescription || undefined,
      });
      
      // Reset form
      setTextInput('');
      setSampleTitle('');
      setSourceDescription('');
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveInstructions = () => {
    updateCustomInstructions(customInstructions);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(210,20%,98%)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(222,47%,14%)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]">
      {/* Header */}
      <div className="border-b border-[hsl(220,13%,88%)] bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-[hsl(220,14%,46%)] mb-2">
            <Link to="/dashboard" className="hover:text-[hsl(222,47%,11%)]">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            {isAdminRoute ? (
              <>
                <Link to="/admin/console" className="hover:text-[hsl(222,47%,11%)]">
                  Admin
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : null}
            <span className="text-[hsl(222,47%,11%)]">Content DNA</span>
          </div>
          
          {/* Institution Branding Header */}
          <div className="flex items-center gap-4 mb-4">
            {tenant?.logo_url ? (
              <img 
                src={tenant.logo_url} 
                alt={`${tenant.institution_name} logo`}
                className="w-16 h-16 object-contain rounded-lg border border-[hsl(220,13%,88%)] bg-white p-1"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: tenant?.primary_color || 'hsl(222,47%,14%)' }}
              >
                {tenant?.institution_name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1">
              <h1 className="font-serif text-2xl font-bold text-[hsl(222,47%,11%)] flex items-center gap-2">
                {tenant?.institution_name || 'Content DNA Center'}
              </h1>
              <p className="text-[hsl(220,14%,46%)]">
                Content DNA Center
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Color Swatches */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <div 
                      className="w-6 h-6 rounded-full border border-[hsl(220,13%,88%)]"
                      style={{ backgroundColor: tenant?.primary_color || 'hsl(222,47%,14%)' }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Primary Color</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <div 
                      className="w-6 h-6 rounded-full border border-[hsl(220,13%,88%)]"
                      style={{ backgroundColor: tenant?.accent_color || 'hsl(173,58%,39%)' }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Accent Color</TooltipContent>
                </Tooltip>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {samples.length} samples
              </Badge>
              {analysis && (
                <Badge className="bg-[hsl(173,58%,39%)]">
                  <Sparkles className="w-3 h-3 mr-1" />
                  DNA Analyzed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Instructional Text */}
        <Card className="mb-6 border-[hsl(220,13%,88%)] bg-gradient-to-r from-[hsl(222,47%,14%)] to-[hsl(222,47%,20%)] text-white">
          <CardContent className="py-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-lg shrink-0">
                <Dna className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold mb-2">What is Content DNA?</h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  Content DNA captures your institution's unique voice and communication style. By uploading examples of your best communications—emails, newsletters, news stories, and more—our AI analyzes the patterns, tone, and vocabulary that make your messaging distinctly yours. This analysis then guides all AI-generated content to match your established brand voice.
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    Upload content samples
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Analyze your voice
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Generate on-brand content
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="bg-white border border-[hsl(220,13%,88%)]">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Content
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Voice Analysis
            </TabsTrigger>
            <TabsTrigger value="instructions" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Brand Guidelines
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Content Library
            </TabsTrigger>
          </TabsList>

          {/* Upload Content Tab */}
          <TabsContent value="upload">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload File */}
              <Card className="border-[hsl(220,13%,88%)]">
                <CardHeader>
                  <CardTitle className="text-[hsl(222,47%,11%)] flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload File
                  </CardTitle>
                  <CardDescription>
                    Upload text files (.txt, .md, .html) containing your communications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Sample Type</Label>
                    <Select value={sampleType} onValueChange={setSampleType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SAMPLE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title (optional)</Label>
                    <Input
                      value={sampleTitle}
                      onChange={(e) => setSampleTitle(e.target.value)}
                      placeholder="e.g., President's Welcome Letter 2024"
                    />
                  </div>
                  <div>
                    <Label>Source Description (optional)</Label>
                    <Input
                      value={sourceDescription}
                      onChange={(e) => setSourceDescription(e.target.value)}
                      placeholder="e.g., Annual new student welcome email"
                    />
                  </div>
                  <div>
                    <Label>Select File</Label>
                    <div className="mt-1">
                      <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[hsl(220,13%,88%)] rounded-lg cursor-pointer hover:border-[hsl(222,47%,14%)] hover:bg-[hsl(210,20%,98%)] transition-colors">
                        <Upload className="w-5 h-5 text-[hsl(220,14%,46%)]" />
                        <span className="text-sm font-medium text-[hsl(222,47%,14%)]">
                          {isUploading ? 'Uploading...' : 'Choose File'}
                        </span>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept=".txt,.md,.html,.htm"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-[hsl(220,14%,46%)] mt-1 text-center">
                        Supports .txt, .md, .html files
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Paste Text */}
              <Card className="border-[hsl(220,13%,88%)]">
                <CardHeader>
                  <CardTitle className="text-[hsl(222,47%,11%)] flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Paste Content
                  </CardTitle>
                  <CardDescription>
                    Paste communication content directly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste your email, newsletter, or other communication here..."
                      className="h-[180px]"
                    />
                  </div>
                  <Button
                    onClick={handleTextSubmit}
                    disabled={isUploading || !textInput.trim()}
                    className="w-full bg-[hsl(222,47%,14%)] hover:bg-[hsl(222,47%,20%)]"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Add Sample
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Tips Card */}
            <Card className="mt-6 border-[hsl(220,13%,88%)] bg-[hsl(45,93%,97%)]">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-[hsl(45,93%,47%)] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-[hsl(222,47%,11%)] mb-1">Tips for best results</h4>
                    <ul className="text-sm text-[hsl(220,14%,46%)] space-y-1">
                      <li>• Include a variety of content types (emails, newsletters, news stories)</li>
                      <li>• Add samples from different departments and communication contexts</li>
                      <li>• Include both formal and informal communications for comprehensive analysis</li>
                      <li>• 10-20 samples typically provide the best voice analysis</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Uploads Summary */}
            {samples.length > 0 && (
              <Card className="mt-6 border-[hsl(220,13%,88%)] bg-[hsl(173,58%,39%)]/5">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[hsl(173,58%,39%)]/10">
                        <CheckCircle2 className="w-5 h-5 text-[hsl(173,58%,39%)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[hsl(222,47%,11%)]">
                          {samples.length} content sample{samples.length !== 1 ? 's' : ''} uploaded
                        </p>
                        <p className="text-sm text-[hsl(220,14%,46%)]">
                          View all samples in the Content Library tab
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Button
                        onClick={analyzeVoice}
                        disabled={isAnalyzing}
                        className="bg-[hsl(173,58%,39%)] hover:bg-[hsl(173,58%,34%)]"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze Samples
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Voice Analysis Tab */}
          <TabsContent value="analysis">
            {analysis?.voice_analysis ? (
              <div className="space-y-6">
                {/* Analysis Summary */}
                <Card className="border-[hsl(220,13%,88%)] bg-gradient-to-r from-[hsl(222,47%,14%)] to-[hsl(222,47%,20%)] text-white">
                  <CardContent className="py-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/10 rounded-lg">
                        <Dna className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-bold mb-2">Your Content DNA Profile</h3>
                        <p className="text-white/80">{analysis.voice_analysis.summary}</p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            Based on {analysis.sample_count} samples
                          </span>
                          {analysis.last_analyzed_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Analyzed {formatDate(analysis.last_analyzed_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-[hsl(220,13%,88%)]">
                    <CardHeader>
                      <CardTitle className="text-[hsl(222,47%,11%)] text-lg">Tone & Style</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-[hsl(220,14%,46%)]">Overall Tone</Label>
                        <p className="font-medium text-[hsl(222,47%,11%)]">{analysis.voice_analysis.overallTone}</p>
                      </div>
                      <div>
                        <Label className="text-[hsl(220,14%,46%)]">Sentence Style</Label>
                        <p className="font-medium text-[hsl(222,47%,11%)]">{analysis.voice_analysis.sentenceStyle}</p>
                      </div>
                      <div>
                        <Label className="text-[hsl(220,14%,46%)]">Formality Level</Label>
                        <p className="font-medium text-[hsl(222,47%,11%)]">{analysis.voice_analysis.formalityLevel}</p>
                      </div>
                      <div>
                        <Label className="text-[hsl(220,14%,46%)]">Emotional Tone</Label>
                        <p className="font-medium text-[hsl(222,47%,11%)]">{analysis.voice_analysis.emotionalTone}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[hsl(220,13%,88%)]">
                    <CardHeader>
                      <CardTitle className="text-[hsl(222,47%,11%)] text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Key Characteristics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.voice_analysis.keyCharacteristics.map((char, i) => (
                          <Badge key={i} variant="secondary" className="bg-[hsl(210,20%,94%)]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[hsl(220,13%,88%)]">
                    <CardHeader>
                      <CardTitle className="text-[hsl(222,47%,11%)] text-lg flex items-center gap-2">
                        <Quote className="w-5 h-5" />
                        Common Phrases
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.voice_analysis.commonPhrases.map((phrase, i) => (
                          <li key={i} className="text-sm text-[hsl(222,47%,11%)] italic">
                            "{phrase}"
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-[hsl(220,13%,88%)]">
                    <CardHeader>
                      <CardTitle className="text-[hsl(222,47%,11%)] text-lg flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Messaging Tactics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.voice_analysis.messagingTactics.map((tactic, i) => (
                          <Badge key={i} className="bg-[hsl(173,58%,39%)]">
                            {tactic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Re-analyze Button */}
                <div className="text-center">
                  <Button
                    onClick={analyzeVoice}
                    disabled={isAnalyzing || samples.length === 0}
                    variant="outline"
                    className="border-[hsl(222,47%,14%)] text-[hsl(222,47%,14%)]"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Re-analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Re-analyze with Current Samples
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="border-[hsl(220,13%,88%)]">
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-[hsl(220,14%,46%)] opacity-50" />
                  <h3 className="font-medium text-[hsl(222,47%,11%)] mb-2">No Analysis Yet</h3>
                  <p className="text-[hsl(220,14%,46%)] mb-4">
                    Upload content samples and run an analysis to see your Content DNA profile
                  </p>
                  {isAdmin && (
                    <Button
                      onClick={analyzeVoice}
                      disabled={isAnalyzing || samples.length === 0}
                      className="bg-[hsl(173,58%,39%)] hover:bg-[hsl(173,58%,34%)]"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze {samples.length} Sample{samples.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Brand Guidelines Tab */}
          <TabsContent value="instructions">
            <Card className="border-[hsl(220,13%,88%)]">
              <CardHeader>
                <CardTitle className="text-[hsl(222,47%,11%)]">Custom Brand Guidelines</CardTitle>
                <CardDescription>
                  {isAdmin 
                    ? 'Add specific instructions, rules, and guidelines for AI-generated messages. These will be applied alongside the Content DNA analysis.'
                    : 'View the brand guidelines that admins have set for AI-generated messages.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder={isAdmin ? `Examples:
• Always refer to our institution as "The University" or "TU", never spell out the full name
• Use "Go Tigers!" as a sign-off for student communications
• Avoid using the word "requirements" - prefer "opportunities" or "next steps"
• Include our motto "Excellence in Action" when appropriate
• For prospective students, always mention our campus visit program
• Never use all-caps for emphasis` : 'No custom guidelines set yet.'}
                  className="h-[250px]"
                  disabled={!isAdmin}
                />
                {isAdmin && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveInstructions}
                      disabled={isSaving}
                      className="bg-[hsl(222,47%,14%)] hover:bg-[hsl(222,47%,20%)]"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Guidelines'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </TabsContent>

          {/* Content Library Tab */}
          <TabsContent value="library">
            <Card className="border-[hsl(220,13%,88%)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[hsl(222,47%,11%)]">Content Library</CardTitle>
                    <CardDescription>
                      Your collection of brand communications used for voice analysis
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {samples.length} samples
                    </Badge>
                    {isAdmin && samples.length > 0 && (
                      <Button
                        onClick={analyzeVoice}
                        disabled={isAnalyzing}
                        className="bg-[hsl(173,58%,39%)] hover:bg-[hsl(173,58%,34%)]"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Re-analyze Voice
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {samples.length === 0 ? (
                  <div className="text-center py-12 text-[hsl(220,14%,46%)]">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No content samples yet</p>
                    <p className="text-sm">Upload content using the Upload Content tab to start building your Content DNA profile</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {samples.map((sample) => {
                        const isOwnSample = sample.user_id === profile?.id;
                        const canDelete = isOwnSample || isAdmin;
                        
                        return (
                          <div
                            key={sample.id}
                            className="p-4 border border-[hsl(220,13%,88%)] rounded-lg bg-white hover:bg-[hsl(210,20%,98%)] transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-[hsl(222,47%,11%)] truncate">
                                    {sample.title || sample.file_name}
                                  </h4>
                                  <Badge variant="outline" className="text-xs">
                                    {SAMPLE_TYPES.find(t => t.value === sample.sample_type)?.label || sample.sample_type}
                                  </Badge>
                                  <Badge variant={isOwnSample ? 'default' : 'secondary'} className="text-xs">
                                    {isOwnSample ? 'You' : 'Team'}
                                  </Badge>
                                </div>
                                {sample.source_description && (
                                  <p className="text-sm text-[hsl(220,14%,46%)] mb-2">
                                    {sample.source_description}
                                  </p>
                                )}
                                <p className="text-sm text-[hsl(220,14%,46%)] line-clamp-2">
                                  {sample.content_text?.substring(0, 200)}...
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-[hsl(220,14%,46%)]">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(sample.created_at)}
                                  </span>
                                  {sample.file_size && (
                                    <span>{Math.round(sample.file_size / 1024)} KB</span>
                                  )}
                                </div>
                              </div>
                              {canDelete && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-[hsl(0,84%,60%)] hover:text-[hsl(0,84%,50%)] hover:bg-red-50"
                                      onClick={() => deleteSample(sample.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{isOwnSample ? 'Delete your sample' : 'Delete (admin)'}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
