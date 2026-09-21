import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "@/lib/router-compat";
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
  Eye,
  ArrowLeft,
  Users,
  Check,
  MoreHorizontal,
  ShieldAlert,
  Timer,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

function isImageMime(mime: string | null | undefined) {
  return !!mime && mime.startsWith("image/");
}
function isPdfMime(mime: string | null | undefined) {
  return mime === "application/pdf";
}
function isTextLikeMime(mime: string | null | undefined) {
  if (!mime) return false;
  return mime.startsWith("text/") || mime === "application/json" || mime === "application/xml";
}
function isPreviewableInBrowser(mime: string | null | undefined) {
  return isImageMime(mime) || isPdfMime(mime) || isTextLikeMime(mime);
}

function LockerThumbnail({ path, alt }: { path: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 5).then(({ data }) => {
      if (!cancelled && data?.signedUrl) setUrl(data.signedUrl);
    });
    return () => { cancelled = true; };
  }, [path]);
  if (!url) {
    return <div className="mt-2 h-20 w-20 animate-pulse rounded-md bg-muted" />;
  }
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      className="mt-2 h-20 w-20 cursor-zoom-in rounded-md border object-cover"
    />
  );
}

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
  shared_with_user_ids: string[];
};

type CompassUser = { id: string; name: string; email: string };

type MultipartMeta = {
  uploadStrategy: "parts";
  partCount: number;
  partSize: number;
  contentType: string;
  fileName: string;
};

type ExpiryKey = "1h" | "1d" | "7d" | "never";

const EXPIRY_OPTIONS: { value: ExpiryKey; label: string; seconds: number | null }[] = [
  { value: "1h", label: "1 hour", seconds: 60 * 60 },
  { value: "1d", label: "1 day", seconds: 60 * 60 * 24 },
  { value: "7d", label: "7 days", seconds: 60 * 60 * 24 * 7 },
  { value: "never", label: "Never", seconds: null },
];

const BUCKET = "compass-artifacts";
// Standard supabase-js POST uploads cap at ~50MB; above that we use TUS resumable (up to 5GB).
const STANDARD_UPLOAD_LIMIT = 50 * 1024 * 1024;
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB app cap
const PART_UPLOAD_SIZE = 45 * 1024 * 1024;

function parseMultipartMeta(item: LockerItem): MultipartMeta | null {
  if (!item.content) return null;
  try {
    const parsed = JSON.parse(item.content) as Partial<MultipartMeta>;
    if (parsed.uploadStrategy === "parts" && typeof parsed.partCount === "number") {
      return parsed as MultipartMeta;
    }
  } catch {
    return null;
  }
  return null;
}

function partPath(path: string, index: number) {
  return `${path}.part-${String(index).padStart(5, "0")}`;
}

function multipartPaths(path: string, partCount: number) {
  return Array.from({ length: partCount }, (_, idx) => partPath(path, idx));
}

function getUploadErrorMessage(error: unknown) {
  const err = error as {
    message?: string;
    originalResponse?: { getStatus?: () => number; getBody?: () => string };
  };
  const status = err?.originalResponse?.getStatus?.();
  const body = err?.originalResponse?.getBody?.();
  const details = body || err?.message || "unknown error";
  return status ? `${status}: ${details}` : details;
}

async function resumableUpload(
  file: File,
  path: string,
  contentType: string,
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void,
): Promise<void> {
  const tus = await import("tus-js-client");
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
  const projectUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const endpoint = projectId
    ? `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`
    : `${projectUrl}/storage/v1/upload/resumable`;

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${token}`,
        "x-upsert": "false",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: BUCKET,
        objectName: path,
        contentType,
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024,
      onProgress,
      onError: (err) => reject(err),
      onSuccess: () => resolve(),
    });
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) upload.resumeFromPreviousUpload(previousUploads[0]);
      upload.start();
    }).catch(reject);
  });
}

async function uploadFileInParts(
  file: File,
  path: string,
  contentType: string,
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void,
): Promise<MultipartMeta> {
  const partCount = Math.ceil(file.size / PART_UPLOAD_SIZE);
  let uploaded = 0;

  for (let i = 0; i < partCount; i++) {
    const start = i * PART_UPLOAD_SIZE;
    const end = Math.min(start + PART_UPLOAD_SIZE, file.size);
    const blob = file.slice(start, end, "application/octet-stream");
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(partPath(path, i), blob, { contentType: "application/octet-stream", upsert: false });
    if (error) {
      const uploadedPaths = Array.from({ length: i }, (_, idx) => partPath(path, idx));
      if (uploadedPaths.length) await supabase.storage.from(BUCKET).remove(uploadedPaths);
      throw error;
    }
    uploaded += end - start;
    onProgress?.(uploaded, file.size);
  }

  return {
    uploadStrategy: "parts",
    partCount,
    partSize: PART_UPLOAD_SIZE,
    contentType,
    fileName: file.name,
  };
}

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
  const [bulkTarget, setBulkTarget] = useState<"view" | "all" | null>(null);
  const [purging, setPurging] = useState(false);
  const [compassUsers, setCompassUsers] = useState<CompassUser[]>([]);
  const [previewItem, setPreviewItem] = useState<LockerItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, status")
        .eq("status", "active")
        .order("first_name", { ascending: true });
      const list: CompassUser[] = (data || [])
        .filter((p: any) => p.id !== user.id)
        .map((p: any) => {
          const name = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
          return { id: p.id, name: name || p.email, email: p.email };
        });
      setCompassUsers(list);
    })();
  }, [user]);

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

  // Record an access event for the audit trail. Never blocks the UI.
  const logAccess = useCallback(
    (action: string, item: LockerItem, detail?: string) => {
      if (!user) return;
      void supabase
        .from("compass_locker_audit")
        .insert({
          item_id: item.id,
          owner_id: item.user_id,
          actor_id: user.id,
          action,
          file_name: item.title,
          detail: detail ?? null,
        })
        .then(() => undefined, () => undefined);
    },
    [user],
  );

  useEffect(() => {
    if (!user) return;
    // Hard-delete anything past its retention window (storage objects + rows)
    // before rendering, so expired files never linger on the server.
    void supabase.functions
      .invoke("compass-locker-purge")
      .catch(() => undefined)
      .finally(() => {
        void loadItems();
      });
  }, [loadItems, user]);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.kind === filter)),
    [items, filter],
  );
  const ownedCount = useMemo(
    () => items.filter((i) => i.user_id === user?.id).length,
    [items, user],
  );
  const ownedInViewCount = useMemo(
    () => filtered.filter((i) => i.user_id === user?.id).length,
    [filtered, user],
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
    let succeeded = 0;
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB — over the 2GB limit`);
          continue;
        }
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
        const path = `${user.id}/locker/${Date.now()}-${safeName}`;
        const isZip = /\.zip$/i.test(file.name);
        const contentType = isZip ? "application/zip" : (file.type || "application/octet-stream");
        const useChunkedParts = isZip && file.size > STANDARD_UPLOAD_LIMIT;
        const useResumable = file.size > STANDARD_UPLOAD_LIMIT && !useChunkedParts;
        const sizeLabel = `${(file.size / (1024 * 1024)).toFixed(1)}MB`;
        let multipartMeta: MultipartMeta | null = null;
        if (useResumable || useChunkedParts) {
          toast.info(`Uploading ${file.name} (${sizeLabel})… 0%`, { id: `up-${path}` });
        }
        try {
          if (useChunkedParts) {
            multipartMeta = await uploadFileInParts(file, path, contentType, (bytesUploaded, bytesTotal) => {
              const pct = Math.min(100, Math.round((bytesUploaded / bytesTotal) * 100));
              toast.info(`Uploading ${file.name} (${sizeLabel})… ${pct}%`, { id: `up-${path}` });
            });
          } else if (useResumable) {
            await resumableUpload(file, path, contentType, (bytesUploaded, bytesTotal) => {
              const pct = Math.min(100, Math.round((bytesUploaded / bytesTotal) * 100));
              toast.info(`Uploading ${file.name} (${sizeLabel})… ${pct}%`, { id: `up-${path}` });
            });
          } else {
            const { error: upErr } = await supabase.storage
              .from(BUCKET)
              .upload(path, file, { contentType, upsert: false });
            if (upErr) throw upErr;
          }
        } catch (e: any) {
          console.error("Locker upload error:", e);
          if (!useResumable) {
            toast.error(`Upload failed: ${file.name} — ${getUploadErrorMessage(e)}`, { id: `up-${path}` });
            continue;
          }

          toast.info(`Retrying ${file.name} in backend-safe parts…`, { id: `up-${path}` });
          try {
            multipartMeta = await uploadFileInParts(file, path, contentType, (bytesUploaded, bytesTotal) => {
              const pct = Math.min(100, Math.round((bytesUploaded / bytesTotal) * 100));
              toast.info(`Uploading ${file.name} (${sizeLabel})… ${pct}%`, { id: `up-${path}` });
            });
          } catch (partError: any) {
            console.error("Locker chunked upload error:", partError);
            toast.error(`Upload failed: ${file.name} — ${getUploadErrorMessage(partError)}`, { id: `up-${path}` });
            continue;
          }
        }

        const { error: insErr } = await supabase.from("compass_locker_items").insert({
          user_id: user.id,
          kind: "file",
          title: file.name,
          content: multipartMeta ? JSON.stringify(multipartMeta) : null,
          storage_path: path,
          mime_type: contentType,
          size_bytes: file.size,
          expires_at: expiryFromKey(expiry),
        });
        if (insErr) {
          console.error("Locker insert error:", insErr);
          const cleanupPaths = multipartMeta ? multipartPaths(path, multipartMeta.partCount) : [path];
          await supabase.storage.from(BUCKET).remove(cleanupPaths);
          toast.error(`Save failed: ${file.name} — ${insErr.message}`);
          continue;
        }
        succeeded++;
      }
      if (succeeded > 0) toast.success(`Uploaded ${succeeded} file${succeeded === 1 ? "" : "s"}`);
      void loadItems();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  /** Permanently remove a set of items I own: storage objects first, then rows. */
  const purgeItems = async (targets: LockerItem[], label: string) => {
    if (!user) return;
    const mine = targets.filter((i) => i.user_id === user.id);
    if (mine.length === 0) {
      toast.info("Nothing to clear — you can only permanently delete files you own.");
      return;
    }
    setPurging(true);
    try {
      const paths = mine.flatMap((item) => {
        if (!item.storage_path) return [];
        const multipart = parseMultipartMeta(item);
        return multipart
          ? multipartPaths(item.storage_path, multipart.partCount)
          : [item.storage_path];
      });
      for (let i = 0; i < paths.length; i += 100) {
        const { error } = await supabase.storage.from(BUCKET).remove(paths.slice(i, i + 100));
        if (error) console.error("bulk purge storage error:", error.message);
      }
      const ids = mine.map((i) => i.id);
      const { error } = await supabase
        .from("compass_locker_items")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      mine.forEach((item) => logAccess("bulk_delete", item, `Permanently cleared (${label})`));
      setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
      toast.success(`Permanently deleted ${mine.length} item${mine.length === 1 ? "" : "s"}`);
    } finally {
      setPurging(false);
      setBulkTarget(null);
    }
  };

  const handlePurgeExpiredNow = async () => {
    setPurging(true);
    try {
      const { data, error } = await supabase.functions.invoke("compass-locker-purge");
      if (error) {
        toast.error("Purge failed");
        return;
      }
      const purged = (data as { purged?: number } | null)?.purged ?? 0;
      toast.success(
        purged > 0
          ? `Purged ${purged} expired item${purged === 1 ? "" : "s"} from storage and the database`
          : "No expired items to purge",
      );
      await loadItems();
    } finally {
      setPurging(false);
    }
  };

  const handleDelete = async (item: LockerItem) => {
    if (!confirm("Delete this item permanently? The file is removed from storage and cannot be recovered.")) return;
    if (item.storage_path) {
      const multipart = parseMultipartMeta(item);
      const paths = multipart ? multipartPaths(item.storage_path, multipart.partCount) : [item.storage_path];
      await supabase.storage.from(BUCKET).remove(paths);
    }
    const { error } = await supabase
      .from("compass_locker_items")
      .delete()
      .eq("id", item.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    logAccess("delete", item, "Item and stored file permanently deleted");
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };
  const handlePreview = async (item: LockerItem) => {
    if (!item.storage_path) return;
    const multipart = parseMultipartMeta(item);
    if (multipart) {
      await handleDownload(item);
      return;
    }
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(item.storage_path, 120);
    if (error || !data?.signedUrl) {
      toast.error("Could not open preview");
      return;
    }
    logAccess("preview", item);
    if (isPreviewableInBrowser(item.mime_type)) {
      setPreviewItem(item);
      setPreviewUrl(data.signedUrl);
    } else {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    }
  };


  const handleCopyText = async (item: LockerItem) => {
    if (!item.content) return;
    await navigator.clipboard.writeText(item.content);
    toast.success("Copied");
  };

  const handleDownload = async (item: LockerItem) => {
    if (!item.storage_path) return;
    logAccess("download", item);
    const multipart = parseMultipartMeta(item);
    if (multipart) {
      toast.info(`Preparing ${item.title || multipart.fileName}…`);
      const chunks: Blob[] = [];
      for (const path of multipartPaths(item.storage_path, multipart.partCount)) {
        const { data, error } = await supabase.storage.from(BUCKET).download(path);
        if (error || !data) {
          toast.error(`Could not download ${item.title || multipart.fileName}`);
          return;
        }
        chunks.push(data);
      }
      const blob = new Blob(chunks, { type: multipart.contentType || item.mime_type || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.title || multipart.fileName || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      return;
    }
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(item.storage_path, 120, { download: item.title || true });
    if (error || !data?.signedUrl) {
      toast.error("Could not create download link");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async (item: LockerItem) => {
    if (!item.storage_path) return;
    logAccess("copy_link", item, "Short-lived signed link created (15 minutes)");
    if (parseMultipartMeta(item)) {
      toast.info("Large split files must be downloaded from Compass Locker.");
      return;
    }
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(item.storage_path, 60 * 15);
    if (error || !data?.signedUrl) {
      toast.error("Could not create link");
      return;
    }
    await navigator.clipboard.writeText(data.signedUrl);
    toast.success("Signed link copied (expires in 15 minutes)");
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

  const toggleShare = async (item: LockerItem, targetId: string) => {
    const current = item.shared_with_user_ids || [];
    const next = current.includes(targetId)
      ? current.filter((id) => id !== targetId)
      : [...current, targetId];
    const { error } = await supabase
      .from("compass_locker_items")
      .update({ shared_with_user_ids: next })
      .eq("id", item.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    logAccess(
      next.includes(targetId) ? "share_granted" : "share_revoked",
      item,
      `Recipient: ${targetId}`,
    );
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, shared_with_user_ids: next } : i)),
    );
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
      <header className="space-y-2">
        <Button asChild variant="ghost" size="sm" className="h-8 -ml-2 gap-1 text-muted-foreground hover:text-foreground">
          <Link to="/admin/personal-ai"><ArrowLeft className="h-4 w-4" /> Back to Compass</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Compass Locker</h1>
        <p className="text-sm text-muted-foreground">
          Your private relay for text and files. Drag files anywhere on this page. Items are visible only to you unless you explicitly share them with another Compass user.
        </p>
        <p className="text-xs text-muted-foreground/80">
          Security: files are stored encrypted at rest, served only through short-lived signed links, and every view, download, link, share, and delete is logged. When an item reaches its expiry it is permanently deleted from storage and the database — no recovery, no archive copy.
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
          Max 2GB per file (large files use resumable upload). Items past their expiry are hidden automatically.
        </p>
        <details className="group rounded-md border border-border/60 bg-muted/30 p-3">
          <summary className="cursor-pointer text-xs font-medium text-foreground">
            How deletion and retention actually work
          </summary>
          <div className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">On expiry.</span> Once an item passes its
              retention date it is hidden from every view at the database level, so it can no longer be
              previewed, downloaded, or shared — even by you. A purge job then hard-deletes it: the
              storage objects are erased and the database row is removed permanently.
            </p>
            <p>
              <span className="font-medium text-foreground">On manual delete.</span> Deleting is
              immediate and permanent. All stored objects (including every part of a chunked large
              upload) are erased from storage, and the database record is deleted outright rather than
              flagged — no filename, text body, note, or share list is left behind. Existing share
              links and signed URLs stop resolving right away.
            </p>
            <p>
              <span className="font-medium text-foreground">What is kept.</span> Only an audit entry
              recording the action, the actor, and the timestamp, retained for compliance. It never
              stores file contents. There is no recycle bin, soft-delete window, or self-serve
              restore; encrypted platform-level infrastructure backups roll off on their own schedule
              and are not accessible from the app.
            </p>
          </div>
        </details>

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
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {filtered.length} item{filtered.length === 1 ? "" : "s"}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={purging}>
                {purging ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
                <span className="sr-only">Locker actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Retention</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => void handlePurgeExpiredNow()}>
                <Timer className="mr-2 h-4 w-4" />
                Purge expired items now
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Permanent deletion</DropdownMenuLabel>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setBulkTarget("view")}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear items in this view
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setBulkTarget("all")}
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Clear everything I own
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={bulkTarget !== null} onOpenChange={(open) => !open && setBulkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkTarget === "all"
                ? "Permanently delete all of your locker items?"
                : "Permanently delete the items in this view?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  This affects {bulkTarget === "all" ? ownedCount : ownedInViewCount} item
                  {(bulkTarget === "all" ? ownedCount : ownedInViewCount) === 1 ? "" : "s"} you own.
                  Here is exactly what happens:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    Every stored object is erased from file storage, including all parts of chunked
                    large uploads and any generated thumbnails.
                  </li>
                  <li>
                    The database row is deleted outright — not flagged or archived — so no filename,
                    text content, note, or share list remains in the table.
                  </li>
                  <li>
                    All existing share links and signed URLs stop working immediately, and anyone you
                    shared with loses access at once.
                  </li>
                  <li>
                    Only a tamper-evident audit entry (who deleted what, and when) is retained for
                    compliance. It records the event, never the file contents.
                  </li>
                  <li>
                    There is no recycle bin, no soft-delete window, and no restore. Encrypted
                    infrastructure backups age out on their own rolling schedule and are not
                    user-accessible.
                  </li>
                </ul>
                <p>Items owned by other people are never touched.</p>
              </div>
            </AlertDialogDescription>

          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void purgeItems(
                  bulkTarget === "all" ? items : filtered,
                  bulkTarget === "all" ? "all owned items" : `filter: ${filter}`,
                );
              }}
            >
              {purging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  {item.kind === "file" &&
                    item.storage_path &&
                    !parseMultipartMeta(item) &&
                    isImageMime(item.mime_type) && (
                      <button
                        type="button"
                        onClick={() => void handlePreview(item)}
                        className="block"
                        title="Click to preview"
                      >
                        <LockerThumbnail path={item.storage_path} alt={item.title || "image"} />
                      </button>
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
                        onClick={() => void handlePreview(item)}
                        title="Preview / open in new tab"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8 relative",
                            (item.shared_with_user_ids?.length ?? 0) > 0 && "text-primary",
                          )}
                          title="Share with Compass users"
                        >
                          <Users className="h-4 w-4" />
                          {(item.shared_with_user_ids?.length ?? 0) > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 rounded-full bg-primary px-1 text-[9px] leading-3 text-primary-foreground">
                              {item.shared_with_user_ids.length}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-64 p-0">
                        <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
                          Share with
                        </div>
                        <div className="max-h-64 overflow-auto py-1">
                          {compassUsers.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-muted-foreground">
                              No other Compass users found.
                            </div>
                          ) : (
                            compassUsers.map((u) => {
                              const checked = (item.shared_with_user_ids || []).includes(u.id);
                              return (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => void toggleShare(item, u.id)}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted"
                                >
                                  <span className="flex h-4 w-4 items-center justify-center rounded border">
                                    {checked && <Check className="h-3 w-3" />}
                                  </span>
                                  <span className="min-w-0 flex-1 truncate">
                                    {u.name}
                                    <span className="ml-1 text-[10px] text-muted-foreground">
                                      {u.email}
                                    </span>
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
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

      <Dialog
        open={!!previewItem}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewItem(null);
            setPreviewUrl(null);
          }
        }}
      >
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle className="flex items-center justify-between gap-3">
              <span className="truncate text-sm">
                {previewItem?.title || "Preview"}
              </span>
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground underline"
                >
                  Open in new tab
                </a>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted/30">
            {previewItem && previewUrl && (
              <>
                {isImageMime(previewItem.mime_type) && (
                  <div className="flex max-h-[80vh] items-center justify-center overflow-auto p-2">
                    <img
                      src={previewUrl}
                      alt={previewItem.title || "preview"}
                      className="max-h-[78vh] w-auto object-contain"
                    />
                  </div>
                )}
                {(isPdfMime(previewItem.mime_type) ||
                  isTextLikeMime(previewItem.mime_type)) && (
                  <iframe
                    src={previewUrl}
                    title={previewItem.title || "preview"}
                    className="h-[80vh] w-full border-0 bg-white"
                  />
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
