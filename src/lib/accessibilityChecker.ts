// Accessibility Checker Utilities for Message Content

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion: string;
}

export interface AccessibilityResult {
  score: number;
  issues: AccessibilityIssue[];
  passed: string[];
}

// Check for accessibility issues in message content
export function checkAccessibility(content: string, channel: string = 'email'): AccessibilityResult {
  const issues: AccessibilityIssue[] = [];
  const passed: string[] = [];
  
  // Check for ALL CAPS sections
  const allCapsRegex = /\b[A-Z]{4,}\b/g;
  const allCapsMatches = content.match(allCapsRegex);
  if (allCapsMatches && allCapsMatches.length > 0) {
    issues.push({
      type: 'warning',
      category: 'Screen Reader',
      message: `Found ${allCapsMatches.length} ALL CAPS words: "${allCapsMatches.slice(0, 3).join('", "')}"${allCapsMatches.length > 3 ? '...' : ''}`,
      suggestion: 'Screen readers may spell out ALL CAPS words letter by letter. Use regular case instead.',
    });
  } else {
    passed.push('No problematic ALL CAPS text detected');
  }

  // Check for special characters that may not read well
  const specialChars = content.match(/[★☆✓✗✔✘➤►→←↑↓●○■□▪▫]/g);
  if (specialChars && specialChars.length > 0) {
    issues.push({
      type: 'warning',
      category: 'Screen Reader',
      message: `Found ${specialChars.length} special symbols that may not be read correctly`,
      suggestion: 'Replace decorative symbols with descriptive text or standard punctuation.',
    });
  } else {
    passed.push('No problematic special characters detected');
  }

  // Check for emoji overuse
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const emojis = content.match(emojiRegex);
  if (emojis && emojis.length > 3) {
    issues.push({
      type: 'warning',
      category: 'Screen Reader',
      message: `Found ${emojis.length} emojis. Screen readers announce each emoji by name.`,
      suggestion: 'Limit emoji use to 1-2 per message and place them at the end of sentences.',
    });
  } else if (emojis && emojis.length > 0) {
    passed.push(`${emojis.length} emojis found - acceptable amount`);
  } else {
    passed.push('No emojis to evaluate');
  }

  // Check for link text quality
  const linkPatterns = [
    /click here/gi,
    /read more/gi,
    /learn more/gi,
    /here/gi,
    /link/gi,
  ];
  
  let badLinkText = false;
  linkPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      badLinkText = true;
    }
  });
  
  if (badLinkText) {
    issues.push({
      type: 'error',
      category: 'Link Accessibility',
      message: 'Found vague link text like "click here" or "read more"',
      suggestion: 'Use descriptive link text that explains where the link goes (e.g., "View registration deadlines" instead of "Click here").',
    });
  } else {
    passed.push('No vague link text detected');
  }

  // Check for color-only information indicators
  const colorIndicators = /\b(red|green|blue|yellow|orange|purple)\s+(text|button|section|area|box)/gi;
  if (colorIndicators.test(content)) {
    issues.push({
      type: 'error',
      category: 'Color Blindness',
      message: 'Found references to color as the only way to identify information',
      suggestion: 'Don\'t rely on color alone to convey meaning. Add text labels or icons.',
    });
  } else {
    passed.push('No color-only information references detected');
  }

  // Check for adequate spacing indicators (multiple spaces/symbols)
  const spacingIssues = content.match(/\s{3,}|\.{4,}|-{4,}/g);
  if (spacingIssues) {
    issues.push({
      type: 'info',
      category: 'Formatting',
      message: 'Found unusual spacing or repeated characters used for visual formatting',
      suggestion: 'Use proper formatting instead of spaces or repeated characters. Screen readers may announce these.',
    });
  }

  // Check for phone number formatting
  const phonePattern = /\d{10}|\d{3}\d{3}\d{4}/g;
  const unformattedPhones = content.match(phonePattern);
  if (unformattedPhones) {
    issues.push({
      type: 'info',
      category: 'Phone Numbers',
      message: 'Found phone numbers that may not be properly formatted',
      suggestion: 'Format phone numbers with dashes or parentheses (e.g., 555-123-4567) for better readability.',
    });
  } else {
    passed.push('Phone numbers properly formatted (or none present)');
  }

  // Check for date formatting
  const ambiguousDates = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g;
  if (ambiguousDates.test(content)) {
    issues.push({
      type: 'info',
      category: 'Dates',
      message: 'Found dates in numeric format that may be ambiguous',
      suggestion: 'Use clear date formats like "January 15, 2025" instead of "1/15/25" for clarity.',
    });
  } else {
    passed.push('No ambiguous date formats detected');
  }

  // Check for abbreviations without explanation
  const abbreviations = content.match(/\b[A-Z]{2,5}\b/g);
  const commonAbbreviations = ['AM', 'PM', 'USA', 'US', 'UK', 'GPA', 'FAQ', 'ID', 'PDF', 'URL', 'OK'];
  const unknownAbbreviations = abbreviations?.filter(a => !commonAbbreviations.includes(a)) || [];
  
  if (unknownAbbreviations.length > 2) {
    issues.push({
      type: 'info',
      category: 'Abbreviations',
      message: `Found ${unknownAbbreviations.length} abbreviations that may need explanation`,
      suggestion: 'Define abbreviations on first use (e.g., "Financial Aid Office (FAO)").',
    });
  } else {
    passed.push('Abbreviation use is acceptable');
  }

  // SMS-specific checks
  if (channel === 'sms') {
    // Check for URLs in SMS (may be truncated)
    const urlPattern = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlPattern);
    if (urls) {
      const longUrls = urls.filter(u => u.length > 30);
      if (longUrls.length > 0) {
        issues.push({
          type: 'warning',
          category: 'SMS Links',
          message: 'Found long URLs that may be truncated or hard to read on mobile',
          suggestion: 'Use a URL shortener for SMS messages to improve readability.',
        });
      }
    }
  }

  // Calculate score (100 - deductions)
  const errorDeduction = issues.filter(i => i.type === 'error').length * 20;
  const warningDeduction = issues.filter(i => i.type === 'warning').length * 10;
  const infoDeduction = issues.filter(i => i.type === 'info').length * 5;
  
  const score = Math.max(0, 100 - errorDeduction - warningDeduction - infoDeduction);

  return {
    score,
    issues,
    passed,
  };
}

// Get score color
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-destructive';
}

// Get score label
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
}
