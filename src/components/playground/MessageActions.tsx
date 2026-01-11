import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Copy, Check, BookmarkPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SaveToLibraryDialog } from "@/components/library/SaveToLibraryDialog";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useAuth } from "@/contexts/AuthContext";
import type { Channel } from "@/types/campusvoice";

interface MessageActionsProps {
  content: string;
  messageId: string;
}

type LibraryType = "personal" | "shared";

export function MessageActions({ content, messageId }: MessageActionsProps) {
  const { toast } = useToast();
  const { profile, isAdmin, isApprover } = useAuth();
  const { addMessage } = useMessageLibrary();
  const { addTemplate } = useSharedLibrary();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveLibraryType, setSaveLibraryType] = useState<LibraryType>("personal");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy to clipboard",
      });
    }
  };

  const handleFeedback = (type: "up" | "down") => {
    if (feedback === type) {
      setFeedback(null);
    } else {
      setFeedback(type);
      toast({
        title: type === "up" ? "Thanks for the feedback!" : "Feedback noted",
        description:
          type === "up"
            ? "Glad this was helpful"
            : "We'll work on improving responses",
      });
    }
  };

  const handleSaveClick = (libraryType: LibraryType) => {
    setSaveLibraryType(libraryType);
    setSaveDialogOpen(true);
  };

  const handleSaveToPersonal = (name: string, channel?: Channel): string | undefined => {
    try {
      const savedMessage = addMessage({
        title: name,
        content: content,
        channel: channel,
        approved: false,
        mode: "generated",
        source: "copywriter",
        createdByUserId: profile?.id,
        createdByName: profile ? `${profile.first_name} ${profile.last_name}` : undefined,
      });
      return savedMessage.id;
    } catch (error) {
      console.error("Error saving to personal library:", error);
      return undefined;
    }
  };

  const handleSaveToShared = (name: string, channel?: Channel): string | undefined => {
    try {
      const savedTemplate = addTemplate({
        title: name,
        intentStatement: "Generated from Copywriter",
        content: content,
        playbook: "Copywriter",
        owner: profile ? `${profile.first_name} ${profile.last_name}` : "Current User",
        maintainer: profile ? `${profile.first_name} ${profile.last_name}` : "Current User",
        status: (isAdmin || isApprover) ? "published" : "submitted",
        version: "1.0",
        requiredFields: {
          audience: [],
          moment: [],
          channel: channel ? [channel] : [],
        },
        useCases: {
          whenToUse: ["General communications"],
          whenNotToUse: [],
        },
        ethicalGuardrails: ["Review content before publishing"],
        placeholders: [],
        source: "copywriter",
      });
      return savedTemplate.id;
    } catch (error) {
      console.error("Error saving to shared library:", error);
      return undefined;
    }
  };

  const handleSave = (name: string, channel?: Channel): string | undefined => {
    try {
      if (saveLibraryType === "personal") {
        const id = handleSaveToPersonal(name, channel);
        toast({
          title: "Saved!",
          description: "Message saved to My Library",
        });
        return id;
      } else {
        const id = handleSaveToShared(name, channel);
        toast({
          title: "Saved!",
          description: `Message ${(isAdmin || isApprover) ? "published to" : "submitted to"} University Library`,
        });
        return id;
      }
    } catch (error) {
      console.error("Error saving message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save message to library",
      });
      return undefined;
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-0",
            feedback === "up" && "text-green-600 bg-green-100 hover:bg-green-100"
          )}
          onClick={() => handleFeedback("up")}
          title="Good response"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-0",
            feedback === "down" && "text-red-600 bg-red-100 hover:bg-red-100"
          )}
          onClick={() => handleFeedback("down")}
          title="Poor response"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>

        <div className="w-px h-4 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => handleSaveClick("personal")}
          title="Save to My Library"
        >
          <BookmarkPlus className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">My Library</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => handleSaveClick("shared")}
          title="Save to University Library"
        >
          <BookmarkPlus className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">University</span>
        </Button>
      </div>

      <SaveToLibraryDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSave}
        onSaveToPersonal={handleSaveToPersonal}
        onSaveToShared={handleSaveToShared}
        libraryType={saveLibraryType}
        contentType="message"
        showChannelSelector={true}
      />
    </>
  );
}
