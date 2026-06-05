// Word-level diff for the Tyler Edit Tracker.
// Returns words removed (in original, not in final) and words added (in final, not in original).
// Casing/punctuation normalized; preserves first-seen original casing.

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function diffWords(original: string, final: string): { removed: string[]; added: string[] } {
  const o = new Map<string, number>();
  const f = new Map<string, number>();
  for (const w of tokenize(original)) o.set(w, (o.get(w) ?? 0) + 1);
  for (const w of tokenize(final)) f.set(w, (f.get(w) ?? 0) + 1);

  const removed: string[] = [];
  const added: string[] = [];

  for (const [w, count] of o) {
    const fc = f.get(w) ?? 0;
    if (count > fc) {
      for (let i = 0; i < count - fc; i++) removed.push(w);
    }
  }
  for (const [w, count] of f) {
    const oc = o.get(w) ?? 0;
    if (count > oc) {
      for (let i = 0; i < count - oc; i++) added.push(w);
    }
  }
  return { removed, added };
}

export function wordCount(text: string): number {
  return tokenize(text).length;
}
