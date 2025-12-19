import { useState } from "react";
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
import { Check, ExternalLink, FolderPlus, Library } from "lucide-react";

type LibraryType = "personal" | "shared";

interface SaveToLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => string | undefined; // Returns the saved item's ID
  libraryType: LibraryType;
  defaultName?: string;
  contentType?: string; // e.g., "message", "journey", "template"
}

export function SaveToLibraryDialog({
  open,
  onOpenChange,
  onSave,
  libraryType,
  defaultName = "",
  contentType = "item",
}: SaveToLibraryDialogProps) {
  const [name, setName] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    
    const id = onSave(name.trim());
    if (id) {
      setSavedId(id);
      setIsSaved(true);
    } else {
      // If no ID returned, still mark as saved but close dialog
      setIsSaved(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    setName("");
    setSavedId(null);
    setIsSaved(false);
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!name.trim()}>
                Save
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
                  Saved to {libraryType === "personal" ? "Personal" : "Shared"} Library
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleClose}>
                Done
              </Button>
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
