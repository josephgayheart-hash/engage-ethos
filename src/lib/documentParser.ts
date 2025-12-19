/**
 * Document parsing utilities for extracting text from various file formats
 * Supports: .txt, .md, .html, .doc, .docx, .pdf
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;

export const SUPPORTED_DOCUMENT_TYPES = [
  'text/plain',
  'text/markdown',
  'text/html',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

export const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.html', '.htm', '.doc', '.docx', '.pdf'];

export function getAcceptString(): string {
  return '.txt,.md,.html,.htm,.doc,.docx,.pdf';
}

export function isSupported(file: File): boolean {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(extension) || SUPPORTED_DOCUMENT_TYPES.includes(file.type);
}

export function getFileExtension(file: File): string {
  return '.' + (file.name.split('.').pop()?.toLowerCase() || '');
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
      return { text, success: true };
    }

    // Word documents (.docx, .doc)
    if (['.docx', '.doc'].includes(extension)) {
      const text = await extractTextFromWord(file);
      if (text && text.length > 20) {
        return { text, success: true };
      }
      return {
        text: '',
        success: false,
        message: 'Could not extract text from Word document. Please copy and paste the content directly.',
      };
    }

    // PDF files - use pdf.js for proper extraction
    if (extension === '.pdf') {
      const result = await extractTextFromPdf(file);
      return result;
    }

    return {
      text: '',
      success: false,
      message: 'Unsupported file type. Please use .txt, .docx, or .pdf files.',
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
async function extractTextFromWord(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const decoder = new TextDecoder('utf-8');
  const rawContent = decoder.decode(arrayBuffer);

  // Try to extract from DOCX XML structure
  const textMatches = rawContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (textMatches && textMatches.length > 0) {
    const text = textMatches
      .map(match => match.replace(/<[^>]+>/g, ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (text.length > 20) {
      return text;
    }
  }

  // Fallback: try to extract any readable text
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
    return words.join(' ');
  }

  return '';
}

/**
 * Extract text from PDF files using pdf.js
 * Handles compressed streams and complex PDF structures
 */
async function extractTextFromPdf(file: File): Promise<{
  text: string;
  success: boolean;
  message?: string;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const numPages = pdf.numPages;
    const textParts: string[] = [];
    let hasTextContent = false;
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items, respecting spacing
        let lastY: number | null = null;
        let pageText = '';
        
        for (const item of textContent.items) {
          if ('str' in item && item.str) {
            // Check if we need a newline (different Y position)
            if ('transform' in item && lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
              pageText += '\n';
            }
            pageText += item.str;
            if ('transform' in item) {
              lastY = item.transform[5];
            }
            if (item.str.trim().length > 0) {
              hasTextContent = true;
            }
          }
        }
        
        if (pageText.trim()) {
          textParts.push(pageText.trim());
        }
      } catch (pageError) {
        console.warn(`Error extracting text from page ${pageNum}:`, pageError);
      }
    }
    
    const combinedText = textParts.join('\n\n').trim();
    
    // Check if we got meaningful text
    if (!hasTextContent || combinedText.length < 20) {
      return {
        text: '',
        success: false,
        message: 'This PDF appears to be scanned or image-based without searchable text. Please use a PDF with OCR (searchable text), or copy and paste the content directly.',
      };
    }
    
    // Check if the text looks garbled (mostly non-word characters)
    const words = combinedText.split(/\s+/).filter(w => /^[a-zA-Z]{2,}/.test(w));
    const wordRatio = words.length / (combinedText.split(/\s+/).length || 1);
    
    if (wordRatio < 0.3) {
      return {
        text: '',
        success: false,
        message: 'Could not extract readable text from this PDF. The file may use custom fonts or encoding. Please copy and paste the content directly.',
      };
    }
    
    return {
      text: combinedText,
      success: true,
      message: `Extracted text from ${numPages} page${numPages > 1 ? 's' : ''}.`,
    };
    
  } catch (error) {
    console.error('PDF parsing error:', error);
    
    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        return {
          text: '',
          success: false,
          message: 'This file does not appear to be a valid PDF. Please check the file and try again.',
        };
      }
      if (error.message.includes('password')) {
        return {
          text: '',
          success: false,
          message: 'This PDF is password-protected. Please provide an unprotected version or paste the content directly.',
        };
      }
    }
    
    return {
      text: '',
      success: false,
      message: 'Error reading PDF file. Please try a different file or paste the content directly.',
    };
  }
}
