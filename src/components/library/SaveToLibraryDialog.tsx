import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ExternalLink, FolderPlus, Library, Folder, Loader2 } from "lucide-react";
import type { Channel } from "@/types/campusvoice";

type LibraryType = "personal" | "shared";

const CHANNEL_OPTIONS: { value: Channel | "none"; label: string }[] = [
  { value: "none", label: "No specific channel" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS/Text" },
  { value: "social-media", label: "Social Media" },
  { value: "portal", label: "Portal" },
  { value: "landing-page", label: "Landing Page" },
  { value: "direct-mail", label: "Direct Mail" },
  { value: "phone-call", label: "Phone/Call Script" },
  { value: "digital-ad-search", label: "Search Ad" },
  { value: "digital-ad-social", label: "Social Ad" },
  { value: "talking-points", label: "Talking Points" },
  { value: "news-article", label: "News Article" },
];

interface SaveToLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, channel?: Channel) => string | undefined | Promise<string | undefined>;
  /** Optional callback to also save to personal library when saving to shared */
  onSaveToPersonal?: (name: string, channel?: Channel) => string | undefined | Promise<string | undefined>;
  /** Optional callback to also save to shared library when saving to personal */
  onSaveToShared?: (name: string, channel?: Channel) => string | undefined | Promise<string | undefined>;
  libraryType: LibraryType;
  defaultName?: string;
  contentType?: string;
  showChannelSelector?: boolean;
  /** Callback when user clicks "Add to Collection" in the success state */
  onAddToCollection?: () => void;
  /** Whether to show the "Add to Collection" button in success state */
  showAddToCollection?: boolean;
}

export function SaveToLibraryDialog({
  open,
  onOpenChange,
  onSave,
  onSaveToPersonal,
  onSaveToShared,
  libraryType,
  defaultName = "",
  contentType = "item",
  showChannelSelector = false,
  onAddToCollection,
  showAddToCollection = false,
}: SaveToLibraryDialogProps) {
  const [name, setName] = useState(defaultName);
  const [channel, setChannel] = useState<Channel | "none">("none");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [alsoSaveToPersonal, setAlsoSaveToPersonal] = useState(false);
  const [alsoSaveToShared, setAlsoSaveToShared] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync defaultName when dialog opens
  useEffect(() => {
    if (open && defaultName) {
      setName(defaultName);
    }
  }, [open, defaultName]);

  const handleSave = async () => {
    if (!name.trim() || isSaving) return;
    
    setIsSaving(true);
    try {
      const selectedChannel = channel === "none" ? undefined : channel;
      const result = onSave(name.trim(), selectedChannel);
      const id = result instanceof Promise ? await result : result;
      
      // If saving to shared library and user wants to also save to personal
      if (libraryType === 'shared' && alsoSaveToPersonal && onSaveToPersonal) {
        const personalResult = onSaveToPersonal(name.trim(), selectedChannel);
        if (personalResult instanceof Promise) await personalResult;
      }
      
      // If saving to personal library and user wants to also save to shared
      if (libraryType === 'personal' && alsoSaveToShared && onSaveToShared) {
        const sharedResult = onSaveToShared(name.trim(), selectedChannel);
        if (sharedResult instanceof Promise) await sharedResult;
      }
      
      if (id) {
        setSavedId(id);
        setIsSaved(true);
      } else {
        setIsSaved(true);
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Save to library error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName("");
    setChannel("none");
    setSavedId(null);
    setIsSaved(false);
    setIsSaving(false);
    setAlsoSaveToPersonal(false);
    setAlsoSaveToShared(false);
    onOpenChange(false);
  };

  const libraryPath = libraryType === "personal" ? "/library" : "/shared-library";
  const itemPath = savedId ? `${libraryPath}/${savedId}` : libraryPath;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            {libraryType === "personal" ? (
              <FolderPlus className="w-5 h-5 text-primary" />
            ) : (
              <Library className="w-5 h-5 text-primary" />
            )}
            {isSaved
              ? `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Saved!`
              : `Save to ${libraryType === "personal" ? "Personal" : "Shared"} Library`}
          </DialogTitle>
          <DialogDescription>
            {isSaved
              ? `Your ${contentType} has been saved successfully.`
              : `Give your ${contentType} a name to save it to your ${libraryType === "personal" ? "personal" : "shared"} library.`}
          </DialogDescription>
        </DialogHeader>

        {!isSaved ? (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Name</Label>
                <Input
                  id="item-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`Enter ${contentType} name...`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && name.trim()) {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  autoFocus
                />
              </div>
              
              {showChannelSelector && (
                <div className="space-y-2">
                  <Label htmlFor="channel-select">Channel (optional)</Label>
                  <Select value={channel} onValueChange={(val) => setChannel(val as Channel | "none")}>
                    <SelectTrigger id="channel-select">
                      <SelectValue placeholder="Select a channel..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNEL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Tag this copy with a channel for easier filtering later
                  </p>
                </div>
              )}

              {/* Also save to personal library checkbox - only show when saving to shared */}
              {libraryType === 'shared' && onSaveToPersonal && (
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <Checkbox
                    id="also-save-personal"
                    checked={alsoSaveToPersonal}
                    onCheckedChange={(checked) => setAlsoSaveToPersonal(checked === true)}
                  />
                  <Label 
                    htmlFor="also-save-personal" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    Also save to My Library
                  </Label>
                </div>
              )}

              {/* Also save to shared library checkbox - only show when saving to personal */}
              {libraryType === 'personal' && onSaveToShared && (
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <Checkbox
                    id="also-save-shared"
                    checked={alsoSaveToShared}
                    onCheckedChange={(checked) => setAlsoSaveToShared(checked === true)}
                  />
                  <Label 
                    htmlFor="also-save-shared" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    Also submit to University Library
                  </Label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100">{name}</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Saved to {libraryType === "personal" ? "My Library" : "University Library"}
                  {alsoSaveToPersonal && libraryType === 'shared' && " and My Library"}
                  {alsoSaveToShared && libraryType === 'personal' && " and University Library"}
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleClose}>
                Done
              </Button>
              {showAddToCollection && onAddToCollection && (
                <Button variant="secondary" onClick={onAddToCollection}>
                  <Folder className="w-4 h-4 mr-1" />
                  Add to Collection
                </Button>
              )}
              <Button asChild>
                <Link to={itemPath} className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View in Library
                </Link>
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
