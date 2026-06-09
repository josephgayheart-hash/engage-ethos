import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Copy,
  Download,
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
  Link as LinkIcon,
  Clock,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LockerItem = {
  id: string;
  user_id: string;
  kind: "text" | "file";
  title: string | null;
  content: string | null;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  expires_at: string | null;
  created_at: string;
};

type ExpiryKey = "1h" | "1d" | "7d" | "never";

const EXPIRY_OPTIONS: { value: ExpiryKey; label: string; seconds: number | null }[] = [
  { value: "1h", label: "1 hour", seconds: 60 * 60 },
  { value: "1d", label: "1 day", seconds: 60 * 60 * 24 },
  { value: "7d", label: "7 days", seconds: 60 * 60 * 24 * 7 },
  { value: "never", label: "Never", seconds: null },
];

const BUCKET = "compass-artifacts";
// Direct supabase-js uploads cap at 50MB by default.
const MAX_FILE_SIZE = 50 * 1024 * 1024;

function formatBytes(bytes: number | null | undefined) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = 60_000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < min) return "just now";
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return d.toLocaleDateString();
}

function expiryFromKey(key: ExpiryKey): string | null {
  const opt = EXPIRY_OPTIONS.find((o) => o.value === key);
  if (!opt || opt.seconds == null) return null;
  return new Date(Date.now() + opt.seconds * 1000).toISOString();
}

export default function CompassLockerPage() {
  const { user, isLoading } = useAuth();
  const [items, setItems] = useState<LockerItem[]>([]);
  const [uploaders, setUploaders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "text" | "file">("all");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [expiry, setExpiry] = useState<ExpiryKey>("7d");
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("compass_locker_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast.error("Failed to load locker");
      setLoading(false);
      return;
    }
    const now = Date.now();
    const fresh = (data as LockerItem[]).filter(
      (it) => !it.expires_at || new Date(it.expires_at).getTime() > now,
    );
    setItems(fresh);

    // Fetch uploader names for non-self items
    const otherIds = Array.from(new Set(fresh.map((i) => i.user_id).filter((id) => id !== user.id)));
    if (otherIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", otherIds);
      const map: Record<string, string> = {};
      (profs || []).forEach((p: { id: string; first_name: string | null; last_name: string | null; email: string }) => {
        const name = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
        map[p.id] = name || p.email;
      });
      setUploaders(map);
    } else {
      setUploaders({});
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.kind === filter)),
    [items, filter],
  );

  const handlePostText = async () => {
    if (!user) return;
    if (!text.trim()) {
      toast.error("Add some text first");
      return;
    }
    setPosting(true);
    const { error } = await supabase.from("compass_locker_items").insert({
      user_id: user.id,
      kind: "text",
      title: title.trim() || null,
      content: text,
      expires_at: expiryFromKey(expiry),
    });
    setPosting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setText("");
    setTitle("");
    toast.success("Saved to locker");
    void loadItems();
  };

  const handleUpload = async (files: FileList | null) => {
    if (!user || !files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is larger than 50MB`);
          continue;
        }
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
        const path = `${user.id}/locker/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });
        if (upErr) {
          toast.error(`Upload failed: ${file.name}`);
          continue;
        }
        const { error: insErr } = await supabase.from("compass_locker_items").insert({
          user_id: user.id,
          kind: "file",
          title: file.name,
          storage_path: path,
          mime_type: file.type || "application/octet-stream",
          size_bytes: file.size,
          expires_at: expiryFromKey(expiry),
        });
        if (insErr) {
          await supabase.storage.from(BUCKET).remove([path]);
          toast.error(`Save failed: ${file.name}`);
        }
      }
      toast.success("Uploaded");
      void loadItems();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (item: LockerItem) => {
    if (!confirm("Delete this item?")) return;
    if (item.storage_path) {
      await supabase.storage.from(BUCKET).remove([item.storage_path]);
    }
    const { error } = await supabase
      .from("compass_locker_items")
      .delete()
      .eq("id", item.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleCopyText = async (item: LockerItem) => {
    if (!item.content) return;
    await navigator.clipboard.writeText(item.content);
    toast.success("Copied");
  };

  const handleDownload = async (item: LockerItem) => {
    if (!item.storage_path) return;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(item.storage_path, 60 * 5, { download: item.title || true });
    if (error || !data?.signedUrl) {
      toast.error("Could not create download link");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async (item: LockerItem) => {
    if (!item.storage_path) return;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(item.storage_path, 60 * 60);
    if (error || !data?.signedUrl) {
      toast.error("Could not create link");
      return;
    }
    await navigator.clipboard.writeText(data.signedUrl);
    toast.success("Signed link copied (valid 1 hour)");
  };

  const handlePinForever = async (item: LockerItem) => {
    const { error } = await supabase
      .from("compass_locker_items")
      .update({ expires_at: null })
      .eq("id", item.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, expires_at: null } : i)),
    );
    toast.success("Pinned — won't expire");
  };

  const handleUnpin = async (item: LockerItem) => {
    const newExpiry = expiryFromKey(expiry) ?? expiryFromKey("7d");
    const { error } = await supabase
      .from("compass_locker_items")
      .update({ expires_at: newExpiry })
      .eq("id", item.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, expires_at: newExpiry } : i)),
    );
    toast.success("Unpinned — will expire again");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div
      className={cn(
        "container mx-auto max-w-5xl space-y-6 p-6 relative",
        dragOver && "ring-2 ring-primary/60 rounded-xl",
      )}
      onDragOver={(e) => {
        if (e.dataTransfer?.types?.includes("Files")) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragOver(false);
      }}
      onDrop={(e) => {
        if (e.dataTransfer?.files?.length) {
          e.preventDefault();
          setDragOver(false);
          void handleUpload(e.dataTransfer.files);
        }
      }}
    >
      {dragOver && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="rounded-xl border-2 border-dashed border-primary px-8 py-6 text-center">
            <Upload className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="text-sm font-medium">Drop to upload to the shared locker</p>
          </div>
        </div>
      )}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Compass Locker</h1>
        <p className="text-sm text-muted-foreground">
          Shared relay for text and files across every active Compass user. Drag files anywhere on this page — uploads are visible to everyone immediately.
        </p>
      </header>

      <Card className="space-y-3 p-4">
        <Input
          placeholder="Optional title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9"
        />
        <Textarea
          placeholder="Paste text, markdown, JSON, prompts…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="font-mono text-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Expires in
          </div>
          <Select value={expiry} onValueChange={(v) => setExpiry(v as ExpiryKey)}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPIRY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => void handleUpload(e.target.files)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload files
            </Button>
            <Button size="sm" onClick={handlePostText} disabled={posting || !text.trim()}>
              {posting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="mr-2 h-4 w-4" />
              )}
              Save text
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Max 50MB per file. Items past their expiry are hidden automatically.
        </p>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["all", "text", "file"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(f)}
              className="h-8"
            >
              {f === "all" ? "All" : f === "text" ? "Text" : "Files"}
            </Button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} item{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Nothing here yet. Paste text or drop a file above.
        </Card>
      ) : (
        <ul className="space-y-2">
          {filtered.map((item) => (
            <Card key={item.id} className="p-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  {item.kind === "text" ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {item.title || (item.kind === "text" ? "Untitled note" : "File")}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {item.kind}
                    </Badge>
                    {item.user_id === user.id ? (
                      <Badge variant="outline" className="text-[10px]">you</Badge>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        by {uploaders[item.user_id] || "another user"}
                      </span>
                    )}
                    {item.expires_at ? (
                      <span className="text-[11px] text-muted-foreground">
                        expires {formatWhen(item.expires_at)}
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        pinned
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{formatWhen(item.created_at)}</span>
                    {item.kind === "file" && (
                      <>
                        <span>·</span>
                        <span>{formatBytes(item.size_bytes)}</span>
                        {item.mime_type && (
                          <>
                            <span>·</span>
                            <span className="truncate">{item.mime_type}</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  {item.kind === "text" && item.content && (
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted/40 p-2 font-mono text-xs">
                      {item.content.length > 2000
                        ? item.content.slice(0, 2000) + "\n…"
                        : item.content}
                    </pre>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {item.kind === "text" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => void handleCopyText(item)}
                      title="Copy text"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => void handleCopyLink(item)}
                        title="Copy 1-hour signed link"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => void handleDownload(item)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {item.user_id === user.id && (
                    item.expires_at ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => void handlePinForever(item)}
                        title="Pin (never expire)"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        onClick={() => void handleUnpin(item)}
                        title="Unpin (restore expiry)"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    )
                  )}
                  {item.user_id === user.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => void handleDelete(item)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
