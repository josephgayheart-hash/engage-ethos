/**
 * Document parsing utilities for extracting text from various file formats
 * Supports: .txt, .md, .html, .doc, .docx, .pdf, .png, .jpg, .jpeg (screenshots via AI)
 */

import { supabase } from '@/integrations/supabase/client';
import { extractTextFromPdfWithPdfJs } from '@/lib/pdfTextExtractor';

export const SUPPORTED_DOCUMENT_TYPES = [
  'text/plain',
  'text/markdown',
  'text/html',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

export const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.html', '.htm', '.doc', '.docx', '.pdf', '.png', '.jpg', '.jpeg'];

export function getAcceptString(): string {
  return '.txt,.md,.html,.htm,.doc,.docx,.pdf,.png,.jpg,.jpeg';
}

export function isSupported(file: File): boolean {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(extension) || SUPPORTED_DOCUMENT_TYPES.includes(file.type);
}

export function getFileExtension(file: File): string {
  return '.' + (file.name.split('.').pop()?.toLowerCase() || '');
}

export function isImageFile(file: File): boolean {
  const extension = getFileExtension(file);
  return ['.png', '.jpg', '.jpeg'].includes(extension) || file.type.startsWith('image/');
}

/**
 * Extract text content from a file
 * Returns an object with the extracted text and whether full parsing was successful
 */
export async function extractTextFromFile(file: File): Promise<{
  text: string;
  success: boolean;
  message?: string;
}> {
  const extension = getFileExtension(file);

  try {
    // Plain text files - direct read
    if (['.txt', '.md', '.html', '.htm'].includes(extension) || file.type === 'text/plain') {
      const text = await file.text();
      if (text.trim().length < 20) {
        return {
          text: '',
          success: false,
          message: 'File does not contain enough text content (minimum 20 characters).',
        };
      }
      return { text, success: true };
    }

    // Word documents (.docx, .doc)
    if (['.docx', '.doc'].includes(extension)) {
      const result = await extractTextFromWord(file);
      return result;
    }

    // PDF files
    if (extension === '.pdf') {
      const result = await extractTextFromPdf(file);
      return result;
    }

    // Image files (screenshots) - use AI vision
    if (isImageFile(file)) {
      const result = await extractTextFromImage(file);
      return result;
    }

    return {
      text: '',
      success: false,
      message: 'Unsupported file type. Please use .txt, .docx, .pdf, or image files (.png, .jpg).',
    };
  } catch (error) {
    console.error('Error extracting text:', error);
    return {
      text: '',
      success: false,
      message: 'Error reading file. Please try a different file or paste content directly.',
    };
  }
}

/**
 * Extract text from Word documents (.docx, .doc)
 * Uses basic XML parsing for .docx files
 */
async function extractTextFromWord(file: File): Promise<{
  text: string;
  success: boolean;
  message?: string;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawContent = decoder.decode(arrayBuffer);

    // Try to extract from DOCX XML structure (w:t tags contain text)
    const textMatches = rawContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (textMatches && textMatches.length > 0) {
      const text = textMatches
        .map(match => match.replace(/<[^>]+>/g, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (text.length > 20) {
        return { text, success: true };
      }
    }

    // Fallback: try to extract any readable text from XML
    const cleanText = rawContent
      .replace(/<[^>]+>/g, ' ')
      .replace(/[^\x20-\x7E\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Filter out binary garbage - look for sequences of readable words
    const words = cleanText.split(' ').filter(word => 
      word.length > 1 && 
      word.length < 30 && 
      /^[a-zA-Z0-9.,!?'"()-]+$/.test(word)
    );

    if (words.length > 10) {
      return { text: words.join(' '), success: true };
    }

    return {
      text: '',
      success: false,
      message: 'Could not extract text from this Word document. The file may be corrupted or in an unsupported format. Please copy and paste the content directly.',
    };
  } catch (error) {
    console.error('Word extraction error:', error);
    return {
      text: '',
      success: false,
      message: 'Error reading Word document. Please try copying and pasting the content directly.',
    };
  }
}

/**
 * Extract text from PDF files
 * Uses PDF.js (client-side) so we can handle large PDFs without backend limits.
 * Falls back to AI OCR only for smaller PDFs that appear to be scanned.
 */
async function extractTextFromPdf(file: File): Promise<{
  text: string;
  success: boolean;
  message?: string;
}> {
  // 1) Try PDF.js extraction (works for embedded fonts, compression, and large PDFs)
  const pdfJsResult = await extractTextFromPdfWithPdfJs(file);
  if (pdfJsResult.success) return pdfJsResult;

  // 2) If it looks like the PDF has no selectable text, try AI OCR for SMALL PDFs only
  const MAX_AI_PDF_MB = 5;
  const sizeMb = file.size / (1024 * 1024);

  if (sizeMb <= MAX_AI_PDF_MB) {
    return await extractPdfWithAI(file);
  }

  return {
    text: '',
    success: false,
    message:
      pdfJsResult.message ||
      `This PDF is ${sizeMb.toFixed(1)}MB and appears to have little/no selectable text (likely scanned). Please export an OCR'd version, upload key pages as screenshots (.png/.jpg), or paste the relevant text.`,
  };
}

/**
 * Try basic PDF text extraction (works for simple, uncompressed PDFs)
 */
function tryBasicPdfExtraction(content: string): {
  text: string;
  success: boolean;
  message?: string;
} {
  const textParts: string[] = [];

  // Method 1: Extract text between BT (Begin Text) and ET (End Text) markers
  const textBlocks = content.match(/BT[\s\S]*?ET/g) || [];
  for (const block of textBlocks) {
    // Extract text from Tj operator (single string)
    const tjMatches = block.match(/\(([^)]+)\)\s*Tj/g) || [];
    for (const match of tjMatches) {
      const text = match.replace(/\(([^)]+)\)\s*Tj/, '$1');
      if (text && /[a-zA-Z]/.test(text)) {
        textParts.push(decodePdfString(text));
      }
    }
    
    // Extract text from TJ operator (array of strings)
    const tjArrayMatches = block.match(/\[([^\]]+)\]\s*TJ/g) || [];
    for (const match of tjArrayMatches) {
      const innerStrings = match.match(/\(([^)]*)\)/g) || [];
      for (const str of innerStrings) {
        const cleaned = str.replace(/[()]/g, '');
        if (cleaned && /[a-zA-Z]/.test(cleaned)) {
          textParts.push(decodePdfString(cleaned));
        }
      }
    }
  }

  // Method 2: Look for stream contents with readable text
  const streamMatches = content.match(/stream\s*([\s\S]*?)\s*endstream/g) || [];
  for (const stream of streamMatches) {
    const readableText = stream.match(/[A-Za-z][A-Za-z0-9\s.,!?'"()\-:;]{15,}/g) || [];
    textParts.push(...readableText);
  }

  // Clean and combine
  let combinedText = textParts
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\s]/g, '')
    .trim();

  // Remove duplicate fragments
  const sentences = combinedText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const uniqueSentences = [...new Set(sentences)];
  combinedText = uniqueSentences.join('. ').trim();

  // Check if we got meaningful content
  if (combinedText.length < 50) {
    return {
      text: '',
      success: false,
      message: 'Basic extraction did not find enough text.',
    };
  }

  // Check quality of extracted text
  const wordCount = combinedText.split(/\s+/).filter(w => /^[a-zA-Z]{2,}$/.test(w)).length;
  const totalWords = combinedText.split(/\s+/).length;
  const wordRatio = wordCount / (totalWords || 1);

  if (wordRatio < 0.3) {
    return {
      text: '',
      success: false,
      message: 'Extracted text quality is too low.',
    };
  }

  return {
    text: combinedText,
    success: true,
    message: 'PDF text extracted successfully.',
  };
}

/**
 * Extract PDF text using AI vision (handles scanned PDFs, complex layouts, etc.)
 * Note: Has file size limits due to edge function memory constraints
 */
async function extractPdfWithAI(file: File): Promise<{
  text: string;
  success: boolean;
  message?: string;
}> {
  // Check file size - AI extraction has limits (~5MB max for reliable processing)
  const MAX_SIZE_MB = 5;
  const fileSizeMB = file.size / (1024 * 1024);
  
  if (fileSizeMB > MAX_SIZE_MB) {
    return {
      text: '',
      success: false,
      message: `This PDF is too large (${fileSizeMB.toFixed(1)}MB) for AI text extraction. Please use a smaller PDF (under ${MAX_SIZE_MB}MB) or copy and paste the text content directly.`,
    };
  }

  try {
    // Convert PDF to base64
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Use chunked base64 encoding to avoid call stack issues with large files
    let binary = '';
    const chunkSize = 32768;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64 = btoa(binary);

    // Call the edge function to extract text using AI
    const { data, error } = await supabase.functions.invoke('extract-text-from-image', {
      body: {
        imageBase64: base64,
        mimeType: 'application/pdf',
        isPdf: true,
      },
    });

    if (error) {
      console.error('PDF AI extraction error:', error);
      
      // Check for specific error types
      if (error.message?.includes('WORKER_LIMIT') || error.message?.includes('compute resources')) {
        return {
          text: '',
          success: false,
          message: 'This PDF is too complex for AI processing. Please try a smaller or simpler PDF, or copy and paste the text content directly.',
        };
      }
      
      return {
        text: '',
        success: false,
        message: 'Error processing PDF with AI. Please paste the content directly.',
      };
    }

    if (!data.success) {
      return {
        text: '',
        success: false,
        message: data.message || 'Could not extract text from this PDF.',
      };
    }

    return {
      text: data.text,
      success: true,
      message: 'PDF text extracted successfully using AI.',
    };

  } catch (error) {
    console.error('PDF AI extraction error:', error);
    return {
      text: '',
      success: false,
      message: 'Error processing PDF. Please paste the content directly.',
    };
  }
}

/**
 * Extract text from image files (screenshots) using AI vision
 */
async function extractTextFromImage(file: File): Promise<{
  text: string;
  success: boolean;
  message?: string;
}> {
  try {
    // Convert image to base64
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    // Call the edge function to extract text using AI vision
    const { data, error } = await supabase.functions.invoke('extract-text-from-image', {
      body: {
        imageBase64: base64,
        mimeType: file.type || 'image/png',
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      return {
        text: '',
        success: false,
        message: 'Error processing screenshot. Please try again or paste the content directly.',
      };
    }

    if (!data.success) {
      return {
        text: '',
        success: false,
        message: data.message || 'Could not extract text from this image.',
      };
    }

    return {
      text: data.text,
      success: true,
      message: data.message || 'Screenshot text extracted successfully.',
    };

  } catch (error) {
    console.error('Image extraction error:', error);
    return {
      text: '',
      success: false,
      message: 'Error processing screenshot. Please paste the content directly.',
    };
  }
}

/**
 * Decode PDF escape sequences in strings
 */
function decodePdfString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}
