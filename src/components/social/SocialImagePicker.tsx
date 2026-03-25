import { useState } from "react";
import { ImageIcon, Sparkles, Palette, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { BrandOverlayEditor } from "@/components/image-generator/BrandOverlayEditor";
import { toast } from "sonner";

interface Props {
  imageUrl: string;
  onImageChange: (url: string) => void;
  brandColors?: string[];
  logoUrl?: string;
  logoUrls?: string[];
  institutionName?: string;
}

export function SocialImagePicker({ imageUrl, onImageChange, brandColors, logoUrl, logoUrls, institutionName }: Props) {
  const [tab, setTab] = useState("url");
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showBrandOverlay, setShowBrandOverlay] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) { toast.error("Describe the image you want"); return; }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-channel-image", {
        body: {
          prompt: prompt.trim(),
          channel: "social-media",
          institutionName,
          engine: "fast",
        },
      });
      if (error) throw error;
      const url = data?.imageUrl || data?.image_url;
      if (url) {
        onImageChange(url);
        toast.success("Image generated!");
        setTab("url");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">Image</Label>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-7 w-full">
          <TabsTrigger value="url" className="text-[10px] flex-1 gap-1"><Upload className="h-3 w-3" /> URL</TabsTrigger>
          <TabsTrigger value="ai" className="text-[10px] flex-1 gap-1"><Sparkles className="h-3 w-3" /> AI Generate</TabsTrigger>
          {imageUrl && (
            <TabsTrigger value="brand" className="text-[10px] flex-1 gap-1"><Palette className="h-3 w-3" /> Brand It</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="url" className="mt-2 space-y-2">
          <Input
            value={imageUrl}
            onChange={(e) => onImageChange(e.target.value)}
            placeholder="Paste image URL"
            className="text-xs h-8"
          />
        </TabsContent>

        <TabsContent value="ai" className="mt-2 space-y-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image... e.g. Students walking on campus on a sunny spring day"
            className="text-xs min-h-[60px]"
          />
          <Button size="sm" onClick={generateImage} disabled={generating} className="w-full h-8 text-xs">
            {generating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            Generate Image
          </Button>
        </TabsContent>

        <TabsContent value="brand" className="mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowBrandOverlay(true)}
            className="w-full h-8 text-xs"
          >
            <Palette className="h-3 w-3 mr-1" /> Open Brand Studio
          </Button>
        </TabsContent>
      </Tabs>

      {imageUrl && (
        <div className="relative">
          <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover rounded border border-border" />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 h-5 w-5 bg-background/80"
            onClick={() => onImageChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <Dialog open={showBrandOverlay} onOpenChange={setShowBrandOverlay}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Brand Studio</DialogTitle>
          </DialogHeader>
          <BrandOverlayEditor
            imageUrl={imageUrl || null}
            brandColors={brandColors || ["#1e3a5f", "#c0392b"]}
            logoUrl={logoUrl}
            logoUrls={logoUrls}
            institutionName={institutionName}
            channel="social-media"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
