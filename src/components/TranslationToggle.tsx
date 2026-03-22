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
  /** Called when the user toggles — provides the content to display and whether it's English */
  onToggle?: (content: string, isEnglish: boolean) => void;
  /** Optional class for the wrapper */
  className?: string;
  /** Size variant */
  size?: "sm" | "default";
  /** If true, renders the English translation inline below the toggle */
  inline?: boolean;
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
  inline = true,
}: TranslationToggleProps) {
  const { toast } = useToast();
  const [showingEnglish, setShowingEnglish] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [englishVersion, setEnglishVersion] = useState<string | null>(null);

  const langName = languageNames[outputLanguage] || outputLanguage;

  const handleToggle = useCallback(async () => {
    if (showingEnglish) {
      setShowingEnglish(false);
      onToggle?.(originalContent, false);
      return;
    }

    if (englishVersion) {
      setShowingEnglish(true);
      onToggle?.(englishVersion, true);
      return;
    }

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
      onToggle?.(translated, true);
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

  if (!outputLanguage || outputLanguage === "en") return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size={size}
          onClick={handleToggle}
          disabled={isTranslating}
          className="gap-1.5"
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
        {showingEnglish && (
          <span className="text-xs text-muted-foreground italic">
            Showing English translation for HQ review
          </span>
        )}
      </div>
      {inline && showingEnglish && englishVersion && (
        <div className="mt-2 p-3 bg-muted/40 rounded-lg border border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">English Translation</p>
          <p className="text-sm whitespace-pre-wrap">{englishVersion}</p>
        </div>
      )}
    </div>
  );
}
