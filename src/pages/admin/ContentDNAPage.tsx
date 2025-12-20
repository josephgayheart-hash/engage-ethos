import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useContentDNA, ContentDNASample } from '@/hooks/useContentDNA';
import { useInstitutionalProfiles } from '@/hooks/useInstitutionalProfiles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WaveBackground } from "@/components/WaveBackground";
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
  User,
  X,
  Zap,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Target,
  Award,
  Compass,
  LayoutGrid,
  List
} from 'lucide-react';
import { extractTextFromFile, getAcceptString } from '@/lib/documentParser';

const SAMPLE_TYPES = [
  // Core Communications
  { value: 'email', label: 'Email', category: 'Core Communications' },
  { value: 'sms', label: 'SMS/Text Message', category: 'Core Communications' },
  { value: 'newsletter', label: 'Newsletter', category: 'Core Communications' },
  { value: 'letter', label: 'Letter/Formal Correspondence', category: 'Core Communications' },
  { value: 'memo', label: 'Internal Memo', category: 'Core Communications' },
  
  // Public Relations & Media
  { value: 'news_story', label: 'News Story/Article', category: 'Public Relations' },
  { value: 'press_release', label: 'Press Release', category: 'Public Relations' },
  { value: 'media_advisory', label: 'Media Advisory', category: 'Public Relations' },
  { value: 'op_ed', label: 'Op-Ed/Opinion Piece', category: 'Public Relations' },
  { value: 'crisis_comm', label: 'Crisis Communication', category: 'Public Relations' },
  
  // Speeches & Events
  { value: 'speech', label: 'Speech/Remarks', category: 'Speeches & Events' },
  { value: 'talking_points', label: 'Talking Points', category: 'Speeches & Events' },
  { value: 'commencement', label: 'Commencement Address', category: 'Speeches & Events' },
  { value: 'event_script', label: 'Event Script/Program', category: 'Speeches & Events' },
  { value: 'presentation', label: 'Presentation Script', category: 'Speeches & Events' },
  
  // Outreach & Engagement
  { value: 'call_script', label: 'Call Script', category: 'Outreach' },
  { value: 'phonathon', label: 'Phonathon Script', category: 'Outreach' },
  { value: 'donor_stewardship', label: 'Donor Stewardship', category: 'Outreach' },
  { value: 'thank_you', label: 'Thank You Message', category: 'Outreach' },
  { value: 'alumni_outreach', label: 'Alumni Outreach', category: 'Outreach' },
  
  // Digital & Social
  { value: 'social', label: 'Social Media Post', category: 'Digital' },
  { value: 'web_copy', label: 'Website Copy', category: 'Digital' },
  { value: 'blog_post', label: 'Blog Post', category: 'Digital' },
  { value: 'video_script', label: 'Video Script', category: 'Digital' },
  { value: 'podcast_script', label: 'Podcast Script', category: 'Digital' },
  
  // Marketing & Recruitment
  { value: 'marketing', label: 'Marketing Material', category: 'Marketing' },
  { value: 'brochure', label: 'Brochure/Flyer', category: 'Marketing' },
  { value: 'viewbook', label: 'Viewbook Copy', category: 'Marketing' },
  { value: 'recruitment', label: 'Recruitment Material', category: 'Marketing' },
  { value: 'campaign', label: 'Campaign Material', category: 'Marketing' },
  { value: 'ad_copy', label: 'Advertisement Copy', category: 'Marketing' },
  
  // Brand & Guidelines
  { value: 'brand_guidelines', label: 'Brand Guidelines', category: 'Brand' },
  { value: 'style_guide', label: 'Style Guide', category: 'Brand' },
  { value: 'messaging_framework', label: 'Messaging Framework', category: 'Brand' },
  { value: 'brand_narrative', label: 'Brand Narrative', category: 'Brand' },
  { value: 'value_proposition', label: 'Value Proposition', category: 'Brand' },
  { value: 'boilerplate', label: 'Boilerplate Copy', category: 'Brand' },
  
  // Academic & Administrative
  { value: 'academic_catalog', label: 'Academic Catalog', category: 'Academic' },
  { value: 'program_description', label: 'Program Description', category: 'Academic' },
  { value: 'course_description', label: 'Course Description', category: 'Academic' },
  { value: 'faculty_bio', label: 'Faculty Biography', category: 'Academic' },
  { value: 'student_handbook', label: 'Student Handbook', category: 'Academic' },
  
  // Reports & Publications
  { value: 'annual_report', label: 'Annual Report', category: 'Publications' },
  { value: 'impact_report', label: 'Impact Report', category: 'Publications' },
  { value: 'research_summary', label: 'Research Summary', category: 'Publications' },
  { value: 'case_study', label: 'Case Study', category: 'Publications' },
  { value: 'white_paper', label: 'White Paper', category: 'Publications' },
  
  // Other
  { value: 'other', label: 'Other', category: 'Other' },
];

export default function ContentDNAPage() {
  const { tenant, profile, isAdmin } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get profileId from URL query params
  const profileIdFromUrl = searchParams.get('profileId');
  
  // Check if accessed via admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Get the institutional profiles to find the profile name
  const { profiles } = useInstitutionalProfiles();
  const selectedProfile = profileIdFromUrl 
    ? profiles.find(p => p.id === profileIdFromUrl) 
    : null;
  
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
    resetContentDNA,
  } = useContentDNA({ profileId: profileIdFromUrl });
  
  const [isResetting, setIsResetting] = useState(false);
  
  const handleResetContentDNA = async () => {
    setIsResetting(true);
    await resetContentDNA();
    setIsResetting(false);
  };

  // Upload state
  const [textInput, setTextInput] = useState('');
  const [sampleTitle, setSampleTitle] = useState('');
  const [sampleType, setSampleType] = useState('email');
  const [sourceDescription, setSourceDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Staged file state - file is selected but not yet uploaded
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedFileText, setStagedFileText] = useState<string | null>(null);
  const [stagedFileError, setStagedFileError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Tips dismissal state (persisted in localStorage)
  const [tipsVisible, setTipsVisible] = useState(() => {
    const stored = localStorage.getItem('contentDnaTipsVisible');
    return stored !== 'false';
  });
  
  const dismissTips = () => {
    setTipsVisible(false);
    localStorage.setItem('contentDnaTipsVisible', 'false');
  };

  // What is Content DNA box dismissal state (persisted in localStorage)
  const [whatIsBoxVisible, setWhatIsBoxVisible] = useState(() => {
    const stored = localStorage.getItem('contentDnaWhatIsBoxVisible');
    return stored !== 'false';
  });
  
  const dismissWhatIsBox = () => {
    setWhatIsBoxVisible(false);
    localStorage.setItem('contentDnaWhatIsBoxVisible', 'false');
  };

  // Library view mode state (persisted in localStorage)
  const [libraryViewMode, setLibraryViewMode] = useState<'card' | 'list'>(() => {
    const stored = localStorage.getItem('contentDnaLibraryViewMode');
    return (stored === 'list' ? 'list' : 'card') as 'card' | 'list';
  });
  
  const toggleLibraryViewMode = (mode: 'card' | 'list') => {
    setLibraryViewMode(mode);
    localStorage.setItem('contentDnaLibraryViewMode', mode);
  };

  // Instructions state
  const [customInstructions, setCustomInstructions] = useState(analysis?.custom_instructions || '');

  // Update local instructions when analysis loads
  useState(() => {
    if (analysis?.custom_instructions) {
      setCustomInstructions(analysis.custom_instructions);
    }
  });

  // Stage file - extract text but don't save yet
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setStagedFile(file);
    setStagedFileText(null);
    setStagedFileError(null);
    
    try {
      const { text, success, message } = await extractTextFromFile(file);
      
      if (!success || !text) {
        console.error('Could not extract text:', message);
        setStagedFileError(message || 'Could not extract text from this file.');
        setStagedFileText(null);
        return;
      }

      setStagedFileText(text);
      setStagedFileError(null);
      // Auto-fill title from filename if empty
      if (!sampleTitle) {
        setSampleTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (error) {
      console.error('Extract error:', error);
      setStagedFileError('Error reading file. Please try a different file.');
      setStagedFileText(null);
    } finally {
      setIsExtracting(false);
    }
  };

  // Actually save the staged file
  const handleAddStagedFile = async () => {
    if (!stagedFile || !stagedFileText) return;

    setIsUploading(true);
    try {
      await addSample(stagedFileText, stagedFile.name, {
        sampleType,
        title: sampleTitle || stagedFile.name.replace(/\.[^/.]+$/, ''),
        sourceDescription: sourceDescription || undefined,
        fileType: stagedFile.type,
        fileSize: stagedFile.size,
      });
      
      // Reset form and staged file
      setSampleTitle('');
      setSourceDescription('');
      setStagedFile(null);
      setStagedFileText(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Clear staged file
  const handleClearStagedFile = () => {
    setStagedFile(null);
    setStagedFileText(null);
    setStagedFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header with wave background */}
      <div className="relative overflow-hidden pb-12">
        <WaveBackground variant="teal" />
        
        <div className="relative container mx-auto px-4 pt-10 pb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/dashboard" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <span>/</span>
            {selectedProfile ? (
              <>
                <Link to="/settings" className="hover:text-foreground">
                  Profiles
                </Link>
                <span>/</span>
                <span className="text-foreground">{selectedProfile.name}</span>
                <span>/</span>
                <span className="text-foreground">Content DNA</span>
              </>
            ) : isAdminRoute ? (
              <>
                <Link to="/admin/console" className="hover:text-foreground">
                  Admin
                </Link>
                <span>/</span>
                <span className="text-foreground">Content DNA</span>
              </>
            ) : (
              <span className="text-foreground">Content DNA</span>
            )}
          </div>
          
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Dna className="w-7 h-7 text-secondary" />
                Content DNA
              </h1>
              <p className="text-muted-foreground mt-1">
                Train AI to match your institution's unique voice and communication style
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {samples.length} samples
              </Badge>
              {analysis && (
                <Badge className="bg-secondary text-secondary-foreground">
                  <Sparkles className="w-3 h-3 mr-1" />
                  DNA Analyzed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* What is Content DNA - First */}
        {whatIsBoxVisible && (
          <Card className="mb-6 border-border bg-gradient-to-r from-primary to-primary/80 text-primary-foreground relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/10"
              onClick={dismissWhatIsBox}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardContent className="py-5 pr-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-lg shrink-0">
                  <Dna className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold mb-2">What is Content DNA?</h2>
                  <p className="text-primary-foreground/80 text-sm leading-relaxed">
                    Content DNA captures your institution's unique voice and communication style. By uploading examples of your best communications—emails, newsletters, news stories, and more—our AI analyzes the patterns, tone, and vocabulary that make your messaging distinctly yours. This analysis then guides all AI-generated content to match your established brand voice.
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-primary-foreground/60">
                    <span className="flex items-center gap-1">
                      <Upload className="w-4 h-4" />
                      Upload content samples
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Analyze your voice
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Generate on-brand content
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Institution Branding Card - Second */}
        <Card className="mb-6 border-border">
          <CardContent className="py-5">
            <div className="flex items-center gap-4">
              {/* Use profile logo if available, otherwise fall back to tenant logo */}
              {(selectedProfile?.config?.logoUrl || tenant?.logo_url) ? (
                <img 
                  src={selectedProfile?.config?.logoUrl || tenant?.logo_url || ''}
                  alt={`${selectedProfile?.name || tenant?.institution_name} logo`}
                  className="w-14 h-14 object-contain rounded-lg border border-border bg-background p-1"
                />
              ) : (
                <div 
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: selectedProfile?.config?.primaryColor || tenant?.primary_color || 'hsl(222,47%,14%)' }}
                >
                  {(selectedProfile?.name || tenant?.institution_name)?.charAt(0) || 'U'}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium text-foreground">
                  {selectedProfile?.name || tenant?.institution_name || 'Your Institution'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedProfile ? `Content DNA for ${selectedProfile.name}` : 'Institution-wide Content DNA'}
                </p>
              </div>
              {/* DNA & Brand Platform Last Updated */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {analysis?.voice_analysis && analysis?.last_analyzed_at && (
                  <div className="flex items-center gap-2 border-r border-border pr-4">
                    <Dna className="w-4 h-4" />
                    <span>Voice DNA {new Date(analysis.last_analyzed_at).toLocaleDateString()}</span>
                  </div>
                )}
                {analysis?.brand_platform && analysis?.last_analyzed_at && (
                  <div className="flex items-center gap-2 border-r border-border pr-4">
                    <Target className="w-4 h-4" />
                    <span>Brand Platform {new Date(analysis.last_analyzed_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              {/* Color Swatches */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <div 
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: tenant?.primary_color || 'hsl(222,47%,14%)' }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Primary Color</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <div 
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: tenant?.accent_color || 'hsl(173,58%,39%)' }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Accent Color</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Context Banner */}
        {selectedProfile && (
          <Alert className="mb-6 border-primary/30 bg-primary/5">
            <Building2 className="h-4 w-4" />
            <AlertDescription className="ml-2">
              Configuring Content DNA for <strong>{selectedProfile.name}</strong>. 
              Samples and analysis will be specific to this institutional profile.
            </AlertDescription>
          </Alert>
        )}

        {/* PROMINENT: Ready to Analyze Banner - Shows when samples exist but no analysis yet */}
        {samples.length > 0 && isAdmin && !analysis?.voice_analysis && (
          <Card className="mb-6 border-2 border-secondary bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shadow-lg animate-in fade-in slide-in-from-top-2 duration-500">
            <CardContent className="py-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-xl">
                    <Zap className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold mb-1">Ready to Analyze!</h2>
                    <p className="text-secondary-foreground/90">
                      You have {samples.length} content sample{samples.length !== 1 ? 's' : ''} ready for voice analysis. 
                      Click the button to generate your institution's Content DNA profile.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={analyzeVoice}
                  disabled={isAnalyzing}
                  size="lg"
                  className="bg-white text-secondary hover:bg-white/90 font-bold px-8 py-6 text-lg shadow-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze Voice Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Re-analyze Banner - Shows when samples were added after last analysis */}
        {samples.length > 0 && isAdmin && analysis?.voice_analysis && analysis.last_analyzed_at && 
          samples.some(s => new Date(s.created_at) > new Date(analysis.last_analyzed_at!)) && (
          <Card className="mb-6 border-2 border-amber-500 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
            <CardContent className="py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">New Content Added</h3>
                    <p className="text-white/90 text-sm">
                      You've added new samples since your last analysis. Re-analyze to update your Content DNA.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={analyzeVoice}
                  disabled={isAnalyzing}
                  className="bg-white text-amber-600 hover:bg-white/90 font-bold"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Re-Analyze
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reset Content DNA Banner - Shows when no samples but analysis exists */}
        {samples.length === 0 && analysis && isAdmin && (
          <Card className="mb-6 border-2 border-muted bg-muted/30">
            <CardContent className="py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <RefreshCw className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">No Samples Remaining</h3>
                    <p className="text-muted-foreground text-sm">
                      All content samples have been removed. Reset your Content DNA to start fresh with new samples.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleResetContentDNA}
                  disabled={isResetting}
                  variant="outline"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset & Start Fresh
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
            <TabsTrigger value="brand-platform" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Brand Platform
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
                    Upload documents containing your communications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Sample Type</Label>
                    <Select value={sampleType} onValueChange={setSampleType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {/* Group sample types by category */}
                        {['Core Communications', 'Public Relations', 'Speeches & Events', 'Outreach', 'Digital', 'Marketing', 'Brand', 'Academic', 'Publications', 'Other'].map((category) => {
                          const categoryTypes = SAMPLE_TYPES.filter(t => t.category === category);
                          if (categoryTypes.length === 0) return null;
                          return (
                            <SelectGroup key={category}>
                              <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{category}</SelectLabel>
                              {categoryTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          );
                        })}
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
                      {/* Staged File Display */}
                      {stagedFile ? (
                        <div className="border-2 border-[hsl(173,58%,39%)] rounded-lg p-4 bg-[hsl(173,58%,39%)]/5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[hsl(173,58%,39%)]/10 rounded-lg">
                                <FileText className="w-5 h-5 text-[hsl(173,58%,39%)]" />
                              </div>
                              <div>
                                <p className="font-medium text-[hsl(222,47%,11%)] text-sm">{stagedFile.name}</p>
                                <p className="text-xs text-[hsl(220,14%,46%)]">
                                  {(stagedFile.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleClearStagedFile}
                              className="text-[hsl(220,14%,46%)] hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {isExtracting ? (
                            <div className="flex items-center justify-center gap-2 py-3 text-[hsl(220,14%,46%)]">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Extracting text...</span>
                            </div>
                          ) : stagedFileText ? (
                            <>
                              <div className="text-xs text-[hsl(173,58%,39%)] flex items-center gap-1 mb-3">
                                <CheckCircle2 className="w-3 h-3" />
                                Ready to add ({stagedFileText.length.toLocaleString()} characters extracted)
                              </div>
                              <Button
                                onClick={handleAddStagedFile}
                                disabled={isUploading}
                                className="w-full bg-[hsl(173,58%,39%)] hover:bg-[hsl(173,58%,30%)] text-white"
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Add to Content Library
                                  </>
                                )}
                              </Button>
                            </>
                          ) : stagedFileError ? (
                            <div className="space-y-2">
                              <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <X className="w-4 h-4 shrink-0 mt-0.5" />
                                  <span>{stagedFileError}</span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearStagedFile}
                                className="w-full"
                              >
                                Try Another File
                              </Button>
                            </div>
                          ) : (
                            <div className="text-xs text-red-500 flex items-center gap-1">
                              <X className="w-3 h-3" />
                              Could not extract text from this file
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-[hsl(220,13%,88%)] rounded-lg cursor-pointer hover:border-[hsl(222,47%,14%)] hover:bg-[hsl(210,20%,98%)] transition-colors">
                            <Upload className="w-6 h-6 text-[hsl(220,14%,46%)]" />
                            <span className="text-sm font-medium text-[hsl(222,47%,14%)]">
                              Choose File
                            </span>
                            <Input
                              ref={fileInputRef}
                              type="file"
                              accept={getAcceptString()}
                              onChange={handleFileSelect}
                              disabled={isUploading || isExtracting}
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs text-[hsl(220,14%,46%)] mt-1 text-center">
                            Supports .txt, .docx, .pdf, .png, .jpg (screenshots)
                          </p>
                        </>
                      )}
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

            {/* Recent Uploads Summary - Simplified since main CTA is at top */}
            {samples.length > 0 && (
              <Card className="mt-6 border-[hsl(220,13%,88%)] bg-[hsl(173,58%,39%)]/5">
                <CardContent className="py-4">
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
                </CardContent>
              </Card>
            )}

            {/* Dismissible Tips Card - at bottom */}
            {tipsVisible && (
              <Card className="mt-6 border-[hsl(220,13%,88%)] bg-[hsl(45,93%,97%)]">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-[hsl(45,93%,47%)] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-[hsl(222,47%,11%)] mb-1">Tips for best results</h4>
                      <ul className="text-sm text-[hsl(220,14%,46%)] space-y-1">
                        <li>• Include a variety of content types (emails, newsletters, news stories)</li>
                        <li>• Add samples from different departments and communication contexts</li>
                        <li>• Include both formal and informal communications for comprehensive analysis</li>
                        <li>• 10-20 samples typically provide the best voice analysis</li>
                      </ul>
                    </div>
                    <button
                      onClick={dismissTips}
                      className="p-1 rounded hover:bg-[hsl(45,93%,90%)] text-[hsl(220,14%,46%)] hover:text-[hsl(222,47%,11%)] transition-colors"
                      aria-label="Dismiss tips"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Voice Analysis Tab */}
          <TabsContent value="analysis">
            {analysis?.voice_analysis ? (
              <div className="space-y-6">
                {/* Header with Re-analyze Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Voice Analysis</h2>
                    <p className="text-sm text-muted-foreground">
                      Based on {analysis.sample_count} samples • Analyzed {analysis.last_analyzed_at ? formatDate(analysis.last_analyzed_at) : 'recently'}
                    </p>
                  </div>
                  {isAdmin && (
                    <Button
                      onClick={analyzeVoice}
                      disabled={isAnalyzing || samples.length === 0}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Re-analyzing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Re-analyze Voice
                        </>
                      )}
                    </Button>
                  )}
                </div>

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

          {/* Brand Platform Tab */}
          <TabsContent value="brand-platform">
            {analysis?.brand_platform ? (
              <div className="space-y-6">
                {/* Header with Re-analyze Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Brand Platform</h2>
                    <p className="text-sm text-muted-foreground">
                      Brand pillars, promise, and proof points extracted from your content
                      {analysis.last_analyzed_at && (
                        <span className="ml-2">• Updated {new Date(analysis.last_analyzed_at).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                  {isAdmin && (
                    <Button
                      onClick={analyzeVoice}
                      disabled={isAnalyzing || samples.length === 0}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Re-analyzing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Re-extract Platform
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Brand Promise */}
                {analysis.brand_platform.brandPromise && (
                  <Card className="border-[hsl(220,13%,88%)] bg-gradient-to-r from-[hsl(222,47%,14%)] to-[hsl(222,47%,20%)] text-white">
                    <CardContent className="py-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                          <Quote className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-serif text-xl font-bold mb-2">Brand Promise</h3>
                          <p className="text-white/90 text-lg italic">"{analysis.brand_platform.brandPromise}"</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Brand Pillars */}
                {analysis.brand_platform.brandPillars && analysis.brand_platform.brandPillars.length > 0 && (
                  <Card className="border-[hsl(220,13%,88%)]">
                    <CardHeader>
                      <CardTitle className="text-[hsl(222,47%,11%)] text-lg flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Brand Pillars
                      </CardTitle>
                      <CardDescription>
                        Core themes and values that define your institution's messaging
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {analysis.brand_platform.brandPillars.map((pillar: { name: string; description: string; keywords?: string[] }, idx: number) => (
                          <div 
                            key={idx} 
                            className="p-4 rounded-lg border border-[hsl(220,13%,88%)] bg-[hsl(210,20%,98%)]"
                          >
                            <h4 className="font-medium text-[hsl(222,47%,11%)] mb-1">{pillar.name}</h4>
                            <p className="text-sm text-[hsl(220,14%,46%)] mb-2">{pillar.description}</p>
                            {pillar.keywords && pillar.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {pillar.keywords.map((keyword: string, kidx: number) => (
                                  <Badge key={kidx} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Proof Points & Commitments */}
                <div className="grid md:grid-cols-2 gap-6">
                  {analysis.brand_platform.proofPoints && analysis.brand_platform.proofPoints.length > 0 && (
                    <Card className="border-[hsl(220,13%,88%)]">
                      <CardHeader>
                        <CardTitle className="text-[hsl(222,47%,11%)] text-lg flex items-center gap-2">
                          <Compass className="w-5 h-5" />
                          Proof Points
                        </CardTitle>
                        <CardDescription>
                          Evidence and facts that support your brand claims
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.brand_platform.proofPoints.map((point: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-[hsl(222,47%,11%)]">
                              <CheckCircle2 className="w-4 h-4 text-[hsl(173,58%,39%)] mt-0.5 shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {analysis.brand_platform.commitments && analysis.brand_platform.commitments.length > 0 && (
                    <Card className="border-[hsl(220,13%,88%)]">
                      <CardHeader>
                        <CardTitle className="text-[hsl(222,47%,11%)] text-lg flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Commitments
                        </CardTitle>
                        <CardDescription>
                          Promises your institution makes to students
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.brand_platform.commitments.map((commitment: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-[hsl(222,47%,11%)]">
                              <Award className="w-4 h-4 text-[hsl(45,93%,47%)] mt-0.5 shrink-0" />
                              {commitment}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Brand Pathways */}
                {analysis.brand_platform.brandPathways && analysis.brand_platform.brandPathways.length > 0 && (
                  <Card className="border-[hsl(220,13%,88%)]">
                    <CardHeader>
                      <CardTitle className="text-[hsl(222,47%,11%)] text-lg flex items-center gap-2">
                        <Compass className="w-5 h-5" />
                        Brand Pathways
                      </CardTitle>
                      <CardDescription>
                        Journey narratives and outcome themes extracted from your content
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {analysis.brand_platform.brandPathways.map((pathway: { name: string; description: string }, idx: number) => (
                          <div 
                            key={idx} 
                            className="p-4 rounded-lg border border-[hsl(220,13%,88%)] bg-[hsl(210,20%,98%)]"
                          >
                            <h4 className="font-medium text-[hsl(222,47%,11%)] mb-1">{pathway.name}</h4>
                            <p className="text-sm text-[hsl(220,14%,46%)]">{pathway.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="border-[hsl(220,13%,88%)]">
                <CardContent className="py-12 text-center">
                  <Target className="w-12 h-12 mx-auto mb-4 text-[hsl(220,14%,46%)] opacity-50" />
                  <h3 className="font-medium text-[hsl(222,47%,11%)] mb-2">No Brand Platform Yet</h3>
                  <p className="text-[hsl(220,14%,46%)] mb-4">
                    Upload content samples and run an analysis to extract your brand pillars, promise, and proof points
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
                  <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center border border-border rounded-lg p-1 bg-muted/30">
                      <Button
                        variant={libraryViewMode === 'card' ? 'default' : 'ghost'}
                        size="sm"
                        className={`h-7 px-2 ${libraryViewMode === 'card' ? 'bg-background shadow-sm' : ''}`}
                        onClick={() => toggleLibraryViewMode('card')}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={libraryViewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        className={`h-7 px-2 ${libraryViewMode === 'list' ? 'bg-background shadow-sm' : ''}`}
                        onClick={() => toggleLibraryViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
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
                ) : libraryViewMode === 'card' ? (
                  /* Card View */
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
                ) : (
                  /* List View - Compact table format */
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="w-[80px]">Size</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {samples.map((sample) => {
                          const isOwnSample = sample.user_id === profile?.id;
                          const canDelete = isOwnSample || isAdmin;
                          
                          return (
                            <TableRow key={sample.id} className="hover:bg-muted/50">
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground truncate max-w-[280px]">
                                    {sample.title || sample.file_name}
                                  </span>
                                  {sample.source_description && (
                                    <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                                      {sample.source_description}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs whitespace-nowrap">
                                  {SAMPLE_TYPES.find(t => t.value === sample.sample_type)?.label || sample.sample_type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={isOwnSample ? 'default' : 'secondary'} className="text-xs">
                                  {isOwnSample ? 'You' : 'Team'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                {formatDate(sample.created_at)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {sample.file_size ? `${Math.round(sample.file_size / 1024)} KB` : '-'}
                              </TableCell>
                              <TableCell>
                                {canDelete && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
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
