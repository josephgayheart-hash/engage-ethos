/**
 * Document parsing utilities for extracting text from various file formats
 * Supports: .txt, .md, .html, .doc, .docx, .pdf (basic text extraction)
 */

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
 * Basic extraction that works for PDFs with uncompressed text streams
 */
async function extractTextFromPdf(file: File): Promise<{
  text: string;
  success: boolean;
  message?: string;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Check if it's a valid PDF
    const header = String.fromCharCode(...bytes.slice(0, 8));
    if (!header.startsWith('%PDF')) {
      return {
        text: '',
        success: false,
        message: 'This file does not appear to be a valid PDF.',
      };
    }

    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(arrayBuffer);

    // Check for encryption
    if (content.includes('/Encrypt')) {
      return {
        text: '',
        success: false,
        message: 'This PDF is password-protected or encrypted. Please provide an unprotected version or paste the content directly.',
      };
    }

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
      // Look for readable text sequences in uncompressed streams
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
    if (combinedText.length < 20) {
      return {
        text: '',
        success: false,
        message: 'This PDF appears to be scanned or image-based without searchable text (no OCR). Please use a PDF that has been OCR-processed, or copy and paste the text content directly.',
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
        message: 'Could not extract readable text from this PDF. The file may use embedded fonts or compression that prevents text extraction. Please copy and paste the content directly.',
      };
    }

    return {
      text: combinedText,
      success: true,
      message: 'PDF text extracted successfully.',
    };

  } catch (error) {
    console.error('PDF parsing error:', error);
    return {
      text: '',
      success: false,
      message: 'Error reading PDF file. Please try a different file or paste the content directly.',
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
