import { useState, useCallback, useMemo } from "react";
import { Header } from "@/components/Header";
import { WaveBackground } from "@/components/WaveBackground";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon, Download, RefreshCw, Loader2, Sparkles, Palette, Camera, Users, Target, Eye, Image, ExternalLink, PaintBucket, Maximize2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ChannelMockup } from "@/components/image-generator/ChannelMockup";
import { BrandOverlayEditor } from "@/components/image-generator/BrandOverlayEditor";
import { useCampusPhotoCount } from "@/hooks/useCampusPhotoCount";
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

const ImageGeneratorPage = () => {
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;
  const { profiles } = useInstitutionalProfiles();

  const [contentDescription, setContentDescription] = useState("");
  const [channel, setChannel] = useState("social-media");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [goal, setGoal] = useState("");
  const [engine, setEngine] = useState("fast");
  const [style, setStyle] = useState("photorealistic");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState(0);
  const [viewMode, setViewMode] = useState<"raw" | "mockup" | "overlay">("mockup");
  const [blankCanvasMode, setBlankCanvasMode] = useState(false);
  const { campusPhotoCount } = useCampusPhotoCount(selectedProfileId || null);

  // Extract brand info from selected profile
  const selectedProfile = profiles?.find(p => p.id === selectedProfileId);
  const profileConfig = selectedProfile?.config as Record<string, any> | undefined;
  const brandColors = [profileConfig?.primaryColor, profileConfig?.secondaryColor, profileConfig?.tertiaryColor, profileConfig?.accentColor].filter(Boolean) as string[];
  const profileLogoUrl = profileConfig?.logoUrl as string | undefined;
  const profileLogoUrls = [profileConfig?.logoUrl, profileConfig?.logoUrlAlt, profileConfig?.logoUrlIcon].filter(Boolean) as string[];
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
          imageStyle: style || "photorealistic",
        },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
        toast.success("Image generated successfully!");
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
  }, [contentDescription, channel, audience, tenantId, selectedProfileId, goal, tone, engine, style]);

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const ext = blob.type.includes("png") ? "png" : "jpg";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `campus-image-${channel}-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    } catch {
      toast.error("Download failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Image Settings</CardTitle>
                <CardDescription>
                  Describe your scene and select options. The generator uses your institutional profile for campus-accurate, brand-aligned imagery.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Scene Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g. Students collaborating on a research project in a modern science lab during golden hour"
                    value={contentDescription}
                    onChange={(e) => setContentDescription(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe the scene, activity, and mood you want captured.
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
                </div>

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

                {/* Blank Canvas shortcut */}
                {selectedProfileId && brandColors.length > 0 && (
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
                    Create Branded Graphic (No Image)
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
                  const colors = [cfg?.primaryColor, cfg?.secondaryColor, cfg?.accentColor, cfg?.tertiaryColor].filter(Boolean) as string[];
                  const selectedChannelLabel = channelOptions.find(c => c.value === channel)?.label || channel;
                  const selectedStyleLabel = styleOptions.find(s => s.value === style)?.label || style;
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
                          {[
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
                      {/* Campus photo training indicator */}
                      <p className="text-xs text-muted-foreground">
                        {campusPhotoCount > 0 ? (
                          <span className="flex items-center justify-center gap-1">
                            <Camera className="w-3 h-3 text-primary" />
                            {campusPhotoCount} campus photo{campusPhotoCount > 1 ? "s" : ""} guiding visual style
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1">
                            No campus photos uploaded — imagery uses your profile &amp; brand details.{" "}
                            <Link to="/admin/content-dna" className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 font-medium">
                              Add photos for even more accuracy <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </span>
                        )}
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
                        <ChannelMockup
                          channel={channel}
                          imageUrl={imageUrl}
                          profileName={profiles?.find(p => p.id === selectedProfileId)?.name}
                        />
                      ) : imageUrl ? (
                        <div className="relative group rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt="Generated campus image"
                            className="w-full rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <Button size="sm" variant="secondary" onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-1" /> Download
                              </Button>
                              <Button size="sm" variant="secondary" onClick={handleGenerate}>
                                <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {imageUrl && viewMode !== "overlay" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={handleDownload}>
                          <Download className="w-4 h-4 mr-1" /> Download
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
    </div>
  );
};

export default ImageGeneratorPage;