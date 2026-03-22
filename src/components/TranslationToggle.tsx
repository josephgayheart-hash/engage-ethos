import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Languages, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TranslationToggleProps {
  /** The original content in the non-English language */
  originalContent: string;
  /** The language code of the original content (e.g. 'es', 'fr') */
  outputLanguage: string;
  /** Called when the user toggles — provides the content to display */
  onToggle: (content: string, isEnglish: boolean) => void;
  /** Optional class for the button */
  className?: string;
  /** Size variant */
  size?: "sm" | "default";
}

const languageNames: Record<string, string> = {
  es: "Spanish",
  fr: "French",
  zh: "Chinese",
  ar: "Arabic",
  pt: "Portuguese",
  de: "German",
  ja: "Japanese",
  ko: "Korean",
  hi: "Hindi",
  vi: "Vietnamese",
  tl: "Tagalog",
  it: "Italian",
  ru: "Russian",
};

export function TranslationToggle({
  originalContent,
  outputLanguage,
  onToggle,
  className = "",
  size = "sm",
}: TranslationToggleProps) {
  const { toast } = useToast();
  const [showingEnglish, setShowingEnglish] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [englishVersion, setEnglishVersion] = useState<string | null>(null);

  const langName = languageNames[outputLanguage] || outputLanguage;

  const handleToggle = useCallback(async () => {
    if (showingEnglish) {
      // Switch back to original
      setShowingEnglish(false);
      onToggle(originalContent, false);
      return;
    }

    // If we already have the English version cached, use it
    if (englishVersion) {
      setShowingEnglish(true);
      onToggle(englishVersion, true);
      return;
    }

    // Translate to English via edge function
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-message", {
        body: {
          mode: "translate",
          message: originalContent,
          targetLanguage: "en",
          sourceLanguage: outputLanguage,
        },
      });

      if (error) throw error;
      const translated = data?.translatedText || data?.message || originalContent;
      setEnglishVersion(translated);
      setShowingEnglish(true);
      onToggle(translated, true);
    } catch (err) {
      console.error("Translation failed:", err);
      toast({
        variant: "destructive",
        title: "Translation failed",
        description: "Could not translate to English. Please try again.",
      });
    } finally {
      setIsTranslating(false);
    }
  }, [showingEnglish, englishVersion, originalContent, outputLanguage, onToggle, toast]);

  // Don't render if content is already English
  if (!outputLanguage || outputLanguage === "en") return null;

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleToggle}
      disabled={isTranslating}
      className={`gap-1.5 ${className}`}
    >
      {isTranslating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Languages className="w-3.5 h-3.5" />
      )}
      {isTranslating
        ? "Translating…"
        : showingEnglish
          ? `Show ${langName}`
          : "Show English"}
    </Button>
  );
}
