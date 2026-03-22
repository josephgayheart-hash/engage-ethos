import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { WaveBackground } from "@/components/WaveBackground";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/contexts/AuthContext";
import { useIndustry } from "@/contexts/IndustryContext";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon, Download, RefreshCw, Loader2, Sparkles, Palette, Camera, Users, Target, Eye, Image, ExternalLink, PaintBucket, Maximize2, FolderPlus, Library, ChevronDown, Trash2, ZoomIn, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "react-router-dom";
import { ChannelMockup } from "@/components/image-generator/ChannelMockup";
import { BrandOverlayEditor } from "@/components/image-generator/BrandOverlayEditor";
import { useCampusPhotoCount } from "@/hooks/useCampusPhotoCount";
import { useDesignReferences } from "@/hooks/useDesignReferences";
import { Dna, CheckCircle2, AlertCircle } from "lucide-react";
import { AIResultsGuidance } from "@/components/AIResultsGuidance";
import { useUserDrafts } from "@/hooks/useUserDrafts";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { SaveToLibraryDialog } from "@/components/library/SaveToLibraryDialog";
import { toast } from "sonner";

const channelOptions = [
  // Social
  { value: "_social", label: "── Social ──", disabled: true },
  { value: "social-media", label: "Social Media Post (1:1)" },
  { value: "digital-ad-social", label: "Social Ad (1:1)" },
  { value: "story", label: "Story — IG / FB / Snapchat (9:16)" },
  // Digital
  { value: "_digital", label: "── Digital ──", disabled: true },
  { value: "email", label: "Email Header (16:9)" },
  { value: "landing-page", label: "Landing Page Hero (16:9)" },
  { value: "web-banner", label: "Web Banner (3:1)" },
  { value: "digital-signage", label: "Digital Signage (16:9)" },
  { value: "youtube-thumbnail", label: "YouTube Thumbnail (16:9)" },
  { value: "linkedin-banner", label: "LinkedIn Banner (4:1)" },
  { value: "facebook-cover", label: "Facebook Cover (2.63:1)" },
  { value: "portal-banner", label: "Portal / App Banner (3:1)" },
  { value: "presentation-slide", label: "Presentation Slide (16:9)" },
  // Print
  { value: "_print", label: "── Print ──", disabled: true },
  { value: "direct-mail", label: "Direct Mail Postcard (4:3)" },
  { value: "event-flyer", label: "Event Flyer / Poster (4:5)" },
  { value: "print-ad", label: "Print Ad (8.5×11)" },
  { value: "viewbook", label: "Viewbook / Brochure (4:3)" },
  { value: "donor-report", label: "Donor / Annual Report (8.5×11)" },
  // Messaging
  { value: "_messaging", label: "── Messaging ──", disabled: true },
  { value: "mms", label: "MMS / Text Message (1:1)" },
  { value: "news-article", label: "News Article Featured (16:9)" },
];

const toneOptions = [
  "Warm & Welcoming", "Bold & Energizing", "Prestigious & Scholarly",
  "Conversational & Friendly", "Inspiring & Aspirational", "Professional & Polished",
];

const audienceOptions = [
  "Prospective Students", "Current Students", "Parents & Families",
  "Alumni", "Donors", "Faculty & Staff", "Community",
];

const engineOptions = [
  { value: "fast", label: "Fast", description: "Quick generation, good quality" },
  { value: "premium", label: "Premium", description: "Slower, highest quality & realism" },
];

const styleOptions = [
  { value: "photorealistic", label: "Photorealistic", description: "Editorial campus photography" },
  { value: "cinematic", label: "Cinematic", description: "Dramatic lighting, film-like depth" },
  { value: "illustrated", label: "Illustrated", description: "Stylized graphic illustration" },
  { value: "watercolor", label: "Watercolor", description: "Soft, artistic watercolor style" },
  { value: "minimal", label: "Minimal / Flat", description: "Clean, modern flat design" },
];

const designStyleOptions = [
  { value: "bold-geometric", label: "Bold & Geometric" },
  { value: "gradient-flow", label: "Gradient Flow" },
  { value: "typographic-poster", label: "Typographic Poster" },
  { value: "abstract-minimal", label: "Abstract Minimal" },
];

const colorMoodOptions = [
  { value: "brand-colors", label: "Brand Colors" },
  { value: "warm", label: "Warm" },
  { value: "cool", label: "Cool" },
  { value: "monochrome", label: "Mono" },
];

const typographyStyleOptions = [
  { value: "sans-serif-modern", label: "Sans-Serif" },
  { value: "serif-classic", label: "Serif" },
  { value: "display-decorative", label: "Display" },
];

const layoutDensityOptions = [
  { value: "spacious", label: "Spacious / Breathable" },
  { value: "balanced", label: "Balanced" },
  { value: "dense", label: "Dense / Packed" },
];

const ImageGeneratorPage = () => {
  const { profile, user } = useAuth();
  const tenantId = profile?.tenant_id;
  const { profiles } = useInstitutionalProfiles();
  const location = useLocation();

  const [contentDescription, setContentDescription] = useState("");
  const [channel, setChannel] = useState("social-media");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [goal, setGoal] = useState("");
  const [engine, setEngine] = useState("fast");
  const [style, setStyle] = useState("photorealistic");
  const [creationMode, setCreationMode] = useState<"photo" | "graphic-design">("photo");
  const [designStyle, setDesignStyle] = useState("bold-geometric");
  const [colorMood, setColorMood] = useState("brand-colors");
  const [typographyStyle, setTypographyStyle] = useState("sans-serif-modern");
  const [layoutDensity, setLayoutDensity] = useState("balanced");
  const [reserveLogoSpace, setReserveLogoSpace] = useState(false);
  const [renderAiTextCta, setRenderAiTextCta] = useState(true);
  const [styleReferenceUrl, setStyleReferenceUrl] = useState<string | null>(null);
  const [isUploadingRef, setIsUploadingRef] = useState(false);
  const styleRefInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState(0);
  const [viewMode, setViewMode] = useState<"raw" | "mockup" | "overlay">("mockup");
  const [blankCanvasMode, setBlankCanvasMode] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { campusPhotoCount } = useCampusPhotoCount(selectedProfileId || null);
  const { references: designRefs } = useDesignReferences({ profileId: selectedProfileId || null });
  const designRefCount = designRefs?.length || 0;
  const { saveDraft, loadDraftById } = useUserDrafts();
  const { addMessage } = useMessageLibrary();
  const { addTemplate } = useSharedLibrary();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveDialogType, setSaveDialogType] = useState<'personal' | 'shared'>('personal');

  // Resume draft from navigation (e.g. dashboard "My Drafts" card)
  useEffect(() => {
    const resumeDraftId = (location.state as { resumeDraftId?: string })?.resumeDraftId;
    if (!resumeDraftId) return;

    loadDraftById(resumeDraftId).then(draft => {
      if (!draft) return;
      const d = draft.draft_data as Record<string, any>;
      if (d.contentDescription) setContentDescription(d.contentDescription);
      if (d.channel) setChannel(d.channel);
      if (d.audience) setAudience(d.audience);
      if (d.tone) setTone(d.tone);
      if (d.goal) setGoal(d.goal);
      if (d.style) setStyle(d.style);
      if (d.engine) setEngine(d.engine);
      if (d.imageUrl) setImageUrl(d.imageUrl);
      if (d.profileId) setSelectedProfileId(d.profileId);
    });
  }, [location.state]);

  // Extract brand info from selected profile
  const selectedProfile = profiles?.find(p => p.id === selectedProfileId);
  const profileConfig = selectedProfile?.config as Record<string, any> | undefined;
  const APP_DEFAULT_COLORS = ["#1f2a44", "#2c7a7b"];
  const isRealColor = (c: unknown): c is string => typeof c === 'string' && c.length > 0 && !APP_DEFAULT_COLORS.includes(c.trim().toLowerCase());
  const brandColors = [profileConfig?.primaryColor, profileConfig?.secondaryColor, profileConfig?.tertiaryColor, profileConfig?.accentColor].filter(isRealColor) as string[];
  const profileLogoUrl = profileConfig?.logoUrl as string | undefined;
  const profileLogoUrls = [profileConfig?.logoUrl, profileConfig?.logoUrlSecondary, profileConfig?.logoUrlAthletic, profileConfig?.logoUrlPresidential].filter(Boolean) as string[];
  const profileInstitutionName = selectedProfile?.name || profileConfig?.institutionName as string | undefined;

  const handleGenerate = useCallback(async () => {
    if (!contentDescription.trim()) {
      toast.error("Please describe what the image should depict.");
      return;
    }
    setIsGenerating(true);
    setImageUrl(null);
    setGenerationPhase(0);
    const phaseInterval = setInterval(() => {
      setGenerationPhase(prev => prev < 4 ? prev + 1 : prev);
    }, engine === "premium" ? 6000 : 1200);
    try {
          const effectiveStyle = creationMode === "graphic-design" ? "graphic-design" : style;
          const { data, error } = await supabase.functions.invoke("generate-channel-image", {
            body: {
              channel,
              contentSummary: contentDescription,
              audience: audience || undefined,
              tenantId,
              profileId: selectedProfileId || undefined,
              goal: goal || undefined,
              tone: tone || undefined,
              engine: engine || "fast",
              imageStyle: effectiveStyle,
              ...(creationMode === "graphic-design" && {
                designStyle,
                colorMood,
                typographyStyle,
                layoutDensity,
                reserveLogoSpace,
                renderAiTextCta,
                styleReferenceUrl: styleReferenceUrl || undefined,
              }),
            },
          });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
        // Keep first render in "In Context" preview; user can manually switch to Brand It
        setViewMode("mockup");
        toast.success("Image generated successfully!");
        // Auto-save as image draft
        saveDraft('image' as any, {
          contentDescription,
          channel,
          audience,
          tone,
          goal,
          style,
          engine,
          imageUrl: data.imageUrl,
          profileId: selectedProfileId,
          profileName: profileInstitutionName,
        }, `${profileInstitutionName || 'Image'} — ${channel}`, undefined, true);
      } else {
        toast.error("No image was returned.");
      }
    } catch (err: any) {
      console.error("Image generation failed:", err);
      toast.error(err?.message || "Failed to generate image. Try again.");
    } finally {
      clearInterval(phaseInterval);
      setIsGenerating(false);
    }
  }, [contentDescription, channel, audience, tenantId, selectedProfileId, goal, tone, engine, style, creationMode, designStyle, colorMood, typographyStyle, layoutDensity, reserveLogoSpace, renderAiTextCta]);

  const handleDownload = async (format: 'png' | 'jpg' | 'pdf' = 'png') => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      if (format === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = URL.createObjectURL(blob);
        await new Promise<void>((resolve) => { img.onload = () => resolve(); });
        const orientation = img.width > img.height ? 'l' : 'p';
        const pdf = new jsPDF(orientation as any, 'px', [img.width, img.height]);
        pdf.addImage(img, 'PNG', 0, 0, img.width, img.height);
        pdf.save(`campus-image-${channel}-${Date.now()}.pdf`);
        URL.revokeObjectURL(img.src);
      } else {
        // Convert to desired format via canvas
        const imgEl = new window.Image();
        imgEl.crossOrigin = 'anonymous';
        imgEl.src = URL.createObjectURL(blob);
        await new Promise<void>((resolve) => { imgEl.onload = () => resolve(); });
        const canvas = document.createElement('canvas');
        canvas.width = imgEl.width;
        canvas.height = imgEl.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(imgEl, 0, 0);
        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, 0.95);
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `campus-image-${channel}-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(imgEl.src);
      }
      toast.success(`Image downloaded as ${format.toUpperCase()}!`);
    } catch {
      toast.error("Download failed.");
    }
  };

  const handleSaveToLibrary = useCallback(async (name: string): Promise<string | undefined> => {
    if (!imageUrl) return undefined;
    const result = await addMessage({
      title: name,
      content: `![Generated Image](${imageUrl})`,
      channel: (channel as any) || 'social-media',
      mode: 'generated',
      source: 'image-studio' as any,
      approved: false,
      audience: audience as any,
      tone: tone as any,
      goal: goal as any,
      notes: contentDescription || undefined,
      institutionalProfileId: selectedProfileId || undefined,
      institutionalProfileName: profileInstitutionName,
      coverImageUrl: imageUrl,
      tags: ['image', channel].filter(Boolean),
    });
    return result?.id;
  }, [imageUrl, channel, audience, tone, goal, contentDescription, selectedProfileId, profileInstitutionName, addMessage]);

  const handleSaveToSharedLibrary = useCallback(async (name: string): Promise<string | undefined> => {
    if (!imageUrl || !profile) return undefined;
    const { data, error } = await supabase.from('shared_templates').insert({
      title: name,
      content: `![Generated Image](${imageUrl})`,
      cover_image_url: imageUrl,
      tenant_id: profile.tenant_id,
      created_by_user_id: user?.id || '',
      created_by_name: `${profile.first_name} ${profile.last_name}`,
      status: 'submitted',
      source: 'image-studio',
      institutional_profile_id: selectedProfileId || null,
      tags: ['image', channel].filter(Boolean),
      required_fields: { audience: audience ? [audience] : [], moment: [], channel: channel ? [channel] : ['social-media'] },
      metadata: { source: 'image-studio', sceneDescription: contentDescription, tone, goal },
    }).select('id').single();
    if (error) { toast.error('Failed to save to University Library.'); return undefined; }
    return data?.id;
  }, [imageUrl, channel, audience, tone, goal, contentDescription, selectedProfileId, profile, user]);

  return (
    <div className="bg-background">

      {/* Wave header */}
      <section className="relative pt-10 pb-16 overflow-hidden">
        <WaveBackground variant="teal" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <h1 className="font-serif text-2xl font-bold mb-1 flex items-center gap-2">
              <Palette className="w-6 h-6 text-primary" />
              Image Studio
            </h1>
            <p className="text-sm text-muted-foreground">
              Generate on-brand campus imagery using your institution's profile, colors, architecture, and identity.
              Images are always grounded in your institutional details — upload campus photos in Content DNA Studio for even greater visual accuracy.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Controls */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Image Settings</CardTitle>
                <CardDescription>
                  Describe your scene and select options. The generator uses your institutional profile for campus-accurate, brand-aligned imagery.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Creation Mode Toggle */}
                <div className="space-y-2">
                  <Label>Creation Mode</Label>
                  <ToggleGroup
                    type="single"
                    value={creationMode}
                    onValueChange={(val) => { if (val) setCreationMode(val as "photo" | "graphic-design"); }}
                    className="w-full justify-start"
                  >
                    <ToggleGroupItem value="photo" className="flex-1 gap-1.5" variant="outline">
                      <Camera className="w-4 h-4" />
                      Photo
                    </ToggleGroupItem>
                    <ToggleGroupItem value="graphic-design" className="flex-1 gap-1.5" variant="outline">
                      <Palette className="w-4 h-4" />
                      Graphic Design
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    {creationMode === "graphic-design" ? "Design Brief *" : "Scene Description *"}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={creationMode === "graphic-design"
                      ? "e.g. Open house event flyer with bold headline 'Discover Your Future' and event details — Saturday, April 12"
                      : "e.g. Students collaborating on a research project in a modern science lab during golden hour"
                    }
                    value={contentDescription}
                    onChange={(e) => setContentDescription(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {creationMode === "graphic-design"
                      ? "Describe the finished piece you want — headlines, event info, and the visual feel."
                      : "Describe the scene, activity, and mood you want captured."
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Format / Channel</Label>
                    <Select value={channel} onValueChange={setChannel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {channelOptions.map((opt) =>
                          (opt as any).disabled ? (
                            <div key={opt.value} className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider select-none">
                              {opt.label.replace(/─/g, '').trim()}
                            </div>
                          ) : (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Institutional Profile</Label>
                    <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select profile...">
                          {selectedProfileId && profiles?.find(p => p.id === selectedProfileId) && (() => {
                            const selected = profiles.find(p => p.id === selectedProfileId)!;
                            const logoUrl = (selected.config as any)?.logoUrl;
                            return (
                              <span className="flex items-center gap-2">
                                {logoUrl ? (
                                  <img src={logoUrl} alt="" className="w-5 h-5 rounded object-contain flex-shrink-0" />
                                ) : (
                                  <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
                                    {selected.name.charAt(0)}
                                  </span>
                                )}
                                <span className="truncate">{selected.name}</span>
                              </span>
                            );
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {profiles?.map((p) => {
                          const logoUrl = (p.config as any)?.logoUrl;
                          return (
                            <SelectItem key={p.id} value={p.id}>
                              <span className="flex items-center gap-2">
                                {logoUrl ? (
                                  <img src={logoUrl} alt="" className="w-5 h-5 rounded object-contain flex-shrink-0" />
                                ) : (
                                  <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
                                    {p.name.charAt(0)}
                                  </span>
                                )}
                                <span className="truncate">{p.name}</span>
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Engine</Label>
                    <Select value={engine} onValueChange={setEngine}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {engineOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label} — <span className="text-muted-foreground">{opt.description}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {creationMode === "photo" && (
                    <div className="space-y-2">
                      <Label>Style</Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {styleOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label} — <span className="text-muted-foreground">{opt.description}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Graphic Design sub-controls */}
                {creationMode === "graphic-design" && (
                  <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
                    {/* DNA confidence indicator */}
                    {designRefCount > 0 ? (
                      <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 rounded-md px-2.5 py-1.5 border border-primary/15">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span><strong>{designRefCount} design sample{designRefCount !== 1 ? 's' : ''}</strong> loaded — AI will match your brand style</span>
                      </div>
                    ) : (
                      <Link to="/admin/content-dna" className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5 border border-border hover:border-primary/30 transition-colors">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Add design samples in <strong>Content DNA</strong> for best results</span>
                      </Link>
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Style</Label>
                        <RadioGroup value={designStyle} onValueChange={setDesignStyle} className="space-y-0.5">
                          {designStyleOptions.map((opt) => (
                            <div key={opt.value} className="flex items-center gap-1.5">
                              <RadioGroupItem value={opt.value} id={`ds-${opt.value}`} className="h-3.5 w-3.5" />
                              <Label htmlFor={`ds-${opt.value}`} className="text-xs font-normal cursor-pointer leading-tight">{opt.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Typography</Label>
                        <RadioGroup value={typographyStyle} onValueChange={setTypographyStyle} className="space-y-0.5">
                          {typographyStyleOptions.map((opt) => (
                            <div key={opt.value} className="flex items-center gap-1.5">
                              <RadioGroupItem value={opt.value} id={`ts-${opt.value}`} className="h-3.5 w-3.5" />
                              <Label htmlFor={`ts-${opt.value}`} className="text-xs font-normal cursor-pointer leading-tight">{opt.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Color Mood</Label>
                        <div className="flex flex-wrap gap-1">
                          {colorMoodOptions.map((opt) => (
                            <Badge
                              key={opt.value}
                              variant={colorMood === opt.value ? "default" : "outline"}
                              className="cursor-pointer text-[10px] px-1.5 py-0"
                              onClick={() => setColorMood(opt.value)}
                            >
                              {opt.label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Density</Label>
                        <RadioGroup value={layoutDensity} onValueChange={setLayoutDensity} className="space-y-0.5">
                          {layoutDensityOptions.map((opt) => (
                            <div key={opt.value} className="flex items-center gap-1.5">
                              <RadioGroupItem value={opt.value} id={`ld-${opt.value}`} className="h-3.5 w-3.5" />
                              <Label htmlFor={`ld-${opt.value}`} className="text-xs font-normal cursor-pointer leading-tight">{opt.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Label htmlFor="reserve-logo" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
                        Reserve Space for Logo
                      </Label>
                      <Switch
                        id="reserve-logo"
                        checked={reserveLogoSpace}
                        onCheckedChange={setReserveLogoSpace}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Label htmlFor="render-ai-text" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
                        Render AI Text + CTA
                      </Label>
                      <Switch
                        id="render-ai-text"
                        checked={renderAiTextCta}
                        onCheckedChange={setRenderAiTextCta}
                      />
                    </div>

                    {/* Inline Style Reference */}
                    <div className="space-y-2 pt-1">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Style Reference (Optional)
                      </Label>
                      {styleReferenceUrl ? (
                        <div className="flex items-center gap-2">
                          <img src={styleReferenceUrl} alt="Style ref" className="w-12 h-12 rounded border object-cover" />
                          <span className="text-xs text-muted-foreground flex-1">Reference uploaded</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setStyleReferenceUrl(null)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          className="flex items-center gap-2 w-full p-2 border border-dashed rounded text-xs text-muted-foreground hover:border-primary/50 transition-colors"
                          onClick={() => styleRefInputRef.current?.click()}
                          disabled={isUploadingRef}
                        >
                          {isUploadingRef ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                          Upload a design sample to match this style
                        </button>
                      )}
                      <input
                        ref={styleRefInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploadingRef(true);
                          try {
                            const ext = file.name.split('.').pop();
                            const path = `inline/${crypto.randomUUID()}.${ext}`;
                            const { error } = await supabase.storage.from('design-references').upload(path, file, { contentType: file.type });
                            if (error) throw error;
                            const { data } = supabase.storage.from('design-references').getPublicUrl(path);
                            setStyleReferenceUrl(data.publicUrl);
                          } catch (err) {
                            console.error(err);
                            toast.error('Failed to upload style reference');
                          } finally {
                            setIsUploadingRef(false);
                            if (styleRefInputRef.current) styleRefInputRef.current.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select value={audience} onValueChange={setAudience}>
                      <SelectTrigger><SelectValue placeholder="Optional..." /></SelectTrigger>
                      <SelectContent>
                        {audienceOptions.map((a) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger><SelectValue placeholder="Optional..." /></SelectTrigger>
                      <SelectContent>
                        {toneOptions.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Communication Goal</Label>
                  <Textarea
                    placeholder="e.g. Drive enrollment interest, celebrate alumni achievement..."
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !contentDescription.trim()}
                    className="flex-1"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>
                </div>

                {/* Blank Canvas shortcut — only in Graphic Design mode */}
                {creationMode === "graphic-design" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setBlankCanvasMode(true);
                      setViewMode("overlay");
                    }}
                  >
                    <PaintBucket className="w-4 h-4 mr-1.5" />
                    Blank Canvas — Skip AI, Design from Scratch
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating ? (() => {
                  const selectedProfile = profiles?.find(p => p.id === selectedProfileId);
                  const cfg = selectedProfile?.config as Record<string, any> | undefined;
                  const logoUrl = cfg?.logoUrl;
                  const profileName = selectedProfile?.name || cfg?.institutionName;
                  const colors = [cfg?.primaryColor, cfg?.secondaryColor, cfg?.accentColor, cfg?.tertiaryColor].filter(isRealColor) as string[];
                  const selectedChannelLabel = channelOptions.find(c => c.value === channel)?.label || channel;
                  const selectedStyleLabel = creationMode === "graphic-design" ? "Graphic Design" : (styleOptions.find(s => s.value === style)?.label || style);
                  const selectedEngineLabel = engineOptions.find(e => e.value === engine)?.label || engine;

                  return (
                  <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center gap-3 px-6 py-8 overflow-hidden relative">
                    {/* Animated color wash background */}
                    {colors.length > 0 && (
                      <div className="absolute inset-0 opacity-[0.07]" style={{
                        background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1] || colors[0]} 50%, ${colors[2] || colors[0]} 100%)`,
                      }} />
                    )}

                    {/* Phase 0-1: Logo & institution flash */}
                    <div className={`flex flex-col items-center gap-2 transition-all duration-700 ${generationPhase <= 1 ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
                      {logoUrl ? (
                        <img src={logoUrl} alt="" className="w-16 h-16 object-contain rounded-lg animate-fade-in" />
                      ) : profileName ? (
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center animate-fade-in">
                          <span className="text-2xl font-bold text-primary">{profileName.charAt(0)}</span>
                        </div>
                      ) : null}
                      {profileName && (
                        <p className="text-sm font-semibold text-foreground animate-fade-in">{profileName}</p>
                      )}
                    </div>

                    {/* Brand colors display */}
                    {colors.length > 0 && (
                      <div className={`flex items-center gap-1.5 transition-all duration-700 ${generationPhase === 1 ? 'opacity-100 scale-100' : generationPhase > 1 ? 'opacity-60' : 'opacity-0 scale-90'}`}>
                        <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                        {colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full border-2 border-background shadow-sm animate-scale-in"
                            style={{ backgroundColor: color, animationDelay: `${i * 150}ms` }}
                            title={color}
                          />
                        ))}
                      </div>
                    )}

                    {/* Status message */}
                    <div className="text-center space-y-1 mt-1">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <p className="text-sm font-medium">
                      {creationMode === "graphic-design" ? [
                            "Reading your brand profile…",
                            designRefCount > 0
                              ? `Studying ${designRefCount} design reference${designRefCount > 1 ? "s" : ""} — analyzing layout, color, & typography patterns…`
                              : "Crafting typography & visual hierarchy…",
                            "Applying design principles to your composition…",
                            "Integrating brand colors & finishing composition…",
                            "Finalizing your graphic design piece…",
                          ][generationPhase] : [
                            "Reading your brand profile…",
                            campusPhotoCount > 0
                              ? `Training from ${campusPhotoCount} campus photo${campusPhotoCount > 1 ? "s" : ""}…`
                              : "Matching your institutional profile & brand colors…",
                            "Applying channel best practices…",
                            "Rendering with AI — optimized for this format…",
                            "Finalizing & uploading…",
                          ][generationPhase]}
                        </p>
                      </div>
                      {/* Design reference & campus photo training indicator */}
                      {creationMode === "graphic-design" && designRefCount > 0 && (
                        <p className="text-xs text-primary font-medium flex items-center justify-center gap-1">
                          <Dna className="w-3 h-3" />
                          {designRefCount} design sample{designRefCount > 1 ? "s" : ""} actively shaping this design
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {creationMode !== "graphic-design" && campusPhotoCount > 0 ? (
                          <span className="flex items-center justify-center gap-1">
                            <Camera className="w-3 h-3 text-primary" />
                            {campusPhotoCount} campus photo{campusPhotoCount > 1 ? "s" : ""} guiding visual style
                          </span>
                        ) : creationMode !== "graphic-design" ? (
                          <span className="flex items-center justify-center gap-1">
                            No campus photos uploaded — imagery uses your profile &amp; brand details.{" "}
                            <Link to="/admin/content-dna" className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 font-medium">
                              Add photos for even more accuracy <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </span>
                        ) : designRefCount === 0 ? (
                          <span className="flex items-center justify-center gap-1">
                            <Link to="/admin/content-dna" className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 font-medium">
                              Upload design samples in Content DNA <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                            {" "}for AI to match your exact style
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {engine === "premium"
                          ? "Premium engine — up to 60 seconds"
                          : "Estimated 15–30 seconds"}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full max-w-52">
                      <div className="h-1.5 bg-muted-foreground/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(15 + generationPhase * 20, 95)}%` }}
                        />
                      </div>
                    </div>

                    {/* Selection readback — scrolling tags */}
                    <div className={`flex flex-wrap items-center justify-center gap-1.5 mt-2 max-w-full transition-all duration-500 ${engine === "fast" || generationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                      <Badge variant="outline" className="text-[10px] gap-1 animate-fade-in">
                        <Camera className="w-3 h-3" /> {selectedChannelLabel}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] gap-1 animate-fade-in" style={{ animationDelay: '100ms' }}>
                        {selectedStyleLabel}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] gap-1 animate-fade-in" style={{ animationDelay: '200ms' }}>
                        {selectedEngineLabel}
                      </Badge>
                      {audience && (
                        <Badge variant="outline" className="text-[10px] gap-1 animate-fade-in" style={{ animationDelay: '300ms' }}>
                          <Users className="w-3 h-3" /> {audience}
                        </Badge>
                      )}
                      {tone && (
                        <Badge variant="outline" className="text-[10px] gap-1 animate-fade-in" style={{ animationDelay: '400ms' }}>
                          {tone}
                        </Badge>
                      )}
                      {goal && (
                        <Badge variant="outline" className="text-[10px] gap-1 animate-fade-in" style={{ animationDelay: '500ms' }}>
                          <Target className="w-3 h-3" /> {goal.slice(0, 40)}{goal.length > 40 ? '…' : ''}
                        </Badge>
                      )}
                    </div>

                    {/* Scene description readback */}
                    <div className={`text-center max-w-xs transition-all duration-700 ${engine === "fast" || generationPhase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                      <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                        "{contentDescription.slice(0, 120)}{contentDescription.length > 120 ? '…' : ''}"
                      </p>
                    </div>
                  </div>
                  );
                })() : (imageUrl || blankCanvasMode) ? (
                  <div className="space-y-3">
                    {/* View mode toggle */}
                    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                      {imageUrl && (
                        <>
                          <button
                            onClick={() => { setViewMode("mockup"); setBlankCanvasMode(false); }}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                              viewMode === "mockup"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            In Context
                          </button>
                          <button
                            onClick={() => { setViewMode("raw"); setBlankCanvasMode(false); }}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                              viewMode === "raw"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Image className="w-3.5 h-3.5" />
                            Raw Image
                          </button>
                        </>
                      )}
                      {brandColors.length > 0 && (
                        <>
                          <button
                            onClick={() => setViewMode("overlay")}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                              viewMode === "overlay"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <PaintBucket className="w-3.5 h-3.5" />
                            Brand It
                          </button>
                          {viewMode === "overlay" && (
                            <Link
                              to="/brand-studio"
                              state={{
                              imageUrl: blankCanvasMode ? null : imageUrl,
                              brandColors,
                              logoUrl: profileLogoUrl,
                              logoUrls: profileLogoUrls,
                              institutionName: profileInstitutionName,
                              channel,
                              profileId: selectedProfileId,
                              sceneDescription: contentDescription,
                              audience,
                              tone,
                              goal,
                              }}
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                              title="Open Brand Studio"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              Open Brand Studio
                            </Link>
                          )}
                        </>
                      )}
                    </div>

                    {/* Preview content */}
                    <div className="transition-all duration-300">
                      {viewMode === "overlay" ? (
                        <BrandOverlayEditor
                          imageUrl={blankCanvasMode ? null : imageUrl}
                          brandColors={brandColors}
                          logoUrl={profileLogoUrl}
                          logoUrls={profileLogoUrls}
                          institutionName={profileInstitutionName}
                          channel={channel}
                          sceneDescription={contentDescription}
                          audience={audience}
                          tone={tone}
                          goal={goal}
                        />
                      ) : viewMode === "mockup" && imageUrl ? (
                        <div className="relative group cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
                          <ChannelMockup
                            channel={channel}
                            imageUrl={imageUrl}
                            profileName={profiles?.find(p => p.id === selectedProfileId)?.name}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg">
                            <div className="bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-border/50 transition-transform duration-200 group-hover:scale-100 scale-90">
                              <ZoomIn className="w-5 h-5 text-foreground" />
                            </div>
                          </div>
                        </div>
                      ) : imageUrl ? (
                        <div className="relative group rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt="Generated campus image"
                            className="w-full rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <button
                              onClick={() => setIsLightboxOpen(true)}
                              className="bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-border/50 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100 hover:bg-background"
                            >
                              <ZoomIn className="w-5 h-5 text-foreground" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 inset-x-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="secondary">
                                    <Download className="w-4 h-4 mr-1" /> Download <ChevronDown className="w-3 h-3 ml-1" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleDownload('png')}>PNG</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload('jpg')}>JPG</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload('pdf')}>PDF</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button size="sm" variant="secondary" onClick={handleGenerate}>
                                <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <AIResultsGuidance variant="subtle" className="mt-2" />

                    {imageUrl && viewMode !== "overlay" && (
                      <div className="flex gap-2 flex-wrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Download className="w-4 h-4 mr-1" /> Download <ChevronDown className="w-3 h-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleDownload('png')}>PNG</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload('jpg')}>JPG</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload('pdf')}>PDF</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSaveDialogType('personal'); setSaveDialogOpen(true); }}>
                          <FolderPlus className="w-4 h-4 mr-1" /> Save to Library
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSaveDialogType('shared'); setSaveDialogOpen(true); }}>
                          <Library className="w-4 h-4 mr-1" /> University Library
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={handleGenerate}>
                          <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center gap-3">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Your generated image will appear here
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Select a profile to use campus-specific imagery & brand colors
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SaveToLibraryDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={saveDialogType === 'shared' ? handleSaveToSharedLibrary : handleSaveToLibrary}
        onSaveToPersonal={saveDialogType === 'shared' ? handleSaveToLibrary : undefined}
        onSaveToShared={saveDialogType === 'personal' ? handleSaveToSharedLibrary : undefined}
        libraryType={saveDialogType}
        contentType="image"
        defaultName={`${profileInstitutionName || 'Campus Image'} — ${channelOptions.find(c => c.value === channel)?.label || channel}`}
      />

      {/* Lightbox / Expanded View Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-black/95 overflow-hidden [&>button]:hidden">
          <div className="relative flex items-center justify-center w-full h-full min-h-[60vh]">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-3 right-3 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Generated image — expanded view"
                className="max-w-full max-h-[85vh] object-contain rounded-md"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGeneratorPage;