import { useRef, useCallback, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { DownloadFormatPicker } from "@/components/image-generator/DownloadFormatPicker";

async function captureToDataUrl(el: HTMLElement, scale = 1.5): Promise<string> {
  const canvas = await html2canvas(el, { scale, useCORS: true, allowTaint: false, logging: false, backgroundColor: null });
  return canvas.toDataURL("image/png");
}
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandOverlayCanvas } from "@/components/image-generator/BrandOverlayCanvas";
import { BrandOverlayControls } from "@/components/image-generator/BrandOverlayControls";
import { CanvasRuler } from "@/components/image-generator/CanvasRuler";
import { useGoogleFont } from "@/components/image-generator/BrandOverlayEditor";
import { SaveToLibraryDialog } from "@/components/library/SaveToLibraryDialog";
import { AddToCollectionDialog } from "@/components/library/AddToCollectionDialog";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useLibraryCollections } from "@/hooks/useLibraryCollections";
import { useCustomOverlays } from "@/hooks/useCustomOverlays";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { useUserDrafts } from "@/hooks/useUserDrafts";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Download, Maximize2, FolderPlus, Folder, RefreshCw, Loader2, Upload, Sparkles, PaintBucket } from "lucide-react";
import type { CollectionType } from "@/types/library";
import type { OverlayPatternId } from "@/components/image-generator/overlayPatterns";
import type { CanvasBackgroundType } from "@/components/image-generator/BrandOverlayCanvas";

interface BrandStudioState {
  imageUrl: string | null;
  brandColors: string[];
  logoUrl?: string;
  logoUrls?: string[];
  institutionName?: string;
  channel?: string;
  profileId?: string;
  sceneDescription?: string;
  audience?: string;
  tone?: string;
  goal?: string;
  restoreOverlay?: Record<string, any>;
}

type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type HeadlineAlign = "left" | "center" | "right";

const BrandStudioPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as BrandStudioState | null) || ({} as Partial<BrandStudioState>);
  const restore = state.restoreOverlay;
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- Overridable brand state (initialized from navigation, updated by starter panel) ---
  const [imageUrl, setImageUrl] = useState<string | null>(state.imageUrl ?? null);
  const [brandColors, setBrandColors] = useState<string[]>(state.brandColors ?? []);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(state.logoUrl);
  const [logoUrls, setLogoUrls] = useState<string[] | undefined>(state.logoUrls);
  const [institutionName, setInstitutionName] = useState<string | undefined>(state.institutionName);
  const [channel, setChannel] = useState<string | undefined>(state.channel);
  const [profileId, setProfileId] = useState<string | undefined>(state.profileId);
  const { sceneDescription, audience, tone, goal } = state;

  // --- Starter panel state ---
  const { profiles, isLoading: profilesLoading } = useInstitutionalProfiles();
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [lastSavedMessageId, setLastSavedMessageId] = useState<string | null>(null);
  const lastSavedIdRef = useRef<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { addMessage } = useMessageLibrary();
  const { collections, addItemToCollection, createCollection } = useLibraryCollections();
  const { profile, user, tenant } = useAuth();
  const { saveDraft } = useUserDrafts();
  const savedToLibraryRef = useRef(false);

  const primary = brandColors[0] || "#1e3a5f";
  const secondary = brandColors[1] || brandColors[0] || "#c0392b";
  const allLogos = Array.from(new Set([logoUrl, ...(logoUrls || [])].filter(Boolean))) as string[];

  // --- Starter helpers ---
  const applyProfile = useCallback((pid: string) => {
    const p = profiles.find(pr => pr.id === pid);
    if (!p) return;
    const cfg = p.config;
    const APP_DEFAULT_COLORS = ["#1f2a44", "#2c7a7b"];
    const isReal = (c: unknown): c is string => typeof c === 'string' && c.length > 0 && !APP_DEFAULT_COLORS.includes(c.trim().toLowerCase());
    const colors: string[] = [cfg.primaryColor, cfg.secondaryColor, cfg.accentColor, cfg.tertiaryColor].filter(isReal) as string[];
    setBrandColors(colors.length > 0 ? colors : ["#1e3a5f"]);
    setLogoUrl(cfg.logoUrl || undefined);
    setLogoUrls([cfg.logoUrl, cfg.logoUrlSecondary, cfg.logoUrlAthletic, cfg.logoUrlPresidential].filter(Boolean) as string[]);
    setInstitutionName(cfg.institutionName || p.name);
    setProfileId(pid);
    setChannel("social-media");
  }, [profiles]);

  // Auto-apply profile when coming from "Edit in Brand Studio" with profileId but no brand data
  useEffect(() => {
    if (profileId && brandColors.length === 0 && profiles.length > 0) {
      applyProfile(profileId);
    }
  }, [profileId, profiles, brandColors.length, applyProfile]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, or WebP).");
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    if (selectedProfileId) applyProfile(selectedProfileId);
    else setBrandColors(prev => prev.length > 0 ? prev : ["#1e3a5f"]);
  }, [selectedProfileId, applyProfile]);

  const handleGenerate = useCallback(async () => {
    if (!generatePrompt.trim()) {
      toast.error("Enter a description for the image.");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-channel-image", {
        body: {
          channel: "social-media",
          contentSummary: generatePrompt.trim(),
          tenantId: tenant?.id,
          profileId: selectedProfileId || undefined,
        },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
        if (selectedProfileId) applyProfile(selectedProfileId);
        else setBrandColors(prev => prev.length > 0 ? prev : ["#1e3a5f"]);
        toast.success("Image generated!");
      } else {
        toast.error(data?.error || "Failed to generate image.");
      }
    } catch (err) {
      console.error("Generate image error:", err);
      toast.error("Image generation failed. Try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [generatePrompt, tenant?.id, selectedProfileId, applyProfile]);

  const handleBlankCanvas = useCallback(() => {
    if (selectedProfileId) applyProfile(selectedProfileId);
    else setBrandColors(prev => prev.length > 0 ? prev : ["#1e3a5f"]);
    setImageUrl(null);
    setCanvasBackgroundType("gradient-diagonal");
    // Force into editor by ensuring brandColors is set
    setBrandColors(prev => prev.length > 0 ? prev : ["#1e3a5f"]);
  }, [selectedProfileId, applyProfile]);

  // Overlay state
  const [overlayPattern, setOverlayPattern] = useState<OverlayPatternId | string>(restore?.overlayPattern || "solid");
  const [overlayColor, setOverlayColor] = useState(restore?.overlayColor || primary);
  const [overlayOpacity, setOverlayOpacity] = useState(restore?.overlayOpacity ?? 0.55);
  const [customOverlayUrl, setCustomOverlayUrl] = useState<string | null>(null);
  const { overlays: customOverlays } = useCustomOverlays(undefined);

  // Canvas background state (no-image graphic design mode)
  const [canvasBackgroundType, setCanvasBackgroundType] = useState<CanvasBackgroundType>(restore?.canvasBackgroundType || "gradient-diagonal");
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState(restore?.canvasBackgroundColor || primary);
  const [canvasBackgroundSecondaryColor, setCanvasBackgroundSecondaryColor] = useState(restore?.canvasBackgroundSecondaryColor || secondary);

  // Logo state
  const [showLogo, setShowLogo] = useState(restore?.showLogo ?? !!logoUrl);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>(restore?.logoPosition || "top-left");
  const [logoScale, setLogoScale] = useState(restore?.logoScale ?? 60);
  const [activeLogoIndex, setActiveLogoIndex] = useState(restore?.activeLogoIndex ?? 0);

  // Headline state
  const [headlineText, setHeadlineText] = useState(restore?.headlineText || "");
  const [headlineFontSize, setHeadlineFontSize] = useState(restore?.headlineFontSize ?? 28);
  const [headlineX, setHeadlineX] = useState(restore?.headlineX ?? 50);
  const [headlineY, setHeadlineY] = useState(restore?.headlineY ?? 50);
  const [headlineColor, setHeadlineColor] = useState(restore?.headlineColor || "#ffffff");
  const [headlineAlign, setHeadlineAlign] = useState<HeadlineAlign>(restore?.headlineAlign || "center");
  const [headlineFont, setHeadlineFont] = useState(restore?.headlineFont || "Inter");
  const [headlineBold, setHeadlineBold] = useState(restore?.headlineBold ?? false);
  const [headlineItalic, setHeadlineItalic] = useState(restore?.headlineItalic ?? false);
  const [headlineUnderline, setHeadlineUnderline] = useState(restore?.headlineUnderline ?? false);
  const [headlineWidth, setHeadlineWidth] = useState(restore?.headlineWidth ?? 90);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Bottom bar state
  const [showBottomBar, setShowBottomBar] = useState(restore?.showBottomBar ?? false);
  const [bottomBarText, setBottomBarText] = useState(restore?.bottomBarText || "");
  const [bottomBarColor, setBottomBarColor] = useState(restore?.bottomBarColor || primary);


  useGoogleFont(headlineFont);

  const activeLogo = allLogos[activeLogoIndex] || allLogos[0];

  // Keep a ref of current draft data for unmount auto-save
  const draftDataRef = useRef<Record<string, unknown> | null>(null);
  const draftTitleRef = useRef("");
  const saveDraftRef = useRef(saveDraft);
  saveDraftRef.current = saveDraft;

  useEffect(() => {
    draftDataRef.current = imageUrl ? {
      imageUrl,
      brandColors,
      channel,
      audience,
      tone,
      goal,
      profileId,
      profileName: institutionName,
      headlineText,
      overlayPattern,
      overlayColor,
      overlayOpacity,
      source: 'brand-studio',
    } : null;
    draftTitleRef.current = `${institutionName || 'Branded'} — ${channel || 'image'}`;
  });

  // Auto-save as draft on unmount if not saved to library
  useEffect(() => {
    return () => {
      if (savedToLibraryRef.current || !draftDataRef.current) return;
      saveDraftRef.current(
        'image' as any,
        draftDataRef.current,
        draftTitleRef.current,
        undefined,
        true
      );
    };
  }, []);

  // Drag handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const currentPxX = (headlineX / 100) * rect.width;
      const currentPxY = (headlineY / 100) * rect.height;
      dragOffset.current = { x: e.clientX - rect.left - currentPxX, y: e.clientY - rect.top - currentPxY };
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [headlineX, headlineY]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const newX = ((e.clientX - rect.left - dragOffset.current.x) / rect.width) * 100;
      const newY = ((e.clientY - rect.top - dragOffset.current.y) / rect.height) * 100;
      setHeadlineX(Math.max(5, Math.min(95, newX)));
      setHeadlineY(Math.max(5, Math.min(95, newY)));
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);


  const handleSaveToLibrary = useCallback(
    async (name: string) => {
      const canvas = document.getElementById("brand-overlay-canvas");
      if (!canvas) {
        toast.error("Could not capture the image.");
        return undefined;
      }
      setIsSaving(true);
      try {
        const dataUrl = await captureToDataUrl(canvas as HTMLElement, 1.5);

        // Upload to storage instead of storing base64 in DB
        const base64Data = dataUrl.split(",")[1];
        const byteArray = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const blob = new Blob([byteArray], { type: "image/png" });
        const filePath = `branded-images/${user?.id || "anon"}/${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from("collection-assets")
          .upload(filePath, blob, { contentType: "image/png", upsert: true });

        let imageUrl = dataUrl; // fallback to data URL
        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from("collection-assets")
            .getPublicUrl(filePath);
          imageUrl = publicData.publicUrl;
        } else {
          console.warn("Storage upload failed, falling back to data URL:", uploadError);
        }

        const result = await addMessage({
          title: name,
          content: `![Branded Image](${imageUrl})`,
          channel: (channel as any) || "social-media",
          mode: "generated",
          source: "brand-studio" as any,
          approved: false,
          audience: audience as any,
          tone: tone as any,
          goal: goal as any,
          notes: sceneDescription || undefined,
          institutionalProfileId: profileId,
          institutionalProfileName: institutionName,
          coverImageUrl: imageUrl,
          tags: ["branded-image", channel || "image"].filter(Boolean),
          metadata: {
            source: "brand-studio",
            originalImageUrl: state.imageUrl || null,
            brandColors,
            overlayPattern,
            overlayColor,
            overlayOpacity,
            headlineText,
            headlineFontSize,
            headlineX,
            headlineY,
            headlineColor,
            headlineAlign,
            headlineFont,
            headlineBold,
            headlineItalic,
            headlineUnderline,
            headlineWidth,
            showLogo,
            logoPosition,
            logoScale,
            activeLogoIndex,
            showBottomBar,
            bottomBarText,
            bottomBarColor,
            canvasBackgroundType,
            canvasBackgroundColor,
            canvasBackgroundSecondaryColor,
          },
        });
        if (result?.id) {
          setLastSavedMessageId(result.id);
          lastSavedIdRef.current = result.id;
          savedToLibraryRef.current = true;
          return result.id;
        }
        toast.error("Failed to save — please try again.");
        return undefined;
      } catch (err) {
        console.error("Save to library capture error:", err);
        toast.error("Failed to capture image for library.");
        return undefined;
      } finally {
        setIsSaving(false);
      }
    },
    [channel, profileId, institutionName, addMessage, user]
  );

  const handleSaveToSharedLibrary = useCallback(
    async (name: string) => {
      const canvas = document.getElementById("brand-overlay-canvas");
      if (!canvas) return undefined;
      try {
        const dataUrl = await captureToDataUrl(canvas as HTMLElement, 1.5);

        // Upload to storage instead of storing base64 in DB
        const base64Data = dataUrl.split(",")[1];
        const byteArray = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const blob = new Blob([byteArray], { type: "image/png" });
        const filePath = `branded-images/${user?.id || "anon"}/shared-${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from("collection-assets")
          .upload(filePath, blob, { contentType: "image/png", upsert: true });

        let storedImageUrl = dataUrl; // fallback
        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from("collection-assets")
            .getPublicUrl(filePath);
          storedImageUrl = publicData.publicUrl;
        } else {
          console.warn("Storage upload failed for shared library, falling back to data URL:", uploadError);
        }

        const { data, error } = await supabase.from("shared_templates").insert({
          title: name,
          content: `![Branded Image](${storedImageUrl})`,
          cover_image_url: storedImageUrl,
          tenant_id: profile?.tenant_id || "",
          created_by_user_id: user?.id || "",
          created_by_name: profile ? `${profile.first_name} ${profile.last_name}` : "",
          status: "submitted",
          source: "brand-studio",
          institutional_profile_id: profileId || null,
          tags: ["branded-image", channel || "image"].filter(Boolean),
          required_fields: {
            audience: audience ? [audience] : [],
            moment: [],
            channel: channel ? [channel] : ["social-media"],
          },
          metadata: {
            source: "brand-studio",
            sceneDescription: sceneDescription || null,
            tone: tone || null,
            goal: goal || null,
          },
        }).select("id").single();
        if (error) {
          console.error("Shared library save error:", error);
          toast.error("Failed to save to University Library.");
          return undefined;
        }
        return data?.id;
      } catch (err) {
        console.error("Shared library capture error:", err);
        toast.error("Failed to capture image for University Library.");
        return undefined;
      }
    },
    [channel, profileId, profile, user, audience, tone, goal, sceneDescription]
  );

  const handleAddToExistingCollection = useCallback(
    async (collectionId: string) => {
      if (!lastSavedMessageId) {
        toast.error("Save to library first before adding to a collection.");
        return;
      }
      const success = await addItemToCollection(collectionId, {
        itemType: "message",
        messageId: lastSavedMessageId,
      });
      if (success) toast.success("Added to collection!");
      else toast.error("Failed to add to collection.");
    },
    [lastSavedMessageId, addItemToCollection]
  );

  const handleCreateAndAddToCollection = useCallback(
    async (input: { name: string; description?: string; collectionType: CollectionType }) => {
      if (!lastSavedMessageId) {
        toast.error("Save to library first before adding to a collection.");
        return;
      }
      const collection = await createCollection(input);
      if (collection?.id) {
        const success = await addItemToCollection(collection.id, {
          itemType: "message",
          messageId: lastSavedMessageId,
        });
        if (success) toast.success(`Created "${input.name}" and added image!`);
      } else {
        toast.error("Failed to create collection.");
      }
    },
    [lastSavedMessageId, createCollection, addItemToCollection]
  );

  if (brandColors.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <Maximize2 className="w-10 h-10 text-primary mx-auto" />
            <h2 className="text-xl font-serif font-bold">Brand It Studio</h2>
            <p className="text-sm text-muted-foreground">
              Select a profile and choose how to start — upload an image, generate one with AI, or begin with a blank canvas.
            </p>
          </div>

          {/* Profile selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Institutional Profile</label>
            <Select value={selectedProfileId} onValueChange={(v) => { setSelectedProfileId(v); }}>
              <SelectTrigger>
                <SelectValue placeholder={profilesLoading ? "Loading profiles…" : "Select a profile"} />
              </SelectTrigger>
              <SelectContent>
                {profiles.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      {p.config.logoUrl ? (
                        <img src={p.config.logoUrl} alt="" className="w-4 h-4 object-contain rounded-sm" />
                      ) : (
                        <span className="w-4 h-4 rounded-sm bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {p.name.charAt(0)}
                        </span>
                      )}
                      {p.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Three options */}
          <div className="grid gap-3">
            {/* Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left"
            >
              <Upload className="w-5 h-5 text-primary shrink-0" />
              <div>
                <div className="text-sm font-medium">Upload Your Own Image</div>
                <div className="text-xs text-muted-foreground">PNG, JPG, or WebP</div>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Generate */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Generate with AI</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Describe the scene…"
                  value={generatePrompt}
                  onChange={e => setGeneratePrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !isGenerating) handleGenerate(); }}
                  disabled={isGenerating}
                />
                <Button size="sm" onClick={handleGenerate} disabled={isGenerating || !generatePrompt.trim()}>
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
                </Button>
              </div>
            </div>

            {/* Blank canvas */}
            <button
              onClick={handleBlankCanvas}
              className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left"
            >
              <PaintBucket className="w-5 h-5 text-primary shrink-0" />
              <div>
                <div className="text-sm font-medium">Start with a Blank Canvas</div>
                <div className="text-xs text-muted-foreground">Solid, gradient, or textured background — no photo needed</div>
              </div>
            </button>
          </div>

          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={() => navigate("/image-generator")}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Go to Image Studio instead
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="font-serif text-base font-bold flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-primary" />
            Brand It Studio
          </h1>
        </div>
      </div>

      {/* Main content: controls left, canvas right */}
      <div className="flex-1 min-h-0 flex">
        {/* Left: Controls */}
        <div className="w-[340px] shrink-0 border-r border-border flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4">
              <BrandOverlayControls
                brandColors={brandColors}
                overlayColor={overlayColor}
                onOverlayColorChange={setOverlayColor}
                overlayOpacity={overlayOpacity}
                onOverlayOpacityChange={setOverlayOpacity}
                overlayPattern={overlayPattern}
                onOverlayPatternChange={setOverlayPattern}
                secondaryColor={secondary}
                customOverlays={customOverlays}
                onCustomOverlaySelect={(overlay) => setCustomOverlayUrl(overlay.fileUrl)}
                allLogos={allLogos}
                showLogo={showLogo}
                onShowLogoChange={setShowLogo}
                logoPosition={logoPosition}
                onLogoPositionChange={setLogoPosition}
                logoScale={logoScale}
                onLogoScaleChange={setLogoScale}
                activeLogoIndex={activeLogoIndex}
                onActiveLogoIndexChange={setActiveLogoIndex}
                headlineText={headlineText}
                onHeadlineTextChange={setHeadlineText}
                headlineFontSize={headlineFontSize}
                onHeadlineFontSizeChange={setHeadlineFontSize}
                headlineColor={headlineColor}
                onHeadlineColorChange={setHeadlineColor}
                headlineAlign={headlineAlign}
                onHeadlineAlignChange={setHeadlineAlign}
                headlineFont={headlineFont}
                onHeadlineFontChange={setHeadlineFont}
                headlineWidth={headlineWidth}
                onHeadlineWidthChange={setHeadlineWidth}
                headlineBold={headlineBold}
                onHeadlineBoldChange={setHeadlineBold}
                headlineItalic={headlineItalic}
                onHeadlineItalicChange={setHeadlineItalic}
                headlineUnderline={headlineUnderline}
                onHeadlineUnderlineChange={setHeadlineUnderline}
                showBottomBar={showBottomBar}
                onShowBottomBarChange={setShowBottomBar}
                bottomBarText={bottomBarText}
                onBottomBarTextChange={setBottomBarText}
                bottomBarColor={bottomBarColor}
                onBottomBarColorChange={setBottomBarColor}
                institutionName={institutionName}
                channel={channel}
                audience={audience}
                tone={tone}
                goal={goal}
                sceneDescription={sceneDescription}
                hasImage={!!imageUrl}
                canvasBackgroundType={canvasBackgroundType}
                onCanvasBackgroundTypeChange={setCanvasBackgroundType}
                canvasBackgroundColor={canvasBackgroundColor}
                onCanvasBackgroundColorChange={setCanvasBackgroundColor}
                canvasBackgroundSecondaryColor={canvasBackgroundSecondaryColor}
                onCanvasBackgroundSecondaryColorChange={setCanvasBackgroundSecondaryColor}
              />
            </div>
          </ScrollArea>

        </div>

        {/* Right: Canvas */}
        <div className="flex-1 flex items-center justify-center p-8 bg-muted/30 overflow-hidden">
          <div className="max-w-2xl w-full relative group">
            {/* Always show editable canvas */}
            <BrandOverlayCanvas
              ref={canvasRef}
              imageUrl={imageUrl}
              primaryColor={primary}
              secondaryColor={secondary}
              canvasBackgroundType={canvasBackgroundType}
              canvasBackgroundColor={canvasBackgroundColor}
              canvasBackgroundSecondaryColor={canvasBackgroundSecondaryColor}
              overlayPattern={overlayPattern}
              overlayColor={overlayColor}
              overlayOpacity={overlayOpacity}
              customOverlayUrl={customOverlayUrl}
              showLogo={showLogo}
              activeLogo={activeLogo}
              logoPosition={logoPosition}
              logoScale={logoScale}
              headlineText={headlineText}
              headlineFontSize={headlineFontSize}
              headlineX={headlineX}
              headlineY={headlineY}
              headlineColor={headlineColor}
              headlineAlign={headlineAlign}
              headlineFont={headlineFont}
              headlineWidth={headlineWidth}
              headlineBold={headlineBold}
              headlineItalic={headlineItalic}
              headlineUnderline={headlineUnderline}
              isDragging={isDragging}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onHeadlineWidthChange={setHeadlineWidth}
              onHeadlineTextChange={setHeadlineText}
              showBottomBar={showBottomBar}
              bottomBarText={bottomBarText}
              bottomBarColor={bottomBarColor}
              institutionName={institutionName}
            />

            {/* Hover overlay actions — only at bottom, not covering canvas interaction area */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-5 pt-12 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg pointer-events-none z-20">
              <div className="flex flex-wrap gap-2 pointer-events-auto justify-center px-4">
                <DownloadFormatPicker
                  targetId="brand-overlay-canvas"
                  filenameBase={`branded-${channel || "image"}`}
                  size="sm"
                  variant="outline"
                  label="Download"
                />
                <Button size="sm" variant="secondary" onClick={() => setSaveDialogOpen(true)}>
                  <FolderPlus className="w-4 h-4 mr-1" />
                  Save to Library
                </Button>
                {lastSavedMessageId && (
                  <Button size="sm" variant="secondary" onClick={() => setCollectionDialogOpen(true)}>
                    <Folder className="w-4 h-4 mr-1" />
                    Add to Collection
                  </Button>
                )}
                  <Button size="sm" variant="secondary" onClick={() => navigate("/image-generator")}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </div>
          </div>
        </div>
      </div>

      <SaveToLibraryDialog
        open={saveDialogOpen}
        onOpenChange={(open) => {
          setSaveDialogOpen(open);
          if (!open && lastSavedIdRef.current) {
            // After dialog closes with a saved item, offer collection dialog
            setTimeout(() => setCollectionDialogOpen(true), 300);
          }
        }}
        onSave={handleSaveToLibrary}
        onSaveToShared={handleSaveToSharedLibrary}
        libraryType="personal"
        contentType="branded image"
        defaultName={`${institutionName || "Branded"} — ${channel || "image"}`}
        onAddToCollection={() => {
          setSaveDialogOpen(false);
          setTimeout(() => setCollectionDialogOpen(true), 200);
        }}
        showAddToCollection={!!lastSavedMessageId}
      />

      <AddToCollectionDialog
        open={collectionDialogOpen}
        onOpenChange={setCollectionDialogOpen}
        collections={collections}
        onAddToExisting={handleAddToExistingCollection}
        onCreateAndAdd={handleCreateAndAddToCollection}
      />
    </div>
  );
};

export default BrandStudioPage;
