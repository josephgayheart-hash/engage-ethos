import { useCallback, useState, RefObject } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface UseJourneyExportOptions {
  title?: string;
  containerRef: RefObject<HTMLElement | null>;
}

export const useJourneyExport = ({ title = "Journey", containerRef }: UseJourneyExportOptions) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = useCallback(async () => {
    if (!containerRef.current) {
      toast({
        title: "Export failed",
        description: "No content to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    toast({
      title: "Generating PDF",
      description: "Please wait while we capture your journey...",
    });

    try {
      // Ensure fonts are loaded before capture
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (document as any).fonts?.ready;

      const root = containerRef.current;
      const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-pdf-section]"));
      const exportTargets = sections.length ? sections : [root];

      const commonCanvasOpts = {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (clonedDoc: Document) => {
          const style = clonedDoc.createElement("style");
          style.innerHTML = `
            * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            body { line-height: 1.4; }
            p { line-height: 1.4; }
            .shadow, [class*="shadow"], [class*="backdrop"], [style*="filter"], [style*="backdrop-filter"] {
              filter: none !important;
              backdrop-filter: none !important;
            }
          `;
          clonedDoc.head.appendChild(style);

          const badges = clonedDoc.querySelectorAll('[class*="badge"], [class*="Badge"]');
          badges.forEach((badge) => {
            const el = badge as HTMLElement;
            el.style.display = "inline-flex";
            el.style.alignItems = "center";
            el.style.verticalAlign = "middle";
            el.style.lineHeight = "1";
            el.style.gap = "4px";
            el.style.whiteSpace = "nowrap";
          });

          const flexContainers = clonedDoc.querySelectorAll('[class*="flex"][class*="gap"]');
          flexContainers.forEach((container) => {
            const el = container as HTMLElement;
            el.style.display = "flex";
            el.style.alignItems = "center";
            el.style.flexWrap = "wrap";
          });

          const icons = clonedDoc.querySelectorAll("svg");
          icons.forEach((icon) => {
            const el = icon as unknown as HTMLElement;
            el.style.display = "inline-block";
            el.style.verticalAlign = "middle";
            el.style.flexShrink = "0";
          });
        },
      } as const;

      const canvases: HTMLCanvasElement[] = [];
      for (const target of exportTargets) {
        const canvas = await html2canvas(target, {
          ...commonCanvasOpts,
          windowWidth: target.scrollWidth,
          windowHeight: target.scrollHeight,
        });
        canvases.push(canvas);
      }

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const marginX = 40;
      const headerH = 44;
      const marginBottom = 40;
      const sectionGap = 18;

      const availableWidth = pageWidth - marginX * 2;
      const availableHeight = pageHeight - headerH - marginBottom;

      let pageNum = 1;
      let cursorY = headerH;

      const addHeader = () => {
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `${title} • ${format(new Date(), "MMM d, yyyy")} • Page ${pageNum}`,
          marginX,
          28
        );
      };

      const newPage = () => {
        pdf.addPage();
        pageNum += 1;
        addHeader();
        cursorY = headerH;
      };

      const coverFooter = () => {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, pageHeight - marginBottom, pageWidth, marginBottom, "F");
      };

      addHeader();

      for (const canvas of canvases) {
        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * availableWidth) / canvas.width;

        const remaining = pageHeight - marginBottom - cursorY;

        if (imgHeight > remaining) {
          if (cursorY !== headerH) newPage();
        }

        if (imgHeight <= availableHeight) {
          pdf.addImage(imgData, "PNG", marginX, cursorY, availableWidth, imgHeight, undefined, "FAST");
          coverFooter();
          cursorY += imgHeight + sectionGap;

          if (cursorY > pageHeight - marginBottom - 24) newPage();
          continue;
        }

        // Paginate tall images
        let offset = 0;
        const srcH = canvas.height;
        const srcW = canvas.width;

        while (offset < srcH) {
          const sliceH = Math.min(srcH - offset, (availableHeight * srcW) / availableWidth);
          const sliceRealH = (sliceH * availableWidth) / srcW;

          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = srcW;
          sliceCanvas.height = sliceH;
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(canvas, 0, offset, srcW, sliceH, 0, 0, srcW, sliceH);
          }

          const sliceData = sliceCanvas.toDataURL("image/png");
          pdf.addImage(sliceData, "PNG", marginX, cursorY, availableWidth, sliceRealH, undefined, "FAST");
          coverFooter();

          offset += sliceH;
          if (offset < srcH) newPage();
        }

        cursorY = headerH + ((imgHeight % availableHeight) || availableHeight) + sectionGap;
        if (cursorY > pageHeight - marginBottom - 24) newPage();
      }

      const fileName = `${title.replace(/\s+/g, "-").toLowerCase()}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF exported",
        description: `Your journey has been saved as ${fileName}`,
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [containerRef, title, toast]);

  const printJourney = useCallback(() => {
    window.print();
  }, []);

  return {
    isExporting,
    exportToPdf,
    printJourney,
  };
};
