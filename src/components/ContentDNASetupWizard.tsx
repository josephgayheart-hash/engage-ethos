import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePIIScanner } from '@/hooks/usePIIScanner';
import { useAuth } from '@/contexts/AuthContext';
import { useContentDNA } from '@/hooks/useContentDNA';
import { useInstitutionalProfiles } from '@/hooks/useInstitutionalProfiles';
import { extractTextFromFile, getAcceptString } from '@/lib/documentParser';
import {
  Dna,
  Upload,
  FileText,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  X,
  Building2,
  Target,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const SAMPLE_TYPES = [
  { value: 'email', label: 'Email', category: 'Core Communications' },
  { value: 'newsletter', label: 'Newsletter', category: 'Core Communications' },
  { value: 'news_story', label: 'News Story/Article', category: 'Public Relations' },
  { value: 'press_release', label: 'Press Release', category: 'Public Relations' },
  { value: 'speech', label: 'Speech/Remarks', category: 'Speeches & Events' },
  { value: 'social', label: 'Social Media Post', category: 'Digital' },
  { value: 'web_copy', label: 'Website Copy', category: 'Digital' },
  { value: 'marketing', label: 'Marketing Material', category: 'Marketing' },
  { value: 'brand_guidelines', label: 'Brand Guidelines', category: 'Brand' },
  { value: 'other', label: 'Other', category: 'Other' },
];

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: WizardStep[] = [
  {
    id: 'profile',
    title: 'Select Profile',
    description: 'Choose which institutional profile to configure',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: 'upload',
    title: 'Upload Samples',
    description: 'Add content samples that represent your voice',
    icon: <Upload className="w-5 h-5" />,
  },
  {
    id: 'instructions',
    title: 'Custom Instructions',
    description: 'Optional guidance for AI generation',
    icon: <Target className="w-5 h-5" />,
  },
  {
    id: 'analyze',
    title: 'Analyze DNA',
    description: 'Run unified voice and brand platform analysis',
    icon: <Sparkles className="w-5 h-5" />,
  },
];

interface ContentDNASetupWizardProps {
  initialProfileId?: string | null;
  onComplete: (profileId: string) => void;
  onCancel: () => void;
}

interface StagedSample {
  id: string;
  title: string;
  type: string;
  text: string;
  fileName: string;
}

export function ContentDNASetupWizard({ initialProfileId, onComplete, onCancel }: ContentDNASetupWizardProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profiles } = useInstitutionalProfiles();

  const [currentStep, setCurrentStep] = useState(initialProfileId ? 1 : 0);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(initialProfileId || null);

  // Upload state
  const [stagedSamples, setStagedSamples] = useState<StagedSample[]>([]);
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [sampleTitle, setSampleTitle] = useState('');
  const [sampleType, setSampleType] = useState('email');

  // Instructions state
  const [customInstructions, setCustomInstructions] = useState('');

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const {
    samples,
    analysis,
    addSample,
    analyzeVoice,
    updateCustomInstructions,
  } = useContentDNA({ profileId: selectedProfileId });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const { checkFile, checkText } = usePIIScanner();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (await checkFile(file)) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsExtractingFile(true);
    try {
      const { text, success, message } = await extractTextFromFile(file);
      if (!success || !text) {
        toast({ title: 'Cannot read file', description: message || 'Try a different format.', variant: 'destructive' });
        return;
      }

      const newSample: StagedSample = {
        id: crypto.randomUUID(),
        title: sampleTitle || file.name.replace(/\.[^/.]+$/, ''),
        type: sampleType,
        text,
        fileName: file.name,
      };
      setStagedSamples(prev => [...prev, newSample]);
      setSampleTitle('');
      toast({ title: 'Sample staged', description: `"${newSample.title}" ready to upload.` });
    } catch {
      toast({ title: 'Error reading file', variant: 'destructive' });
    } finally {
      setIsExtractingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddText = () => {
    if (!textInput.trim()) return;
    if (checkText(textInput)) return;
    const newSample: StagedSample = {
      id: crypto.randomUUID(),
      title: sampleTitle || `${SAMPLE_TYPES.find(t => t.value === sampleType)?.label || 'Content'} Sample`,
      type: sampleType,
      text: textInput,
      fileName: `Pasted - ${new Date().toLocaleDateString()}`,
    };
    setStagedSamples(prev => [...prev, newSample]);
    setTextInput('');
    setSampleTitle('');
  };

  const removeStagedSample = (id: string) => {
    setStagedSamples(prev => prev.filter(s => s.id !== id));
  };

  const handleUploadAll = async () => {
    for (const sample of stagedSamples) {
      await addSample(sample.text, sample.fileName, {
        sampleType: sample.type,
        title: sample.title,
      });
    }
    setStagedSamples([]);
    toast({ title: `${stagedSamples.length} samples uploaded` });
  };

  const handleAnalyze = async () => {
    if (customInstructions.trim()) {
      await updateCustomInstructions(customInstructions);
    }
    setIsAnalyzing(true);
    try {
      await analyzeVoice();
      setAnalysisComplete(true);
      toast({ title: 'Content DNA analyzed!', description: 'Voice profile and brand platform extracted.' });
    } catch {
      toast({ title: 'Analysis failed', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalSamples = samples.length + stagedSamples.length;
  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!selectedProfileId;
      case 1: return totalSamples >= 1;
      case 2: return true;
      case 3: return analysisComplete;
      default: return true;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1 && stagedSamples.length > 0) {
      await handleUploadAll();
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</span>
          <span className="font-medium">{STEPS[currentStep].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between">
          {STEPS.map((step, i) => (
            <div key={step.id} className={cn("flex items-center gap-1.5 text-xs", i <= currentStep ? "text-primary" : "text-muted-foreground")}>
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border", i < currentStep ? "bg-primary text-primary-foreground border-primary" : i === currentStep ? "border-primary text-primary" : "border-muted-foreground/30")}>
                {i < currentStep ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-1">Select Institutional Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Content DNA is scoped to a specific institutional profile. Choose which one to set up.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedProfileId === p.id ? "ring-2 ring-primary border-primary bg-primary/5" : "hover:border-primary/40"
                    )}
                    onClick={() => setSelectedProfileId(p.id)}
                  >
                    {p.config.logoUrl ? (
                      <img src={p.config.logoUrl} alt="" className="w-10 h-10 rounded border object-contain bg-white p-0.5" />
                    ) : (
                      <div className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: p.config.primaryColor || '#1F2A44' }}>
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.config.institutionAbbreviation || p.profileType}</p>
                    </div>
                    {selectedProfileId === p.id && <Check className="w-5 h-5 text-primary shrink-0" />}
                  </div>
                ))}
              </div>
              {profiles.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No profiles found. Create one first.</p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/university-settings?tab=profiles')}>
                    Create Profile
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <h3 className="text-lg font-semibold mb-1">Upload Content Samples</h3>
                <p className="text-sm text-muted-foreground">
                  Add examples of your best communications — emails, newsletters, press releases, speeches, etc.
                  <br />Upload at least 3-5 diverse samples for the best analysis.
                </p>
              </div>

              {/* File upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Upload a Document</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Sample title (optional)"
                      value={sampleTitle}
                      onChange={(e) => setSampleTitle(e.target.value)}
                    />
                    <Select value={sampleType} onValueChange={setSampleType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {SAMPLE_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                      {isExtractingFile ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Choose file (PDF, DOCX, TXT, etc.)</span>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={getAcceptString()}
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={isExtractingFile}
                      />
                    </label>
                  </div>
                </div>

                {/* Paste text */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Or Paste Content</Label>
                  <Textarea
                    placeholder="Paste an email, newsletter, or any communication sample..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={6}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddText}
                    disabled={!textInput.trim()}
                    className="w-full"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Stage Sample
                  </Button>
                </div>
              </div>

              {/* Staged + existing samples */}
              {(stagedSamples.length > 0 || samples.length > 0) && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Samples ({totalSamples})
                  </Label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-lg border p-2">
                    {stagedSamples.map(s => (
                      <div key={s.id} className="flex items-center gap-2 text-sm p-1.5 rounded bg-amber-50 border border-amber-200">
                        <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="flex-1 truncate">{s.title}</span>
                        <Badge variant="outline" className="text-[10px] h-4">{SAMPLE_TYPES.find(t => t.value === s.type)?.label || s.type}</Badge>
                        <Badge className="text-[10px] h-4 bg-amber-100 text-amber-700">Staged</Badge>
                        <button onClick={() => removeStagedSample(s.id)} className="text-muted-foreground hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {samples.map(s => (
                      <div key={s.id} className="flex items-center gap-2 text-sm p-1.5 rounded">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate">{s.title || s.file_name}</span>
                        <Badge variant="outline" className="text-[10px] h-4">{SAMPLE_TYPES.find(t => t.value === s.sample_type)?.label || s.sample_type}</Badge>
                        <Badge variant="secondary" className="text-[10px] h-4">Saved</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="text-center mb-2">
                <h3 className="text-lg font-semibold mb-1">Custom Instructions (Optional)</h3>
                <p className="text-sm text-muted-foreground">
                  Provide any additional guidance for how AI should generate content for {selectedProfile?.name || 'this profile'}.
                </p>
              </div>
              <Textarea
                placeholder="e.g., Always use 'students' instead of 'learners'. Avoid passive voice. Our brand voice is warm but authoritative..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={8}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                These instructions supplement the voice analysis — use them for rules the AI can't easily infer from samples.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 text-center max-w-lg mx-auto">
              <div>
                <h3 className="text-lg font-semibold mb-1">Analyze Content DNA</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI will analyze your {samples.length} sample{samples.length !== 1 ? 's' : ''} in a single unified pass to extract both your voice profile and brand platform.
                </p>
              </div>

              {!analysisComplete ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-left space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Dna className="w-4 h-4 text-primary" />
                      What the analysis extracts:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                      <li>Voice Profile — tone, formality, vocabulary patterns</li>
                      <li>Brand Promise — your core value proposition</li>
                      <li>Brand Pillars — key messaging themes</li>
                      <li>Pathways — strategic communication approaches</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || samples.length === 0}
                    size="lg"
                    className="gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze Content DNA
                      </>
                    )}
                  </Button>
                  {samples.length === 0 && (
                    <p className="text-xs text-amber-600">
                      Go back and upload at least one sample first.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <CheckCircle2 className="w-8 h-8" />
                    <span className="text-lg font-semibold">Analysis Complete!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your Content DNA has been extracted and will be applied to all AI-generated content for {selectedProfile?.name || 'this profile'}.
                  </p>
                  <Button onClick={() => onComplete(selectedProfileId!)} size="lg" className="gap-2">
                    <Check className="w-4 h-4" />
                    Finish Setup
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {!(currentStep === 3 && analysisComplete) && (
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={currentStep === 0 ? onCancel : () => setCurrentStep(prev => prev - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep < 3 && (
            <Button onClick={handleNext} disabled={!canProceed()}>
              {currentStep === 1 && stagedSamples.length > 0 ? 'Upload & Continue' : 'Continue'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
