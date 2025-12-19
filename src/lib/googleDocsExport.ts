/**
 * Opens content in a new Google Doc
 * Since Google Docs doesn't support pre-populating content via URL without OAuth,
 * we copy the content to clipboard and open a new doc for easy pasting.
 */
export async function openInGoogleDocs(content: string, title?: string): Promise<boolean> {
  try {
    // Copy content to clipboard
    await navigator.clipboard.writeText(content);
    
    // Open a new Google Doc
    // Using docs.new for the fastest new doc creation
    const url = 'https://docs.new';
    window.open(url, '_blank');
    
    return true;
  } catch (error) {
    console.error('Failed to open in Google Docs:', error);
    return false;
  }
}

/**
 * Formats content for Google Docs with optional metadata header
 */
export function formatForGoogleDocs(
  content: string, 
  options?: {
    title?: string;
    channel?: string;
    audience?: string;
    profile?: string;
    generatedAt?: Date;
  }
): string {
  const lines: string[] = [];
  
  if (options?.title) {
    lines.push(options.title);
    lines.push('='.repeat(options.title.length));
    lines.push('');
  }
  
  // Add metadata section
  const metadata: string[] = [];
  if (options?.channel) metadata.push(`Channel: ${options.channel}`);
  if (options?.audience) metadata.push(`Audience: ${options.audience}`);
  if (options?.profile) metadata.push(`Profile: ${options.profile}`);
  if (options?.generatedAt) {
    metadata.push(`Generated: ${options.generatedAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })}`);
  }
  
  if (metadata.length > 0) {
    lines.push(metadata.join(' | '));
    lines.push('-'.repeat(40));
    lines.push('');
  }
  
  lines.push(content);
  
  return lines.join('\n');
}
