/**
 * Document parsing utilities for extracting text from various file formats
 * Supports: .txt, .md, .html, .doc, .docx, .pdf (basic extraction)
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

    // PDF files - basic extraction attempt
    if (extension === '.pdf') {
      const text = await extractTextFromPdf(file);
      if (text && text.length > 20) {
        return { 
          text, 
          success: true,
          message: 'PDF text extracted. For best results, verify the content is complete.',
        };
      }
      return {
        text: '',
        success: false,
        message: 'Could not extract text from PDF. Please copy and paste the content directly.',
      };
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
 * Extract text from PDF files
 * Basic extraction - looks for text streams in PDF structure
 */
async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const content = decoder.decode(arrayBuffer);

  // Try to find text content in PDF streams
  const textParts: string[] = [];

  // Look for text between BT (Begin Text) and ET (End Text) markers
  const textBlocks = content.match(/BT[\s\S]*?ET/g) || [];
  for (const block of textBlocks) {
    // Extract text from Tj and TJ operators
    const tjMatches = block.match(/\(([^)]*)\)\s*Tj/g) || [];
    const tjTexts = block.match(/\[([^\]]*)\]\s*TJ/g) || [];
    
    for (const match of tjMatches) {
      const text = match.replace(/\(([^)]*)\)\s*Tj/, '$1');
      if (text && /[a-zA-Z]/.test(text)) {
        textParts.push(text);
      }
    }
    
    for (const match of tjTexts) {
      const innerText = match.match(/\(([^)]*)\)/g) || [];
      for (const t of innerText) {
        const cleaned = t.replace(/[()]/g, '');
        if (cleaned && /[a-zA-Z]/.test(cleaned)) {
          textParts.push(cleaned);
        }
      }
    }
  }

  // Also try to find readable sequences
  const readableMatches = content.match(/[A-Za-z][A-Za-z0-9\s.,!?'"()-]{20,}/g) || [];
  textParts.push(...readableMatches);

  // Clean and combine
  const combined = textParts
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\s]/g, '')
    .trim();

  return combined;
}
