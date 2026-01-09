import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useContentDNA, ContentDNASample } from '@/hooks/useContentDNA';
import { useInstitutionalProfiles } from '@/hooks/useInstitutionalProfiles';
import { WebCrawlTab } from '@/components/dna/WebCrawlTab';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WaveBackground } from "@/components/WaveBackground";
import { ContentDNAExplainer } from "@/components/ContentDNAExplainer";
import { ContentDNAVersionHistory } from "@/components/ContentDNAVersionHistory";
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
  List,
  History,
  Search,
  Wand2,
  PenLine,
  Type,
  Megaphone,
  Save,
  Plus,
  ChevronDown,
  Globe,
  Pencil,
  PenTool,
  ArrowRight,
} from 'lucide-react';
import { extractTextFromFile, getAcceptString } from '@/lib/documentParser';
import { DNATuningControls, DNAAdjustments } from '@/components/DNATuningControls';

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

// Helper to auto-detect if pasted content looks like an email
function detectContentType(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  // Email indicators
  const emailPatterns = [
    /^subject:/mi,
    /^from:/mi,
    /^to:/mi,
    /^dear\s+/mi,
    /^hi\s+\w+,/mi,
    /^hello\s+\w+,/mi,
    /^good\s+(morning|afternoon|evening)/mi,
    /best\s+regards/mi,
    /sincerely,/mi,
    /warm\s+regards/mi,
    /thanks,?\s*$/mi,
    /^re:/mi,
    /^fwd:/mi,
  ];
  
  const emailMatches = emailPatterns.filter(pattern => pattern.test(text)).length;
  if (emailMatches >= 2) {
    return 'email';
  }
  
  // Newsletter indicators
  if (lowerText.includes('unsubscribe') || lowerText.includes('view in browser') || lowerText.includes('newsletter')) {
    return 'newsletter';
  }
  
  // SMS indicators (short, no formal greeting)
  if (text.length < 320 && !text.includes('\n\n') && !/^(dear|hi|hello|good)/i.test(text.trim())) {
    return 'sms';
  }
  
  // Press release indicators
  if (/for\s+immediate\s+release/i.test(text) || /press\s+release/i.test(text) || /media\s+contact/i.test(text)) {
    return 'press_release';
  }
  
  return null;
}

export default function ContentDNAPage() {
  const { tenant, profile, isAdmin } = useAuth();
  const location = useLocation();
  
  // Brand pillar inline editing state
  const [editingPillarIndex, setEditingPillarIndex] = useState<number | null>(null);
  const [editingPillarData, setEditingPillarData] = useState<{ name: string; description: string } | null>(null);
  const navigate = useNavigate();
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
    adjustments,
    isLoading,
    isAnalyzing,
    isSaving,
    isExtracting,
    isSavingAdjustments,
    extractionStats,
    addSample,
    deleteSample,
    updateSample,
    analyzeVoice,
    updateCustomInstructions,
    updateBrandPlatform,
    resetContentDNA,
    extractSemantics,
    searchSamples,
    saveAdjustments,
  } = useContentDNA({ profileId: profileIdFromUrl });
  
  // Editing sample state
  const [editingSampleId, setEditingSampleId] = useState<string | null>(null);
  const [editingSampleData, setEditingSampleData] = useState<{
    title: string;
    sample_type: string;
    source_description: string;
  } | null>(null);
  
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
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  
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

  // Active tab state - default to summary
  const [activeTab, setActiveTab] = useState('summary');

  // Search state for Content Library
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Library inline upload state
  const [libraryUploadOpen, setLibraryUploadOpen] = useState(false);
  const libraryFileInputRef = useRef<HTMLInputElement>(null);
  const [libraryTextInput, setLibraryTextInput] = useState('');
  const [librarySampleTitle, setLibrarySampleTitle] = useState('');
  const [librarySampleType, setLibrarySampleType] = useState('email');
  const [librarySourceDescription, setLibrarySourceDescription] = useState('');
  const [libraryStagedFile, setLibraryStagedFile] = useState<File | null>(null);
  const [libraryStagedFileText, setLibraryStagedFileText] = useState<string | null>(null);
  const [libraryStagedFileError, setLibraryStagedFileError] = useState<string | null>(null);
  const [libraryIsExtractingFile, setLibraryIsExtractingFile] = useState(false);
  const [libraryIsUploading, setLibraryIsUploading] = useState(false);

  // Handle saving DNA adjustments (uses hook's saveAdjustments)
  const handleSaveAdjustments = async (newAdjustments: DNAAdjustments) => {
    await saveAdjustments(newAdjustments);
  };

  // Instructions state
  const [customInstructions, setCustomInstructions] = useState(analysis?.custom_instructions || '');

  // Update local instructions when analysis loads
  useState(() => {
    if (analysis?.custom_instructions) {
      setCustomInstructions(analysis.custom_instructions);
    }
  });

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchSamples(searchQuery, undefined, 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  // Handle text input with auto-detection
  const handleTextInputChange = (value: string, setType: (type: string) => void) => {
    // Auto-detect content type when user pastes content
    if (value.length > 50) {
      const detectedType = detectContentType(value);
      if (detectedType) {
        setType(detectedType);
      }
    }
  };

  // Edit sample handlers
  const handleStartEdit = (sample: ContentDNASample) => {
    setEditingSampleId(sample.id);
    setEditingSampleData({
      title: sample.title || sample.file_name,
      sample_type: sample.sample_type || 'other',
      source_description: sample.source_description || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingSampleId(null);
    setEditingSampleData(null);
  };

  const handleSaveEdit = async () => {
    if (!editingSampleId || !editingSampleData) return;
    
    await updateSample(editingSampleId, {
      title: editingSampleData.title,
      sample_type: editingSampleData.sample_type,
      source_description: editingSampleData.source_description || undefined,
    });
    
    setEditingSampleId(null);
    setEditingSampleData(null);
  };

  // Brand pillar inline editing handlers
  const handleStartPillarEdit = (index: number, pillar: { name: string; description: string }) => {
    setEditingPillarIndex(index);
    setEditingPillarData({ name: pillar.name, description: pillar.description });
  };

  const handleCancelPillarEdit = () => {
    setEditingPillarIndex(null);
    setEditingPillarData(null);
  };

  const handleSavePillarEdit = async () => {
    if (editingPillarIndex === null || !editingPillarData || !analysis?.brand_platform) return;
    
    // Create updated brand pillars array
    const updatedPillars = [...(analysis.brand_platform.brandPillars || [])];
    updatedPillars[editingPillarIndex] = {
      ...updatedPillars[editingPillarIndex],
      name: editingPillarData.name,
      description: editingPillarData.description,
    };
    
    // Update brand platform with new pillars
    const updatedBrandPlatform = {
      ...analysis.brand_platform,
      brandPillars: updatedPillars,
    };
    
    await updateBrandPlatform(updatedBrandPlatform);
    
    setEditingPillarIndex(null);
    setEditingPillarData(null);
  };

  // Library inline upload handlers
  const handleLibraryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLibraryIsExtractingFile(true);
    setLibraryStagedFile(file);
    setLibraryStagedFileText(null);
    setLibraryStagedFileError(null);
    
    try {
      const { text, success, message } = await extractTextFromFile(file);
      
      if (!success || !text) {
        console.error('Could not extract text:', message);
        setLibraryStagedFileError(message || 'Could not extract text from this file.');
        setLibraryStagedFileText(null);
        return;
      }

      setLibraryStagedFileText(text);
      setLibraryStagedFileError(null);
      if (!librarySampleTitle) {
        setLibrarySampleTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (error) {
      console.error('Extract error:', error);
      setLibraryStagedFileError('Error reading file. Please try a different file.');
      setLibraryStagedFileText(null);
    } finally {
      setLibraryIsExtractingFile(false);
    }
  };

  const handleLibraryAddStagedFile = async () => {
    if (!libraryStagedFile || !libraryStagedFileText) return;

    setLibraryIsUploading(true);
    try {
      await addSample(libraryStagedFileText, libraryStagedFile.name, {
        sampleType: librarySampleType,
        title: librarySampleTitle || libraryStagedFile.name.replace(/\.[^/.]+$/, ''),
        sourceDescription: librarySourceDescription || undefined,
        fileType: libraryStagedFile.type,
        fileSize: libraryStagedFile.size,
      });
      
      // Reset form
      setLibrarySampleTitle('');
      setLibrarySourceDescription('');
      setLibraryStagedFile(null);
      setLibraryStagedFileText(null);
      setLibraryUploadOpen(false);
      if (libraryFileInputRef.current) libraryFileInputRef.current.value = '';
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setLibraryIsUploading(false);
    }
  };

  const handleLibraryClearStagedFile = () => {
    setLibraryStagedFile(null);
    setLibraryStagedFileText(null);
    setLibraryStagedFileError(null);
    if (libraryFileInputRef.current) libraryFileInputRef.current.value = '';
  };

  const handleLibraryTextSubmit = async () => {
    if (!libraryTextInput.trim()) return;

    setLibraryIsUploading(true);
    try {
      await addSample(libraryTextInput, `Pasted content - ${new Date().toLocaleDateString()}`, {
        sampleType: librarySampleType,
        title: librarySampleTitle || `${SAMPLE_TYPES.find(t => t.value === librarySampleType)?.label || 'Content'} Sample`,
        sourceDescription: librarySourceDescription || undefined,
      });
      
      // Reset form
      setLibraryTextInput('');
      setLibrarySampleTitle('');
      setLibrarySourceDescription('');
      setLibraryUploadOpen(false);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLibraryIsUploading(false);
    }
  };

  // Stage file - extract text but don't save yet
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingFile(true);
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
      setIsExtractingFile(false);
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
                <span className="text-foreground">Content DNA Studio</span>
              </>
            ) : isAdminRoute ? (
              <>
                <Link to="/admin/console" className="hover:text-foreground">
                  Admin
                </Link>
                <span>/</span>
                <span className="text-foreground">Content DNA Studio</span>
              </>
            ) : (
              <span className="text-foreground">Content DNA Studio</span>
            )}
          </div>
          
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Dna className="w-7 h-7 text-secondary" />
                Content DNA Studio
              </h1>
              <p className="text-muted-foreground mt-1">
                Upload samples, tune voice dimensions, and manage your content library for on-brand AI messaging
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

          {/* Institutional Profile Selector Card */}
          {profiles.length > 0 && (
            <Card className={`mt-6 ${selectedProfile ? 'border-primary/30 bg-primary/5' : 'border-amber-400 border-dashed border-2 bg-amber-50'}`}>
              <CardContent className="py-5">
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <div className={`p-3 rounded-lg shrink-0 ${selectedProfile ? 'bg-primary/10' : 'bg-amber-100'}`}>
                    {selectedProfile ? (
                      <CheckCircle2 className="w-7 h-7 text-primary" />
                    ) : (
                      <AlertCircle className="w-7 h-7 text-amber-600" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium mb-1 ${selectedProfile ? 'text-foreground' : 'text-amber-800'}`}>
                      {selectedProfile ? 'Content DNA Profile Active' : 'Select an Institutional Profile'}
                    </h3>
                    <p className={`text-sm ${selectedProfile ? 'text-muted-foreground' : 'text-amber-700'}`}>
                      {selectedProfile 
                        ? `Viewing and managing Content DNA for ${selectedProfile.name}. All samples and analysis are scoped to this profile.`
                        : 'Content DNA needs to be associated with an institutional profile. Select a profile to view or configure its unique voice settings.'
                      }
                    </p>
                  </div>
                  
                  {/* Profile Selector */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Select 
                      value={selectedProfile?.id || 'none'} 
                      onValueChange={(value) => {
                        if (value === 'none') {
                          navigate('/admin/content-dna');
                        } else {
                          navigate(`/admin/content-dna?profileId=${value}`);
                        }
                      }}
                    >
                      <SelectTrigger className={`w-[220px] ${selectedProfile ? 'border-primary/30' : 'border-amber-400'}`}>
                        <SelectValue placeholder="Choose a profile..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="none">
                          <span className="text-muted-foreground">All Profiles</span>
                        </SelectItem>
                        {profiles.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-2">
                              {p.config.logoUrl ? (
                                <img src={p.config.logoUrl} alt="" className="w-4 h-4 rounded object-contain" />
                              ) : (
                                <div 
                                  className="w-4 h-4 rounded text-[8px] flex items-center justify-center text-white font-bold"
                                  style={{ backgroundColor: p.config.primaryColor || '#1F2A44' }}
                                >
                                  {p.name.charAt(0)}
                                </div>
                              )}
                              <span>{p.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground"
                      onClick={() => navigate('/university-settings?tab=profiles')}
                    >
                      <Settings className="w-4 h-4" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Profiles - Create First */}
          {profiles.length === 0 && isAdmin && (
            <Card className="mt-6 border-dashed border-2 border-amber-400 bg-amber-50">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Building2 className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-amber-800 mb-1">Create an Institutional Profile</h3>
                    <p className="text-sm text-amber-700">
                      Content DNA needs to be associated with an institutional profile. Create your first profile to get started.
                    </p>
                  </div>
                  <Button onClick={() => navigate('/university-settings?tab=profiles')} className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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

        {/* How Content DNA Works - Educational Section */}
        <ContentDNAExplainer 
          context="content-dna-page" 
          defaultOpen={false}
          collapsible={true}
          showManageLink={false}
          className="mb-6"
        />

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
                      style={{ backgroundColor: selectedProfile?.config?.primaryColor || tenant?.primary_color || 'hsl(222,47%,14%)' }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Primary Color</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <div 
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: selectedProfile?.config?.accentColor || tenant?.accent_color || 'hsl(173,58%,39%)' }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Accent Color</TooltipContent>
                </Tooltip>
              </div>
              {/* Edit Settings Button */}
              {isAdmin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => navigate('/university-settings')}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit Settings</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit University Settings</TooltipContent>
                </Tooltip>
              )}
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

        {/* Generate Content CTA - Shows when DNA is configured */}
        {analysis?.voice_analysis && (
          <Card className="mb-6 border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <PenTool className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Ready to Generate Content</h3>
                    <p className="text-sm text-muted-foreground">
                      Your Content DNA is configured. Generate on-brand messages using the Message Builder.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(`/build${profileIdFromUrl ? `?profileId=${profileIdFromUrl}` : ''}`)}
                  className="gap-2"
                >
                  <PenTool className="w-4 h-4" />
                  Open Message Builder
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
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
                      You have {samples.length} content sample{samples.length !== 1 ? 's' : ''} ready. 
                      Click to analyze and extract your <strong>voice profile</strong> and <strong>brand platform</strong> together.
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
                      Analyze Content DNA
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
                      You've added new samples since your last analysis. Re-analyze to update both voice profile and brand platform.
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
                      Re-Analyze DNA
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-[hsl(220,13%,88%)] flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="webcrawl" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              WebCrawl
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Stories
            </TabsTrigger>
            <TabsTrigger value="facts" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Facts
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Voice Profile
            </TabsTrigger>
            <TabsTrigger value="brand-platform" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Brand Platform
            </TabsTrigger>
            <TabsTrigger value="instructions" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Instructions
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="refine" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Refine
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab - Analytics Overview */}
          <TabsContent value="summary">
            <div className="space-y-6">
              {/* Profile Status Header */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(selectedProfile?.config?.logoUrl || tenant?.logo_url) ? (
                        <img 
                          src={selectedProfile?.config?.logoUrl || tenant?.logo_url || ''}
                          alt="Logo"
                          className="w-12 h-12 object-contain rounded-lg border bg-white p-1"
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: selectedProfile?.config?.primaryColor || tenant?.primary_color || '#1F2A44' }}
                        >
                          {(selectedProfile?.name || tenant?.institution_name)?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {selectedProfile?.name || tenant?.institution_name || 'Institution'} Content DNA
                        </CardTitle>
                        <CardDescription>
                          {selectedProfile ? 'Profile-specific Content DNA' : 'Institution-wide Content DNA'}
                        </CardDescription>
                      </div>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/university-settings')}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit Settings
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{samples.length}</p>
                        <p className="text-xs text-muted-foreground">Content Samples</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100">
                        <Globe className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{samples.filter(s => s.source_url).length}</p>
                        <p className="text-xs text-muted-foreground">Web Scraped</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${analysis?.voice_analysis ? 'bg-green-100' : 'bg-amber-100'}`}>
                        <Dna className={`w-5 h-5 ${analysis?.voice_analysis ? 'text-green-600' : 'text-amber-600'}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{analysis?.voice_analysis ? 'Active' : 'Pending'}</p>
                        <p className="text-xs text-muted-foreground">Voice Profile</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${analysis?.brand_platform ? 'bg-purple-100' : 'bg-gray-100'}`}>
                        <Target className={`w-5 h-5 ${analysis?.brand_platform ? 'text-purple-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {analysis?.brand_platform?.brandPillars?.length || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Brand Pillars</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content Breakdown */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Sample Types Distribution */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Content Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {samples.length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(
                          samples.reduce((acc, s) => {
                            const type = s.sample_type || 'other';
                            acc[type] = (acc[type] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        )
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 6)
                          .map(([type, count]) => {
                            const typeInfo = SAMPLE_TYPES.find(t => t.value === type);
                            const percentage = Math.round((count / samples.length) * 100);
                            return (
                              <div key={type} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">{typeInfo?.label || type}</span>
                                  <span className="font-medium">{count}</span>
                                </div>
                                <Progress value={percentage} className="h-1.5" />
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No samples uploaded yet
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* DNA Status */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Analysis Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Voice Analysis Status */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${analysis?.voice_analysis ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <span className="text-sm font-medium">Voice Profile</span>
                      </div>
                      {analysis?.voice_analysis ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Analyzed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>

                    {/* Brand Platform Status */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${analysis?.brand_platform ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm font-medium">Brand Platform</span>
                      </div>
                      {analysis?.brand_platform ? (
                        <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                          {analysis.brand_platform.brandPillars?.length || 0} pillars
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not extracted</Badge>
                      )}
                    </div>

                    {/* Semantic Extraction Status */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${extractionStats.completed > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <span className="text-sm font-medium">Semantic Extraction</span>
                      </div>
                      <Badge variant="outline">
                        {extractionStats.completed}/{extractionStats.total} processed
                      </Badge>
                    </div>

                    {/* Last Analysis Date */}
                    {analysis?.last_analyzed_at && (
                      <div className="pt-2 text-xs text-muted-foreground text-center">
                        Last analyzed: {new Date(analysis.last_analyzed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => setActiveTab('upload')}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Content
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('webcrawl')}>
                      <Globe className="w-4 h-4 mr-2" />
                      Scrape Website
                    </Button>
                    {samples.length > 0 && !analysis?.voice_analysis && (
                      <Button onClick={analyzeVoice} disabled={isAnalyzing} className="bg-secondary hover:bg-secondary/90">
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze Content DNA
                          </>
                        )}
                      </Button>
                    )}
                    {analysis?.voice_analysis && (
                      <Button variant="outline" onClick={() => setActiveTab('analysis')}>
                        <Dna className="w-4 h-4 mr-2" />
                        View Voice Profile
                      </Button>
                    )}
                    {analysis?.brand_platform && (
                      <Button variant="outline" onClick={() => setActiveTab('brand-platform')}>
                        <Target className="w-4 h-4 mr-2" />
                        View Brand Platform
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                          
                          {isExtractingFile ? (
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
                              disabled={isUploading || isExtractingFile}
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
                      onChange={(e) => {
                        setTextInput(e.target.value);
                        handleTextInputChange(e.target.value, setSampleType);
                      }}
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
                      <button 
                        onClick={() => setActiveTab('library')}
                        className="text-sm text-[hsl(173,58%,39%)] hover:underline cursor-pointer text-left"
                      >
                        View all samples in the Content Library tab →
                      </button>
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

          {/* WebCrawl Tab */}
          <TabsContent value="webcrawl">
            <WebCrawlTab 
              samples={samples}
              onImportUrl={async (url, content, options) => {
                await addSample(content, `Web import - ${new Date().toLocaleDateString()}`, {
                  sampleType: options.sampleType,
                  title: options.title,
                  sourceUrl: options.sourceUrl,
                });
              }}
              onDeleteSample={deleteSample}
            />
          </TabsContent>

          {/* Voice Profile Tab */}
          <TabsContent value="analysis">
            {analysis?.voice_analysis ? (
              <div className="space-y-6">
                {/* Header with Unified Analysis Indicator */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-foreground">Voice Profile</h2>
                      <Badge variant="outline" className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 text-emerald-700 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Unified Analysis
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>Based on {analysis.sample_count} samples</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {analysis.last_analyzed_at ? formatDate(analysis.last_analyzed_at) : 'recently'}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-600">Analyzed with Brand Platform</span>
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
                          Re-analyze DNA
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
                {/* Header with Unified Analysis Indicator */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-foreground">Brand Platform</h2>
                      <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200 text-blue-700 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Unified Analysis
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>Brand pillars, promise, and proof points</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {analysis.last_analyzed_at ? formatDate(analysis.last_analyzed_at) : 'recently'}
                      </span>
                      <span>•</span>
                      <span className="text-blue-600">Analyzed with Voice Profile</span>
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
                          Re-analyze DNA
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
                            className="p-4 rounded-lg border border-[hsl(220,13%,88%)] bg-[hsl(210,20%,98%)] relative group"
                          >
                            {editingPillarIndex === idx && editingPillarData ? (
                              // Inline editing mode
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1 block">Pillar Name</Label>
                                  <Input
                                    value={editingPillarData.name}
                                    onChange={(e) => setEditingPillarData({ ...editingPillarData, name: e.target.value })}
                                    className="font-medium"
                                    placeholder="Pillar name..."
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                                  <Textarea
                                    value={editingPillarData.description}
                                    onChange={(e) => setEditingPillarData({ ...editingPillarData, description: e.target.value })}
                                    className="text-sm min-h-[80px]"
                                    placeholder="Pillar description..."
                                  />
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    onClick={handleSavePillarEdit}
                                    disabled={isSaving}
                                    className="bg-[hsl(173,58%,39%)] hover:bg-[hsl(173,58%,34%)]"
                                  >
                                    {isSaving ? (
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                      <Save className="w-3 h-3 mr-1" />
                                    )}
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelPillarEdit}
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // Display mode
                              <>
                                {isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                                    onClick={() => handleStartPillarEdit(idx, pillar)}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                <h4 className="font-medium text-[hsl(222,47%,11%)] mb-1 pr-8">{pillar.name}</h4>
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
                              </>
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[hsl(222,47%,11%)]">Custom Brand Guidelines</CardTitle>
                    <CardDescription>
                      {isAdmin 
                        ? 'Add specific instructions, rules, and guidelines for AI-generated messages. These will be applied alongside the Content DNA analysis.'
                        : 'View the brand guidelines that admins have set for AI-generated messages.'}
                    </CardDescription>
                  </div>
                  {/* Active indicator when instructions are saved */}
                  {analysis?.custom_instructions && analysis.custom_instructions.trim() && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Applied to AI
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status banner when guidelines are active */}
                {analysis?.custom_instructions && analysis.custom_instructions.trim() && (
                  <Alert className="border-emerald-200 bg-emerald-50">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-700 ml-2">
                      Your custom guidelines are active and will be applied to all AI-generated content.
                    </AlertDescription>
                  </Alert>
                )}
                
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
                
                {/* Show saved guidelines if they differ from current input */}
                {analysis?.custom_instructions && analysis.custom_instructions.trim() && 
                  customInstructions !== analysis.custom_instructions && (
                  <div className="p-3 rounded-lg border border-border bg-muted/30">
                    <Label className="text-xs text-muted-foreground mb-2 block">Last Saved Guidelines:</Label>
                    <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-6">
                      {analysis.custom_instructions}
                    </p>
                  </div>
                )}
                
                {/* Always show saved content summary when guidelines exist */}
                {analysis?.custom_instructions && analysis.custom_instructions.trim() && 
                  customInstructions === analysis.custom_instructions && (
                  <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <Label className="text-xs font-medium text-emerald-700">Saved Guidelines</Label>
                    </div>
                    <p className="text-xs text-emerald-600">
                      {analysis.custom_instructions.split('\n').filter(Boolean).length} guideline(s) • 
                      {' '}{analysis.custom_instructions.length} characters
                    </p>
                  </div>
                )}
                
                {isAdmin && (
                  <div className="flex items-center justify-between">
                    {/* Unsaved changes indicator */}
                    {customInstructions !== (analysis?.custom_instructions || '') && (
                      <span className="text-sm text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Unsaved changes
                      </span>
                    )}
                    <div className="flex-1" />
                    <Button
                      onClick={handleSaveInstructions}
                      disabled={isSaving || customInstructions === (analysis?.custom_instructions || '')}
                      className="bg-[hsl(222,47%,14%)] hover:bg-[hsl(222,47%,20%)]"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Guidelines
                        </>
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
                    <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-2 ${libraryViewMode === 'card' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => toggleLibraryViewMode('card')}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-2 ${libraryViewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => toggleLibraryViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {samples.length} samples
                    </Badge>
                    {/* Semantic Extraction Stats */}
                    {samples.length > 0 && extractionStats.pending > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
                        <AlertCircle className="w-3 h-3" />
                        {extractionStats.pending} pending
                      </Badge>
                    )}
                    {samples.length > 0 && extractionStats.completed > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {extractionStats.completed} indexed
                      </Badge>
                    )}
                    {isAdmin && samples.length > 0 && extractionStats.pending > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => extractSemantics()}
                            disabled={isExtracting}
                            variant="outline"
                            size="sm"
                            className="border-amber-300 text-amber-700 hover:bg-amber-50"
                          >
                            {isExtracting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Indexing...
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4 mr-2" />
                                Index for Search
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <p>Extracts key themes and summaries from your content samples to enable intelligent search and context-aware DNA refinement.</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
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
                            Re-analyze DNA
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Inline Upload Panel */}
                <Collapsible open={libraryUploadOpen} onOpenChange={setLibraryUploadOpen} className="mb-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add New Content
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${libraryUploadOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-4">
                      {/* Upload tabs - File or Text */}
                      <Tabs defaultValue="file" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="file" className="text-sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload File
                          </TabsTrigger>
                          <TabsTrigger value="text" className="text-sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Paste Text
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="file" className="space-y-4">
                          {/* File Upload Area */}
                          {!libraryStagedFile ? (
                            <div
                              className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                              onClick={() => libraryFileInputRef.current?.click()}
                            >
                              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PDF, Word, TXT, Markdown, or Images (max 20MB)
                              </p>
                              <input
                                ref={libraryFileInputRef}
                                type="file"
                                accept={getAcceptString()}
                                onChange={handleLibraryFileSelect}
                                className="hidden"
                              />
                            </div>
                          ) : (
                            <div className="border border-border rounded-lg p-4 bg-background">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <div className="p-2 bg-muted rounded">
                                    <FileText className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">{libraryStagedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {(libraryStagedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                    {libraryIsExtractingFile && (
                                      <div className="flex items-center gap-2 mt-1 text-primary">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span className="text-xs">Extracting text...</span>
                                      </div>
                                    )}
                                    {libraryStagedFileError && (
                                      <p className="text-xs text-destructive mt-1">{libraryStagedFileError}</p>
                                    )}
                                    {libraryStagedFileText && (
                                      <p className="text-xs text-secondary mt-1">
                                        ✓ {libraryStagedFileText.length.toLocaleString()} characters extracted
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleLibraryClearStagedFile}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Metadata Fields for File */}
                          {libraryStagedFile && (
                            <div className="grid gap-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor="library-sample-title" className="text-xs">Title</Label>
                                  <Input
                                    id="library-sample-title"
                                    value={librarySampleTitle}
                                    onChange={(e) => setLibrarySampleTitle(e.target.value)}
                                    placeholder="e.g., Welcome Email 2024"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="library-sample-type" className="text-xs">Content Type</Label>
                                  <Select value={librarySampleType} onValueChange={setLibrarySampleType}>
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(
                                        SAMPLE_TYPES.reduce((acc, type) => {
                                          if (!acc[type.category]) acc[type.category] = [];
                                          acc[type.category].push(type);
                                          return acc;
                                        }, {} as Record<string, typeof SAMPLE_TYPES>)
                                      ).map(([category, types]) => (
                                        <SelectGroup key={category}>
                                          <SelectLabel>{category}</SelectLabel>
                                          {types.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                              {type.label}
                                            </SelectItem>
                                          ))}
                                        </SelectGroup>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="library-source-desc" className="text-xs">Source Description (optional)</Label>
                                <Input
                                  id="library-source-desc"
                                  value={librarySourceDescription}
                                  onChange={(e) => setLibrarySourceDescription(e.target.value)}
                                  placeholder="e.g., Sent to admitted students Fall 2024"
                                  className="mt-1"
                                />
                              </div>
                              <Button
                                onClick={handleLibraryAddStagedFile}
                                disabled={!libraryStagedFileText || libraryIsUploading}
                                className="w-full bg-secondary hover:bg-secondary/90"
                              >
                                {libraryIsUploading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add to Library
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="text" className="space-y-4">
                          <div>
                            <Textarea
                              value={libraryTextInput}
                              onChange={(e) => {
                                setLibraryTextInput(e.target.value);
                                handleTextInputChange(e.target.value, setLibrarySampleType);
                              }}
                              placeholder="Paste your content here..."
                              className="min-h-[120px]"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {libraryTextInput.length} characters
                            </p>
                          </div>

                          {libraryTextInput.trim() && (
                            <div className="grid gap-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor="library-text-title" className="text-xs">Title</Label>
                                  <Input
                                    id="library-text-title"
                                    value={librarySampleTitle}
                                    onChange={(e) => setLibrarySampleTitle(e.target.value)}
                                    placeholder="e.g., Welcome Email 2024"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="library-text-type" className="text-xs">Content Type</Label>
                                  <Select value={librarySampleType} onValueChange={setLibrarySampleType}>
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(
                                        SAMPLE_TYPES.reduce((acc, type) => {
                                          if (!acc[type.category]) acc[type.category] = [];
                                          acc[type.category].push(type);
                                          return acc;
                                        }, {} as Record<string, typeof SAMPLE_TYPES>)
                                      ).map(([category, types]) => (
                                        <SelectGroup key={category}>
                                          <SelectLabel>{category}</SelectLabel>
                                          {types.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                              {type.label}
                                            </SelectItem>
                                          ))}
                                        </SelectGroup>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="library-text-source" className="text-xs">Source Description (optional)</Label>
                                <Input
                                  id="library-text-source"
                                  value={librarySourceDescription}
                                  onChange={(e) => setLibrarySourceDescription(e.target.value)}
                                  placeholder="e.g., President's welcome message"
                                  className="mt-1"
                                />
                              </div>
                              <Button
                                onClick={handleLibraryTextSubmit}
                                disabled={libraryTextInput.length < 20 || libraryIsUploading}
                                className="w-full bg-secondary hover:bg-secondary/90"
                              >
                                {libraryIsUploading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add to Library
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Search Bar */}
                {extractionStats.completed > 0 && (
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          placeholder="Search indexed samples by themes, keywords, or content..."
                          className="pl-9"
                        />
                      </div>
                      <Button
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        variant="outline"
                      >
                        {isSearching ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Search'
                        )}
                      </Button>
                      {hasSearched && (
                        <Button variant="ghost" onClick={clearSearch}>
                          Clear
                        </Button>
                      )}
                    </div>
                    {hasSearched && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Found {searchResults.length} matching sample{searchResults.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}

                {samples.length === 0 ? (
                  <div className="text-center py-12 text-[hsl(220,14%,46%)]">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No content samples yet</p>
                    <p className="text-sm">Upload content using the Upload Content tab to start building your Content DNA profile</p>
                  </div>
                ) : hasSearched && searchResults.length > 0 ? (
                  /* Search Results View */
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="p-4 border border-blue-200 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-[hsl(222,47%,11%)] truncate">
                                  {result.title || 'Untitled'}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {SAMPLE_TYPES.find(t => t.value === result.sample_type)?.label || result.sample_type}
                                </Badge>
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                  Score: {(result.relevance_score * 100).toFixed(0)}%
                                </Badge>
                              </div>
                              {result.semantic_summary && (
                                <p className="text-sm text-[hsl(220,14%,46%)] mb-2 line-clamp-2">
                                  {result.semantic_summary}
                                </p>
                              )}
                              {result.key_themes && result.key_themes.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {result.key_themes.slice(0, 5).map((theme: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700">
                                      {theme}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : hasSearched && searchResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No matching samples found</p>
                    <p className="text-sm">Try different keywords or themes</p>
                  </div>
                ) : libraryViewMode === 'card' ? (
                  /* Card View */
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {samples.map((sample) => {
                        const isOwnSample = sample.user_id === profile?.id;
                        const canDelete = isOwnSample || isAdmin;
                        const canEdit = isOwnSample || isAdmin;
                        const isEditing = editingSampleId === sample.id;
                        
                        return (
                          <div
                            key={sample.id}
                            className={`p-4 border rounded-lg transition-colors ${
                              isEditing 
                                ? 'border-primary bg-primary/5' 
                                : 'border-[hsl(220,13%,88%)] bg-white hover:bg-[hsl(210,20%,98%)]'
                            }`}
                          >
                            {isEditing && editingSampleData ? (
                              /* Edit Mode */
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Title</Label>
                                    <Input
                                      value={editingSampleData.title}
                                      onChange={(e) => setEditingSampleData({
                                        ...editingSampleData,
                                        title: e.target.value
                                      })}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Content Type</Label>
                                    <Select 
                                      value={editingSampleData.sample_type} 
                                      onValueChange={(value) => setEditingSampleData({
                                        ...editingSampleData,
                                        sample_type: value
                                      })}
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.entries(
                                          SAMPLE_TYPES.reduce((acc, type) => {
                                            if (!acc[type.category]) acc[type.category] = [];
                                            acc[type.category].push(type);
                                            return acc;
                                          }, {} as Record<string, typeof SAMPLE_TYPES>)
                                        ).map(([category, types]) => (
                                          <SelectGroup key={category}>
                                            <SelectLabel>{category}</SelectLabel>
                                            {types.map((type) => (
                                              <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                              </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs">Source Description</Label>
                                  <Input
                                    value={editingSampleData.source_description}
                                    onChange={(e) => setEditingSampleData({
                                      ...editingSampleData,
                                      source_description: e.target.value
                                    })}
                                    placeholder="e.g., President's welcome message"
                                    className="mt-1"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    className="bg-secondary hover:bg-secondary/90"
                                  >
                                    <Save className="w-3 h-3 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              /* View Mode */
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
                                    {/* Extraction status */}
                                    {sample.extraction_status === 'completed' ? (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Indexed
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs text-xs">Searchable for DNA refinement</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : sample.extraction_status === 'failed' ? (
                                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                        <X className="w-3 h-3 mr-1" />
                                        Failed
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Pending
                                      </Badge>
                                    )}
                                  </div>
                                  {sample.source_description && (
                                    <p className="text-sm text-[hsl(220,14%,46%)] mb-2">
                                      {sample.source_description}
                                    </p>
                                  )}
                                  <p className="text-sm text-[hsl(220,14%,46%)] line-clamp-2">
                                    {sample.content_text?.substring(0, 200)}...
                                  </p>
                                  {/* Key themes display for indexed samples */}
                                  {sample.extraction_status === 'completed' && sample.key_themes && sample.key_themes.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {sample.key_themes.slice(0, 5).map((theme, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                                          {theme}
                                        </Badge>
                                      ))}
                                      {sample.key_themes.length > 5 && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                          +{sample.key_themes.length - 5}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
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
                                <div className="flex items-center gap-1">
                                  {canEdit && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-muted-foreground hover:text-foreground"
                                          onClick={() => handleStartEdit(sample)}
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit metadata</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
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
                            )}
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
                          <TableHead>Status</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="w-[80px]">Size</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {samples.map((sample) => {
                          const isOwnSample = sample.user_id === profile?.id;
                          const canDelete = isOwnSample || isAdmin;
                          const canEdit = isOwnSample || isAdmin;
                          
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
                                {sample.extraction_status === 'completed' ? (
                                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Indexed
                                  </Badge>
                                ) : sample.extraction_status === 'failed' ? (
                                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                    Failed
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">
                                    Pending
                                  </Badge>
                                )}
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
                                <div className="flex items-center gap-1">
                                  {canEdit && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                          onClick={() => handleStartEdit(sample)}
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit metadata</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
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
                                </div>
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

          {/* Refine DNA Tab */}
          <TabsContent value="refine">
            <Card className="border-[hsl(220,13%,88%)]">
              <CardHeader>
                <CardTitle className="text-[hsl(222,47%,11%)] flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Tune Your Content DNA
                </CardTitle>
                <CardDescription>
                  Fine-tune specific aspects of your voice without changing the core DNA derived from your samples
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!analysis?.voice_analysis ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Dna className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No Content DNA analyzed yet</p>
                    <p className="text-sm">Upload content samples and analyze them first to use tuning features</p>
                  </div>
                ) : (
                  <DNATuningControls
                    voiceAnalysis={analysis.voice_analysis}
                    existingAdjustments={adjustments}
                    onSave={handleSaveAdjustments}
                    isLoading={isSavingAdjustments}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <ContentDNAVersionHistory 
              contentDnaId={analysis?.id} 
              profileId={profileIdFromUrl}
              onRestore={() => {
                // Refresh the analysis data after restore
                window.location.reload();
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
