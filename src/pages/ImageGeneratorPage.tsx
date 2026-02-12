import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon, Download, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const channelOptions = [
  { value: "social-media", label: "Social Media Post (1:1)" },
  { value: "digital-ad-social", label: "Social Ad (1:1)" },
  { value: "email", label: "Email Header (16:9)" },
  { value: "landing-page", label: "Landing Page Hero (16:9)" },
  { value: "direct-mail", label: "Direct Mail (4:3)" },
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

  const handleGenerate = useCallback(async () => {
    if (!contentDescription.trim()) {
      toast.error("Please describe what the image should depict.");
      return;
    }
    setIsGenerating(true);
    setImageUrl(null);
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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold mb-1 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-primary" />
              Image Generator
            </h1>
            <p className="text-sm text-muted-foreground">
              Create on-brand campus photography using your institution's colors, architecture, and identity.
            </p>
          </div>

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
                        {channelOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
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
                            <span className="flex flex-col">
                              <span>{opt.label}</span>
                              <span className="text-xs text-muted-foreground">{opt.description}</span>
                            </span>
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
                            <span className="flex flex-col">
                              <span>{opt.label}</span>
                              <span className="text-xs text-muted-foreground">{opt.description}</span>
                            </span>
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

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !contentDescription.trim()}
                  className="w-full"
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
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Generating campus photography...
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Using your institutional brand colors & campus details
                    </p>
                  </div>
                ) : imageUrl ? (
                  <div className="space-y-3">
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
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-1" /> Download
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleGenerate}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
                      </Button>
                    </div>
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