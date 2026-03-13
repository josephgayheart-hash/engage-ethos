import { useCallback } from 'react';
import { scanText, scanFile, scanFiles, type PIIScanResult } from '@/lib/piiScanner';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook that wraps PII scanning with automatic toast alerts.
 * Returns scanner functions that return true when PII is detected (i.e. blocked).
 */
export function usePIIScanner() {
  const { toast } = useToast();

  const showPIIWarning = useCallback(
    (result: PIIScanResult) => {
      if (result.hasPII) {
        const types = [...new Set(result.matches.map((m) => m.label))];
        toast({
          title: '⚠️ Protected Information Detected',
          description: `This content appears to contain ${types.join(', ')}. Please remove any personally identifiable or FERPA-protected information before uploading.`,
          variant: 'destructive',
          duration: 8000,
        });
      }
    },
    [toast],
  );

  /** Scan plain text. Returns `true` if PII found (blocked). */
  const checkText = useCallback(
    (text: string): boolean => {
      const result = scanText(text);
      showPIIWarning(result);
      return result.hasPII;
    },
    [showPIIWarning],
  );

  /** Scan a single File. Returns `true` if PII found (blocked). */
  const checkFile = useCallback(
    async (file: File): Promise<boolean> => {
      const result = await scanFile(file);
      showPIIWarning(result);
      return result.hasPII;
    },
    [showPIIWarning],
  );

  /** Scan multiple Files. Returns `true` if any PII found (blocked). */
  const checkFiles = useCallback(
    async (files: File[]): Promise<boolean> => {
      const result = await scanFiles(files);
      showPIIWarning(result);
      return result.hasPII;
    },
    [showPIIWarning],
  );

  return { checkText, checkFile, checkFiles };
}
