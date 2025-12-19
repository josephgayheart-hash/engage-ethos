/**
 * PDF text extraction using PDF.js (client-side)
 * Designed to handle large PDFs without sending the full file to backend functions.
 */

import * as PDFJS from "pdfjs-dist";
// Vite will turn this into a URL at build time
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.min?url";

let workerConfigured = false;

function ensurePdfWorkerConfigured() {
  if (workerConfigured) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (PDFJS as any).GlobalWorkerOptions.workerSrc = workerSrc;
  workerConfigured = true;
}

export async function extractTextFromPdfWithPdfJs(file: File): Promise<{
  text: string;
  success: boolean;
  message?: string;
}> {
  try {
    ensurePdfWorkerConfigured();

    const arrayBuffer = await file.arrayBuffer();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadingTask = (PDFJS as any).getDocument({ data: arrayBuffer });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdf = await (loadingTask as any).promise;

    const parts: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const page = await pdf.getPage(pageNum);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textContent = await page.getTextContent();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageText = (textContent.items as any[])
        .map((it) => (it && typeof it.str === "string" ? it.str : ""))
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (pageText) parts.push(pageText);
    }

    const text = parts.join("\n\n").trim();

    if (text.length < 20) {
      return {
        text: "",
        success: false,
        message:
          "This PDF appears to have no selectable text (it may be scanned). If possible, export an OCR'd PDF, upload key pages as screenshots (.png/.jpg), or paste the relevant text.",
      };
    }

    return {
      text,
      success: true,
      message: "PDF text extracted successfully.",
    };
  } catch (error) {
    console.error("PDF.js extraction error:", error);
    return {
      text: "",
      success: false,
      message:
        "Could not read this PDF. Please try a different PDF or paste the relevant text.",
    };
  }
}
