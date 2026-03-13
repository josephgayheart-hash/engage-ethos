/**
 * PII Scanner — detects personally identifiable information in text and files.
 * Blocks uploads containing SSNs, student IDs, dates of birth, bulk personal
 * data, FERPA-protected records, etc.
 */

export interface PIIMatch {
  type: string;
  label: string;
  sample: string; // redacted snippet for display
}

export interface PIIScanResult {
  hasPII: boolean;
  matches: PIIMatch[];
  summary: string;
}

// ── Pattern definitions ─────────────────────────────────────────────────────

const PII_PATTERNS: { type: string; label: string; regex: RegExp }[] = [
  {
    type: 'ssn',
    label: 'Social Security Number',
    regex: /\b\d{3}[-–—.\s]?\d{2}[-–—.\s]?\d{4}\b/g,
  },
  {
    type: 'student_id',
    label: 'Student ID Number',
    regex: /\b(?:student\s*(?:id|#|number|no\.?)\s*[:;]?\s*\d{5,12})\b/gi,
  },
  {
    type: 'dob',
    label: 'Date of Birth',
    regex: /\b(?:d\.?o\.?b\.?|date\s+of\s+birth|birth\s*date)\s*[:;]?\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi,
  },
  {
    type: 'gpa',
    label: 'GPA / Academic Record',
    regex: /\b(?:gpa|grade\s*point\s*average|cumulative\s*gpa)\s*[:;]?\s*\d\.\d{1,2}\b/gi,
  },
  {
    type: 'financial_aid',
    label: 'Financial Aid / FAFSA Data',
    regex: /\b(?:fafsa|efc|expected\s+family\s+contribution|financial\s+aid\s+(?:award|package))\s*[:;]?\s*\$?\d/gi,
  },
  {
    type: 'credit_card',
    label: 'Credit Card Number',
    regex: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6(?:011|5\d{2}))[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  },
  {
    type: 'driver_license',
    label: "Driver's License Number",
    regex: /\b(?:driver'?s?\s*license|dl)\s*(?:#|number|no\.?)?\s*[:;]?\s*[A-Z]?\d{5,12}\b/gi,
  },
  {
    type: 'passport',
    label: 'Passport Number',
    regex: /\b(?:passport)\s*(?:#|number|no\.?)?\s*[:;]?\s*[A-Z0-9]{6,12}\b/gi,
  },
  {
    type: 'ferpa_record',
    label: 'FERPA-Protected Record Indicator',
    regex: /\b(?:transcript|education\s+record|disciplinary\s+record|enrollment\s+status)\s*[:;]?\s*.{3,}/gi,
  },
  {
    type: 'medical',
    label: 'Medical / Health Information',
    regex: /\b(?:diagnosis|medical\s+record|health\s+condition|disability\s+(?:status|accommodation))\s*[:;]?\s*.{3,}/gi,
  },
  {
    type: 'bulk_email',
    label: 'Bulk Personal Email Addresses',
    // Matches lines with 3+ email addresses (suggests a list)
    regex: /(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[\s,;]*){3,}/g,
  },
];

// ── File name patterns ──────────────────────────────────────────────────────

const SUSPICIOUS_FILE_NAMES: RegExp[] = [
  /student[_\-\s]?(?:record|list|roster|data|info)/i,
  /transcript/i,
  /fafsa/i,
  /financial[_\-\s]?aid[_\-\s]?(?:report|data|list)/i,
  /enrollment[_\-\s]?(?:list|data|roster)/i,
  /grade[_\-\s]?(?:report|book|sheet|data)/i,
  /disciplinary/i,
  /(?:ssn|social[_\-\s]?security)/i,
  /(?:employee|staff|payroll)[_\-\s]?(?:list|data|record)/i,
];

// ── Scan functions ──────────────────────────────────────────────────────────

function redact(text: string): string {
  if (text.length <= 8) return '***';
  return text.slice(0, 3) + '•••' + text.slice(-3);
}

export function scanText(text: string): PIIScanResult {
  const matches: PIIMatch[] = [];
  const seenTypes = new Set<string>();

  for (const pattern of PII_PATTERNS) {
    const found = text.match(pattern.regex);
    if (found && found.length > 0 && !seenTypes.has(pattern.type)) {
      seenTypes.add(pattern.type);
      matches.push({
        type: pattern.type,
        label: pattern.label,
        sample: redact(found[0]),
      });
    }
  }

  return {
    hasPII: matches.length > 0,
    matches,
    summary: matches.length > 0
      ? `Detected: ${matches.map((m) => m.label).join(', ')}`
      : '',
  };
}

export function scanFileName(fileName: string): PIIScanResult {
  const matches: PIIMatch[] = [];

  for (const pattern of SUSPICIOUS_FILE_NAMES) {
    if (pattern.test(fileName)) {
      matches.push({
        type: 'suspicious_filename',
        label: 'Suspicious File Name',
        sample: fileName,
      });
      break;
    }
  }

  return {
    hasPII: matches.length > 0,
    matches,
    summary: matches.length > 0
      ? `The file name "${fileName}" suggests it may contain protected student or personal data.`
      : '',
  };
}

/**
 * Read a File object as text (for text-based files) and scan for PII.
 * For binary files (images, etc.), only the file name is checked.
 */
export async function scanFile(file: File): Promise<PIIScanResult> {
  // Always check file name first
  const nameResult = scanFileName(file.name);

  // For text-parseable types, also scan content
  const textTypes = [
    'text/',
    'application/json',
    'application/csv',
    'text/csv',
    'application/xml',
    'text/xml',
    'application/vnd.openxmlformats', // docx/xlsx (we can read the raw XML)
  ];

  const isTextLike =
    textTypes.some((t) => file.type.startsWith(t)) ||
    /\.(txt|csv|json|xml|md|tsv|log)$/i.test(file.name);

  let contentResult: PIIScanResult = { hasPII: false, matches: [], summary: '' };

  if (isTextLike && file.size < 5 * 1024 * 1024) {
    // 5 MB limit for client-side text scan
    try {
      const text = await file.text();
      contentResult = scanText(text);
    } catch {
      // Silently skip if we can't read the file
    }
  }

  const allMatches = [...nameResult.matches, ...contentResult.matches];

  return {
    hasPII: allMatches.length > 0,
    matches: allMatches,
    summary: allMatches.length > 0
      ? allMatches.map((m) => m.label).join('; ')
      : '',
  };
}

/**
 * Convenience: scan multiple files at once.
 */
export async function scanFiles(files: File[]): Promise<PIIScanResult> {
  const results = await Promise.all(files.map(scanFile));
  const allMatches = results.flatMap((r) => r.matches);

  return {
    hasPII: allMatches.length > 0,
    matches: allMatches,
    summary: allMatches.length > 0
      ? [...new Set(allMatches.map((m) => m.label))].join('; ')
      : '',
  };
}
