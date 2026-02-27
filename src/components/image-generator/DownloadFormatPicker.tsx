import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export type DownloadFormat = "png" | "jpg" | "pdf";

interface DownloadFormatPickerProps {
  targetRef?: React.RefObject<HTMLElement>;
  targetId?: string;
  filenameBase?: string;
  className?: string;
  size?: "sm" | "default";
  variant?: "default" | "outline";
  label?: string;
}

async function captureElement(el: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: null,
  });
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string, format: DownloadFormat) {
  if (format === "pdf") {
    const imgData = canvas.toDataURL("image/png");
    const w = canvas.width;
    const h = canvas.height;
    const orientation = w > h ? "l" : "p";
    const pdf = new jsPDF(orientation as any, "px", [w, h]);
    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save(`${filename}.pdf`);
  } else {
    const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

export function DownloadFormatPicker({
  targetRef,
  targetId,
  filenameBase = "branded-image",
  className,
  size = "sm",
  variant = "default",
  label = "Download",
}: DownloadFormatPickerProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (format: DownloadFormat) => {
    const el = targetRef?.current || (targetId ? document.getElementById(targetId) : null);
    if (!el) {
      toast.error("Nothing to download.");
      return;
    }
    setIsDownloading(true);
    try {
      const canvas = await captureElement(el as HTMLElement);
      const filename = `${filenameBase}-${Date.now()}`;
      downloadCanvas(canvas, filename, format);
      toast.success(`Downloaded as ${format.toUpperCase()}!`);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Download failed. Try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={className} size={size} variant={variant} disabled={isDownloading}>
          {isDownloading ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-1.5" />
          )}
          {label}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload("png")}>
          Download as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("jpg")}>
          Download as JPG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("pdf")}>
          Download as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
